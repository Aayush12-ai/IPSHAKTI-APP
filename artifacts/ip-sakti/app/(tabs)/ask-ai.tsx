import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {
  AppScreen,
  BrandHeader,
  HeaderActions,
  LanguagePill,
  QueryComposer,
  StatusBadge,
  SurfaceCard,
  styles,
} from '@/components/ip-sakti';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/hooks/useLanguage';
import { useMobileChat, useMobileMemoryCreate } from '@workspace/api-client-react';
import {
  getActiveProjectId,
  getResearchClientId,
  setActiveProjectId as setStoredActiveProjectId,
} from '@/lib/research-client';

type Message = { id: string; role: 'user' | 'assistant'; text?: string; projectId?: string };

const SUGGESTED_QUESTIONS = [
  'Is our formulation patentable or blocked by Section 3(p)?',
  'What are the Rule 158B clinical trial requirements for proprietary ASU?',
  'How do we file Form III clearance with the National Biodiversity Authority?',
  'Does our herbal drink qualify under FSSAI Ayurveda Aahar 2022?',
];


function MarkdownText({
  text,
  style,
  boldColor,
}: {
  text: string;
  style?: any;
  boldColor?: string;
}) {
  const colors = useColors();
  const effectiveBoldColor = boldColor || colors.foreground;

  // Split by bold (**...**), italic (*...*), inline code (`...`), and regular text
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);

  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const inner = part.slice(2, -2);
          return (
            <Text key={i} style={{ fontWeight: '800', color: effectiveBoldColor }}>
              {inner}
            </Text>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          const inner = part.slice(1, -1);
          return (
            <Text
              key={i}
              style={{
                fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                backgroundColor: colors.lavenderLight,
                color: colors.lavenderDeep,
                fontWeight: '700',
                fontSize: (style?.fontSize || 12.5) * 0.92,
              }}
            >
              {` ${inner} `}
            </Text>
          );
        }
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
          const inner = part.slice(1, -1);
          return (
            <Text key={i} style={{ fontStyle: 'italic' }}>
              {inner}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

function FormattedSection({
  rawTitle,
  bodyLines,
}: {
  rawTitle: string;
  bodyLines: string[];
}) {
  const colors = useColors();
  const title = rawTitle.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
  const lower = title.toLowerCase();

  const isExecutive =
    lower.includes('executive') || lower.includes('verdict') || lower.includes('determination') || lower.includes('assessment');
  const isRegulatory =
    lower.includes('statutory') || lower.includes('regulatory') || lower.includes('pathway') || lower.includes('law');
  const isIp =
    lower.includes('ip') || lower.includes('patent') || lower.includes('section 3') || lower.includes('tkdl');
  const isSteps =
    lower.includes('step') || lower.includes('action') || lower.includes('roadmap') || lower.includes('recommend');
  const isSources =
    lower.includes('source') || lower.includes('citation') || lower.includes('reference') || lower.includes('statutory source');

  const iconName: React.ComponentProps<typeof Feather>['name'] = isExecutive
    ? 'shield'
    : isSources
      ? 'book-open'
      : isRegulatory
        ? 'layers'
        : isIp
          ? 'award'
          : isSteps
            ? 'check-circle'
            : 'info';

  const iconColor = isSources
    ? colors.lavenderDeep
    : isIp
      ? colors.pink
      : isExecutive
        ? colors.lavenderDeep
        : colors.lavenderDeep;
  const iconBg = isSources ? colors.lavenderLight : isIp ? colors.pinkLight : colors.lavenderLight;

  if (isExecutive) {
    return (
      <View
        style={{
          backgroundColor: colors.lavenderLight,
          borderRadius: 12,
          padding: 12,
          borderLeftWidth: 3.5,
          borderLeftColor: colors.lavenderDeep,
          borderWidth: 1,
          borderColor: colors.lavenderBorder,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <Feather name={iconName} size={13} color={colors.lavenderDeep} />
          <Text style={{ color: colors.lavenderDeep, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' }}>
            {title || 'KEY DETERMINATION'}
          </Text>
        </View>
        {bodyLines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;
          return (
            <MarkdownText
              key={idx}
              text={trimmed}
              style={{ color: colors.foreground, fontSize: 12.5, lineHeight: 18.5, fontWeight: '500', marginTop: idx > 0 ? 4 : 0 }}
              boldColor={colors.lavenderDeep}
            />
          );
        })}
      </View>
    );
  }

  if (isSources) {
    return (
      <View
        style={{
          padding: 11,
          borderRadius: 12,
          backgroundColor: colors.canvas,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: colors.lavenderLight, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="book-open" size={11} color={colors.lavenderDeep} />
            </View>
            <Text style={{ color: colors.lavenderDeep, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              STATUTORY & PRIMARY CITATIONS
            </Text>
          </View>
          <StatusBadge label="Verified" tone="lavender" />
        </View>

        <View style={{ gap: 5 }}>
          {bodyLines.map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) return null;

            const bulletMatch = trimmed.match(/^[-*•\d.]+\s*(.*)$/);
            const content = bulletMatch ? bulletMatch[1] : trimmed;
            const colonIndex = content.indexOf(':');

            if (colonIndex !== -1 && (content.startsWith('**') || content.includes('**'))) {
              const sourceName = content.slice(0, colonIndex).replace(/\*\*/g, '').trim();
              const citationDetails = content.slice(colonIndex + 1).trim();
              return (
                <View
                  key={idx}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 9,
                    borderRadius: 8,
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.lavenderDeep, fontSize: 10.5, fontWeight: '800' }}>
                    {sourceName}
                  </Text>
                  <MarkdownText
                    text={citationDetails}
                    style={{ color: colors.foreground, fontSize: 11.5, lineHeight: 16, marginTop: 1, fontWeight: '500' }}
                  />
                </View>
              );
            }

            return (
              <View key={idx} style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start', paddingLeft: 2 }}>
                <Feather name="check-circle" size={11} color={colors.lavenderDeep} style={{ marginTop: 2.5 }} />
                <MarkdownText
                  text={content}
                  style={{ color: colors.foreground, fontSize: 11.5, lineHeight: 16, flex: 1 }}
                />
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View>
      {title ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 7 }}>
          <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name={iconName} size={11} color={iconColor} />
          </View>
          <Text style={{ color: colors.lavenderDeep, fontSize: 12.5, fontWeight: '800' }}>
            {title}
          </Text>
        </View>
      ) : null}

      <View style={{ gap: 5 }}>
        {bodyLines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;

          // Horizontal rule
          if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
            return (
              <View
                key={idx}
                style={{
                  height: 1,
                  backgroundColor: colors.border,
                  marginVertical: 6,
                }}
              />
            );
          }

          // Numbered list item (e.g. 1. Step description)
          const stepMatch = trimmed.match(/^(\d+)\.\s*(.*)$/);
          if (stepMatch) {
            return (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  gap: 8,
                  alignItems: 'flex-start',
                  paddingVertical: 4,
                  paddingHorizontal: 6,
                }}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: colors.lavenderLight,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                  }}
                >
                  <Text style={{ color: colors.lavenderDeep, fontSize: 10, fontWeight: '800' }}>
                    {stepMatch[1]}
                  </Text>
                </View>
                <MarkdownText
                  text={stepMatch[2]}
                  style={{ color: colors.foreground, fontSize: 12.5, lineHeight: 18, flex: 1, fontWeight: '500' }}
                />
              </View>
            );
          }

          // Bullet item with bold key (e.g. - **Section 3(p)**: Status)
          const bulletMatch = trimmed.match(/^[-*•]\s*(.*)$/);
          if (bulletMatch) {
            const content = bulletMatch[1];
            const colonIndex = content.indexOf(':');
            if (colonIndex !== -1 && content.startsWith('**')) {
              const keyPart = content.slice(0, colonIndex).replace(/\*\*/g, '').trim();
              const valPart = content.slice(colonIndex + 1).trim();
              return (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    gap: 6,
                    alignItems: 'flex-start',
                    paddingVertical: 2.5,
                    paddingLeft: 4,
                  }}
                >
                  <Text style={{ color: colors.pink, fontSize: 13, lineHeight: 18 }}>•</Text>
                  <Text style={{ flex: 1, fontSize: 12.5, lineHeight: 18 }}>
                    <Text style={{ color: colors.lavenderDeep, fontWeight: '800' }}>{keyPart}: </Text>
                    <MarkdownText text={valPart} style={{ color: colors.foreground, fontWeight: '400' }} />
                  </Text>
                </View>
              );
            }

            return (
              <View key={idx} style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start', paddingVertical: 2.5, paddingLeft: 4 }}>
                <Text style={{ color: colors.pink, fontSize: 13, lineHeight: 18 }}>•</Text>
                <MarkdownText
                  text={content}
                  style={{ color: colors.foreground, fontSize: 12.5, lineHeight: 18, flex: 1, fontWeight: '400' }}
                />
              </View>
            );
          }

          // Regular paragraph
          return (
            <MarkdownText
              key={idx}
              text={trimmed}
              style={{ color: colors.foreground, fontSize: 12.5, lineHeight: 19, fontWeight: '400' }}
            />
          );
        })}
      </View>
    </View>
  );
}

function FormattedAiMessage({ text }: { text: string }) {
  const colors = useColors();
  // Parse response by section headings (### ...)
  const lines = text.split('\n');
  const sections: Array<{ title: string; body: string[] }> = [];
  let currentTitle = '';
  let currentBody: string[] = [];

  for (const line of lines) {
    if (line.startsWith('###') || line.startsWith('##')) {
      if (currentTitle || currentBody.length > 0) {
        sections.push({ title: currentTitle, body: currentBody });
      }
      currentTitle = line;
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  if (currentTitle || currentBody.length > 0) {
    sections.push({ title: currentTitle, body: currentBody });
  }

  return (
    <View style={{ gap: 0 }}>
      {sections.map((sec, i) => (
        <React.Fragment key={i}>
          {i > 0 ? (
            <View
              style={{
                height: 1,
                backgroundColor: colors.border,
                marginVertical: 12,
                opacity: 0.8,
              }}
            />
          ) : null}
          <FormattedSection rawTitle={sec.title} bodyLines={sec.body} />
        </React.Fragment>
      ))}
    </View>
  );
}


export default function AskAIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, language } = useLanguage();
  const router = useRouter();
  const params = useLocalSearchParams<{ draft?: string; projectId?: string }>();
  const [input, setInput] = useState(typeof params.draft === 'string' ? params.draft : '');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant' },
  ]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    typeof params.projectId === 'string' ? params.projectId : null,
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [savedMessageIds, setSavedMessageIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const chatMutation = useMobileChat();
  const saveMemoryMutation = useMobileMemoryCreate();

  useEffect(() => {
    void Promise.all([getResearchClientId(), getActiveProjectId()]).then(
      ([storedClientId, storedProjectId]) => {
        setClientId(storedClientId);
        if (!activeProjectId && !params.projectId) {
          setActiveProjectId(storedProjectId);
        }
      },
    );
  }, [activeProjectId, params.projectId]);

  useEffect(() => {
    if (typeof params.draft === 'string' && params.draft.trim().length > 0 && messages.length === 1 && clientId) {
      void sendQuery(params.draft.trim());
    }
  }, [params.draft, clientId]);

  // Auto-scroll down whenever new messages are added or AI is evaluating
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
    return () => clearTimeout(timer);
  }, [messages, chatMutation.isPending]);

  const sendQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || !clientId || chatMutation.isPending) return;
    const messageId = `${Date.now()}`;
    setMessages((prev) => [...prev, { id: messageId, role: 'user', text: trimmed }]);
    setInput('');
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const response = await chatMutation.mutateAsync({
        data: {
          question: language !== 'en' ? `[Preferred Language: ${language}] ${trimmed}` : trimmed,
          clientId,
          projectId: activeProjectId ?? undefined,
          sessionId: sessionId ?? undefined,
        },
      });
      setSessionId(response.sessionId);
      setActiveProjectId(response.projectId);
      await setStoredActiveProjectId(response.projectId);
      setMessages((prev) => [
        ...prev,
        {
          id: `${messageId}-reply`,
          role: 'assistant',
          text: response.answer,
          projectId: response.projectId,
        },
      ]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${messageId}-error`,
          role: 'assistant',
          text: 'I could not reach the IP-SAKTI AI assistant. Please check your backend server connection and try again.',
        },
      ]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const send = () => {
    void sendQuery(input);
  };

  const saveToResearch = async (message: Message) => {
    if (!clientId || !message.text || savedMessageIds.includes(message.id)) return;

    // Instant optimistic feedback
    setSavedMessageIds((prev) => [...prev, message.id]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const effectiveProjectId = message.projectId || activeProjectId || 'default';
      const cleanTitle =
        message.text
          .split('\n')[0]
          .replace(/^[#*\s-]+/, '')
          .slice(0, 50)
          .trim() || 'Saved AI Guidance';

      await saveMemoryMutation.mutateAsync({
        projectId: effectiveProjectId,
        data: {
          clientId,
          title: cleanTitle,
          finding: message.text,
          entities: [],
          sources: [],
        },
      });
    } catch (err) {
      console.warn('Memory save background notice:', err);
    }
  };

  const copyMessage = async (message: Message) => {
    if (!message.text) return;
    await Clipboard.setStringAsync(message.text);
    setCopiedId(message.id);
    Haptics.selectionAsync();
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.canvas }}
    >
      <View style={{ flex: 1 }}>
        {/* Fixed Header */}
        <View
          style={{
            paddingTop: insets.top + 10,
            paddingHorizontal: 16,
            paddingBottom: 10,
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            zIndex: 10,
          }}
        >
          <BrandHeader action={<HeaderActions />} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: -4 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.pageTitle, { color: colors.foreground, fontSize: 21, lineHeight: 26 }]}>
                {t('askAiTitle', 'Ask IP-SAKTI')}
              </Text>
              <Text style={[styles.pageSubtitle, { color: colors.inkSubtle, fontSize: 11.5, lineHeight: 16, marginTop: 1 }]}>
                {t('askAiSubtitle', 'Evidence-grounded Ayurvedic regulatory & patent intelligence.')}
              </Text>
            </View>
            {messages.length > 1 ? (
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setMessages([{ id: 'welcome', role: 'assistant' }]);
                }}
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 9,
                    paddingVertical: 5,
                    borderRadius: 8,
                    backgroundColor: colors.lavenderLight,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Feather name="rotate-ccw" size={11} color={colors.lavenderDeep} />
                <Text style={{ color: colors.lavenderDeep, fontSize: 10.5, fontWeight: '700' }}>Reset</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Scrollable Chat Message Stream with Auto-Scroll to Response */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
        >
          {messages.map((message) =>
            message.role === 'user' ? (
              <View
                key={message.id}
                style={{
                  alignSelf: 'flex-end',
                  maxWidth: '88%',
                  backgroundColor: colors.lavenderDeep,
                  borderRadius: 18,
                  borderBottomRightRadius: 4,
                  paddingHorizontal: 15,
                  paddingVertical: 12,
                  marginBottom: 14,
                  borderWidth: 1,
                  borderColor: colors.lavenderBorder,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 13.5, lineHeight: 20, fontWeight: '500' }}>
                  {message.text}
                </Text>
              </View>
            ) : message.id === 'welcome' ? (
              <View key={message.id} style={{ marginBottom: 14 }}>
                <SurfaceCard style={{ borderColor: colors.lavenderBorder, backgroundColor: colors.card }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor: colors.lavenderLight,
                        borderRadius: 9,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Feather name="shield" size={14} color={colors.lavenderDeep} />
                    </View>
                    <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '800' }}>
                      {t('welcomeHeader', 'Namaste! I am your IP-SAKTI Sahayak.')}
                    </Text>
                  </View>
                  <Text style={{ color: colors.inkSubtle, fontSize: 12, lineHeight: 18 }}>
                    {t('welcomeMessage', 'Ask any question regarding Ayurvedic patentability under Section 3(p)/3(d), Rule 158B licensing, or NBA Access and Benefit Sharing.')}
                  </Text>
                </SurfaceCard>

                {/* Suggested Starters */}
                <View style={{ marginTop: 12, gap: 6 }}>
                  <Text style={{ color: colors.inkSubtle, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 }}>
                    QUICK EXPLORATION STARTERS
                  </Text>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <Pressable
                      key={q}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setInput(q);
                      }}
                      style={({ pressed }) => [
                        {
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          paddingVertical: 9,
                          paddingHorizontal: 12,
                          borderRadius: 12,
                          backgroundColor: colors.card,
                          borderWidth: 1,
                          borderColor: colors.border,
                          opacity: pressed ? 0.75 : 1,
                        },
                      ]}
                    >
                      <Feather name="corner-down-right" size={12} color={colors.pink} />
                      <Text style={{ color: colors.foreground, fontSize: 11.5, fontWeight: '600', flex: 1 }}>
                        {q}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <SurfaceCard
                key={message.id}
                style={{
                  marginBottom: 14,
                  padding: 15,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                }}
              >
                {/* Header Badge */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: colors.lavenderLight, alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name="shield" size={13} color={colors.lavenderDeep} />
                    </View>
                    <Text style={{ color: colors.lavenderDeep, fontSize: 11.5, fontWeight: '800' }}>
                      IP-SAKTI ASSESSMENT
                    </Text>
                  </View>
                  <StatusBadge label="Grounded" tone="lavender" />
                </View>

                {/* Rich Formatted Message with Proper Separation */}
                {message.text ? <FormattedAiMessage text={message.text} /> : null}

                {/* Footer Actions (Clean, Uncluttered, with On-Demand Evidence Chain) */}
                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    marginTop: 14,
                    paddingTop: 11,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {/* On-Demand Evidence Chain Button */}
                    <Pressable
                      onPress={() => {
                        Haptics.selectionAsync();
                        router.push({
                          pathname: '/evidence',
                          params: {
                            query:
                              message.text?.includes('Curcuma') || message.text?.includes('Turmeric') || message.text?.includes('Curcumin')
                                ? 'Curcumin + Piperine Complex'
                                : message.text?.includes('Brahmi') || message.text?.includes('Bacopa')
                                  ? 'Brahmi + Shankhpushpi Rasayana'
                                  : 'Ashwagandha + Pippali Formulation',
                          },
                        });
                      }}
                      style={({ pressed }) => [
                        {
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 5,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                          backgroundColor: colors.surfaceMuted,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Feather name="git-commit" size={12} color={colors.lavenderDeep} />
                      <Text style={{ color: colors.lavenderDeep, fontSize: 11, fontWeight: '700' }}>
                        {t('traceEvidence', 'Evidence Chain')}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => void saveToResearch(message)}
                      disabled={saveMemoryMutation.isPending || savedMessageIds.includes(message.id)}
                      style={({ pressed }) => [
                        {
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 5,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                          opacity: pressed || saveMemoryMutation.isPending ? 0.6 : 1,
                        },
                      ]}
                    >
                      <Feather
                        name={savedMessageIds.includes(message.id) ? 'check-circle' : 'bookmark'}
                        size={12}
                        color={savedMessageIds.includes(message.id) ? colors.success : colors.lavenderDeep}
                      />
                      <Text
                        style={{
                          color: savedMessageIds.includes(message.id) ? colors.success : colors.lavenderDeep,
                          fontSize: 11,
                          fontWeight: '700',
                        }}
                      >
                        {savedMessageIds.includes(message.id) ? t('savedToResearch', 'Saved') : t('saveFinding', 'Save')}
                      </Text>
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={() => void copyMessage(message)}
                    style={({ pressed }) => [
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        backgroundColor: copiedId === message.id ? colors.lavenderLight : 'transparent',
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Feather
                      name={copiedId === message.id ? 'check' : 'copy'}
                      size={12}
                      color={copiedId === message.id ? colors.lavenderDeep : colors.inkSubtle}
                    />
                    <Text style={{ color: copiedId === message.id ? colors.lavenderDeep : colors.inkSubtle, fontSize: 11, fontWeight: '600' }}>
                      {copiedId === message.id ? t('copied', 'Copied') : t('copy', 'Copy')}
                    </Text>
                  </Pressable>
                </View>
              </SurfaceCard>
            ),
          )}

          {chatMutation.isPending && (
            <SurfaceCard
              style={{
                marginBottom: 14,
                padding: 14,
                borderColor: colors.lavenderBorder,
                backgroundColor: colors.lavenderLight,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator size="small" color={colors.lavenderDeep} />
                <Text style={{ color: colors.lavenderDeep, fontSize: 12.5, fontWeight: '700' }}>
                  IP-SAKTI is evaluating patent literature & statutory databases...
                </Text>
              </View>
            </SurfaceCard>
          )}

          <View style={{ height: 6 }} />
          <Text style={{ color: colors.inkSubtle, fontSize: 9.5, textAlign: 'center', lineHeight: 14, marginHorizontal: 20 }}>
            IP-SAKTI AI provides decision support grounded in Indian statutes — verify with a registered patent attorney for filing.
          </Text>
        </ScrollView>

        {/* Modern Fixed Bottom Chat Composer (Cleanly Docked Above Tab Bar) */}
        <View
          style={{
            paddingHorizontal: 12,
            paddingTop: 8,
            paddingBottom: 8,
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.04,
            shadowRadius: 3,
            elevation: 4,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: 8,
              backgroundColor: colors.canvas,
              borderRadius: 22,
              borderWidth: 1.5,
              borderColor: input.trim().length > 0 ? colors.lavender : colors.border,
              paddingLeft: 14,
              paddingRight: 6,
              paddingVertical: 6,
              minHeight: 46,
            }}
          >
            <TextInput
              testID="chat-input"
              value={input}
              onChangeText={setInput}
              placeholder={t('chatInputPlaceholder', 'Ask a follow-up or specify a formulation...')}
              placeholderTextColor={colors.inkSubtle}
              multiline
              maxLength={1000}
              style={{
                flex: 1,
                fontSize: 13.5,
                lineHeight: 19,
                color: colors.foreground,
                maxHeight: 110,
                paddingTop: Platform.OS === 'ios' ? 6 : 4,
                paddingBottom: Platform.OS === 'ios' ? 6 : 4,
                textAlignVertical: 'center',
              }}
              returnKeyType="send"
              onSubmitEditing={() => {
                if (input.trim()) {
                  send();
                }
              }}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              {input.trim().length > 0 && (
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setInput('');
                  }}
                  style={({ pressed }) => [
                    {
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Feather name="x" size={14} color={colors.inkSubtle} />
                </Pressable>
              )}

              <Pressable
                testID="send-chat-button"
                onPress={send}
                disabled={!input.trim() || chatMutation.isPending}
                style={({ pressed }) => [
                  {
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: input.trim() && !chatMutation.isPending ? colors.lavenderDeep : colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.8 : !input.trim() || chatMutation.isPending ? 0.5 : 1,
                  },
                ]}
              >
                {chatMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Feather name="arrow-up" size={18} color="#FFFFFF" />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
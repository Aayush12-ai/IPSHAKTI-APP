import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  Text,
  View,
} from 'react-native';
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

function FormattedSection({
  rawTitle,
  bodyLines,
}: {
  rawTitle: string;
  bodyLines: string[];
}) {
  const colors = useColors();
  const router = useRouter();
  const title = rawTitle.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
  const lower = title.toLowerCase();

  const isExecutive =
    lower.includes('executive') || lower.includes('verdict') || lower.includes('assessment');
  const isRegulatory =
    lower.includes('statutory') || lower.includes('regulatory') || lower.includes('pathway') || lower.includes('law');
  const isIp =
    lower.includes('ip') || lower.includes('patent') || lower.includes('section 3') || lower.includes('tkdl');
  const isSteps =
    lower.includes('step') || lower.includes('action') || lower.includes('roadmap') || lower.includes('recommend');
  const isSources =
    lower.includes('source') || lower.includes('citation') || lower.includes('reference') || lower.includes('statutory source');

  const iconName: React.ComponentProps<typeof Feather>['name'] = isExecutive
    ? 'zap'
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
        ? colors.pink
        : colors.lavenderDeep;
  const iconBg = isSources ? colors.lavenderLight : isIp ? colors.pinkLight : colors.lavenderLight;

  if (isExecutive) {
    return (
      <View
        style={{
          backgroundColor: colors.lavenderLight,
          borderRadius: 14,
          padding: 13,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.lavenderBorder,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 }}>
          <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name={iconName} size={12} color={colors.lavenderDeep} />
          </View>
          <Text style={{ color: colors.lavenderDeep, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' }}>
            {title}
          </Text>
        </View>
        {bodyLines.map((line, idx) => (
          <Text key={idx} style={{ color: colors.foreground, fontSize: 13, lineHeight: 19, fontWeight: '600' }}>
            {line.trim()}
          </Text>
        ))}
      </View>
    );
  }

  if (isSources) {
    return (
      <View
        style={{
          marginTop: 6,
          marginBottom: 12,
          padding: 12,
          borderRadius: 13,
          backgroundColor: colors.canvas,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: colors.lavenderLight, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="book-open" size={12} color={colors.lavenderDeep} />
            </View>
            <Text style={{ color: colors.lavenderDeep, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' }}>
              VERIFIED STATUTORY & PRIMARY SOURCES
            </Text>
          </View>
          <StatusBadge label="Cited" tone="lavender" />
        </View>

        <View style={{ gap: 6 }}>
          {bodyLines.map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) return null;

            const bulletMatch = trimmed.match(/^[-*•\d.]+\s*(.*)$/);
            const content = bulletMatch ? bulletMatch[1] : trimmed;
            const colonIndex = content.indexOf(':');

            if (colonIndex !== -1 && content.startsWith('**')) {
              const sourceName = content.slice(0, colonIndex).replace(/\*\*/g, '').trim();
              const citationDetails = content.slice(colonIndex + 1).trim();
              return (
                <View
                  key={idx}
                  style={{
                    padding: 8,
                    borderRadius: 9,
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.lavenderDeep, fontSize: 10, fontWeight: '800' }}>
                    {sourceName}
                  </Text>
                  <Text style={{ color: colors.foreground, fontSize: 11, lineHeight: 15, marginTop: 2, fontWeight: '500' }}>
                    {citationDetails.replace(/\*\*/g, '')}
                  </Text>
                </View>
              );
            }

            return (
              <View key={idx} style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start', paddingLeft: 4 }}>
                <Feather name="check-circle" size={12} color={colors.lavenderDeep} style={{ marginTop: 2 }} />
                <Text style={{ color: colors.foreground, fontSize: 11.5, lineHeight: 16, flex: 1 }}>
                  {content.replace(/\*\*/g, '')}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 14 }}>
      {title ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8, marginTop: 4 }}>
          <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name={iconName} size={12} color={iconColor} />
          </View>
          <Text style={{ color: colors.foreground, fontSize: 12.5, fontWeight: '800' }}>
            {title}
          </Text>
        </View>
      ) : null}

      <View style={{ gap: 6 }}>
        {bodyLines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;

          // Numbered list item
          const stepMatch = trimmed.match(/^(\d+)\.\s*(.*)$/);
          if (stepMatch) {
            return (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'flex-start',
                  paddingVertical: 7,
                  paddingHorizontal: 10,
                  borderRadius: 11,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    backgroundColor: colors.lavenderLight,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                  }}
                >
                  <Text style={{ color: colors.lavenderDeep, fontSize: 10.5, fontWeight: '800' }}>
                    {stepMatch[1]}
                  </Text>
                </View>
                <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18, flex: 1, fontWeight: '500' }}>
                  {stepMatch[2]}
                </Text>
              </View>
            );
          }

          // Bullet item with bold key (e.g. - **Key**: Value)
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
                    paddingVertical: 7,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.lavenderDeep, fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                    {keyPart}
                  </Text>
                  <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 17, marginTop: 2, fontWeight: '500' }}>
                    {valPart}
                  </Text>
                </View>
              );
            }

            return (
              <View key={idx} style={{ flexDirection: 'row', gap: 7, alignItems: 'flex-start', paddingLeft: 4 }}>
                <Text style={{ color: colors.pink, fontSize: 12, lineHeight: 18 }}>•</Text>
                <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18, flex: 1, fontWeight: '500' }}>
                  {content.replace(/\*\*/g, '')}
                </Text>
              </View>
            );
          }

          // Regular paragraph
          return (
            <Text key={idx} style={{ color: colors.foreground, fontSize: 12.5, lineHeight: 18.5 }}>
              {trimmed.replace(/\*\*/g, '')}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

function FormattedAiMessage({ text }: { text: string }) {
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
    <View>
      {sections.map((sec, i) => (
        <FormattedSection key={i} rawTitle={sec.title} bodyLines={sec.body} />
      ))}
    </View>
  );
}

export default function AskAIScreen() {
  const colors = useColors();
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

  const sendQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || !clientId || chatMutation.isPending) return;
    const messageId = `${Date.now()}`;
    setMessages((prev) => [...prev, { id: messageId, role: 'user', text: trimmed }]);
    setInput('');

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
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${messageId}-error`,
          role: 'assistant',
          text: 'I could not reach the IP-SAKTI AI assistant. Please check your backend server connection and try again.',
        },
      ]);
    }
  };

  const send = () => {
    void sendQuery(input);
  };

  const saveToResearch = async (message: Message) => {
    if (!clientId || !message.projectId || !message.text || savedMessageIds.includes(message.id)) return;

    await saveMemoryMutation.mutateAsync({
      projectId: message.projectId,
      data: {
        clientId,
        title: 'Saved AI Guidance',
        finding: message.text,
        entities: [],
        sources: [],
      },
    });
    setSavedMessageIds((prev) => [...prev, message.id]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const copyMessage = async (message: Message) => {
    if (!message.text) return;
    await Clipboard.setStringAsync(message.text);
    setCopiedId(message.id);
    Haptics.selectionAsync();
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={0} style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppScreen>
        <BrandHeader action={<HeaderActions />} />
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>{t('askAiTitle', 'Ask IP-SAKTI')}</Text>
        <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>
          {t('askAiSubtitle', 'Evidence-grounded Ayurvedic regulatory & patent intelligence.')}
        </Text>

        <View style={{ marginTop: 20 }}>
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
                  marginBottom: 12,
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
                    {/* On-Demand Evidence Chain Button - ONLY appears as a clean option */}
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

                    {message.projectId ? (
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
                    ) : null}
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

          {chatMutation.isPending ? (
            <SurfaceCard style={{ marginBottom: 10, padding: 16, backgroundColor: colors.lavenderLight, borderColor: colors.lavenderBorder }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Feather name="loader" size={16} color={colors.lavenderDeep} />
                <Text style={{ color: colors.lavenderDeep, fontSize: 13, fontWeight: '700' }}>
                  Consulting Ayurvedic IP & Regulatory Knowledge Base…
                </Text>
              </View>
            </SurfaceCard>
          ) : null}
        </View>

        <View style={{ height: 16 }} />
        <Text style={{ color: colors.inkSubtle, fontSize: 10, textAlign: 'center', lineHeight: 15, marginHorizontal: 20 }}>
          IP-SAKTI AI provides decision support grounded in Indian statutes — verify with a registered patent attorney for filing.
        </Text>

        <View style={{ marginTop: 12 }}>
          <QueryComposer
            value={input}
            onChangeText={setInput}
            onSubmit={send}
            placeholder="Ask a follow-up or specify a formulation..."
          />
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}
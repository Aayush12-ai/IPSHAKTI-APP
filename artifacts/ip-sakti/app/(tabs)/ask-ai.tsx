import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  AppScreen,
  BrandHeader,
  EvidenceCard,
  LanguagePill,
  QueryComposer,
  SectionTitle,
  StatusBadge,
  SurfaceCard,
  styles,
} from '@/components/ip-sakti';
import { useColors } from '@/hooks/useColors';
import { useMobileChat } from '@workspace/api-client-react';

type Message = { id: string; role: 'user' | 'assistant'; text?: string };

function StructuredResponse() {
  const colors = useColors();
  return (
    <SurfaceCard style={{ marginTop: 10, padding: 15 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '700' }}>IP SAKTI assessment</Text>
        <StatusBadge label="Guidance" tone="success" />
      </View>
      {[
        ['Likely classification', 'Proprietary Ayurvedic formulation'],
        ['IP assessment', 'Traditional knowledge may affect novelty.'],
        ['Key risk', 'Prior-art and knowledge-source overlap.'],
        ['Recommended next step', 'Conduct a prior-art and TK source search.'],
      ].map(([label, value]) => (
        <View key={label} style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 11 }}>
          <Text style={{ color: colors.inkSubtle, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 }}>{label}</Text>
          <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 19, marginTop: 4 }}>{value}</Text>
        </View>
      ))}
      <SectionTitle title="Evidence" />
      <EvidenceCard title="Patents Act, 1970" section="Section 3(p)" version="Current" />
      <EvidenceCard title="Traditional Knowledge Digital Library" section="Ashwagandha references" version="2024" />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        <Pressable style={[{ flex: 1, borderRadius: 11, padding: 11, alignItems: 'center' }, { backgroundColor: colors.sageLight }]}><Text style={{ color: colors.forest, fontSize: 11, fontWeight: '700' }}>View evidence</Text></Pressable>
        <Pressable style={[{ flex: 1, borderRadius: 11, padding: 11, alignItems: 'center' }, { borderWidth: 1, borderColor: colors.border }]}><Text style={{ color: colors.foreground, fontSize: 11, fontWeight: '700' }}>Explore decision</Text></Pressable>
      </View>
    </SurfaceCard>
  );
}

export default function AskAIScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ draft?: string }>();
  const [input, setInput] = useState(params.draft ?? '');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant' },
  ]);
  const chatMutation = useMobileChat();

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || chatMutation.isPending) return;
    const messageId = `${Date.now()}`;
    setMessages((prev) => [...prev, { id: messageId, role: 'user', text: trimmed }]);
    setInput('');

    try {
      const response = await chatMutation.mutateAsync({ data: { question: trimmed } });
      setMessages((prev) => [...prev, { id: `${messageId}-reply`, role: 'assistant', text: response.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${messageId}-error`,
          role: 'assistant',
          text: 'I could not reach the AI assistant. Please try again in a moment.',
        },
      ]);
    }
  };
  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={0} style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppScreen>
        <BrandHeader action={<LanguagePill />} />
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Ask IP SAKTI</Text>
        <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>Evidence-grounded guidance for Ayurvedic innovation.</Text>
        <View style={{ marginTop: 22 }}>
          {messages.map((message) =>
            message.role === 'user' ? (
              <View key={message.id} style={{ alignSelf: 'flex-end', maxWidth: '88%', backgroundColor: colors.forest, borderRadius: 17, borderBottomRightRadius: 5, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 10 }}>
                <Text style={{ color: colors.primaryForeground, fontSize: 13, lineHeight: 19 }}>{message.text}</Text>
              </View>
            ) : message.id === 'welcome' ? (
              <View key={message.id} style={{ flexDirection: 'row', gap: 9, marginBottom: 5 }}>
                <View style={{ width: 27, height: 27, backgroundColor: colors.saffronLight, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}><Feather name="zap" size={14} color={colors.warning} /></View>
                <Text style={{ color: colors.inkSubtle, fontSize: 12, paddingTop: 5 }}>Here’s a structured view of your question.</Text>
              </View>
            ) : (
              <SurfaceCard key={message.id} style={{ marginBottom: 10, padding: 14 }}>
                <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20 }}>{message.text}</Text>
              </SurfaceCard>
            ),
          )}
          {chatMutation.isPending ? (
            <SurfaceCard style={{ marginBottom: 10, padding: 14 }}>
              <Text style={{ color: colors.inkSubtle, fontSize: 13 }}>Reviewing your question…</Text>
            </SurfaceCard>
          ) : null}
        </View>
        <View style={{ height: 18 }} />
        <Text style={{ color: colors.inkSubtle, fontSize: 10, textAlign: 'center', lineHeight: 15, marginHorizontal: 20 }}>AI-generated guidance — not a substitute for professional legal advice.</Text>
        <View style={{ marginTop: 12 }}>
          <QueryComposer value={input} onChangeText={setInput} onSubmit={send} placeholder="Ask a follow-up..." />
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}
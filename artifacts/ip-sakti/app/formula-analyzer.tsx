import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  FormulaAnalysisSection,
  MobileFormulaAnalysisResult,
  useMobileFormulaAnalysis,
  useMobileMemoryCreate,
  useMobileProjectCreate,
} from '@workspace/api-client-react';
import {
  AppScreen,
  BackHeader,
  EvidenceCard,
  PrimaryButton,
  StatusBadge,
  SurfaceCard,
  styles,
} from '@/components/ip-sakti';
import { useColors } from '@/hooks/useColors';
import {
  getActiveProjectId,
  getResearchClientId,
  setActiveProjectId,
} from '@/lib/research-client';

type AnalysisAction = 'full' | 'prior-art' | 'abs-tk';

const example = 'Ashwagandha (Withania somnifera)\nPippali (Piper longum)\nTurmeric (Curcuma longa)';

const sections: Array<{
  key: keyof Pick<MobileFormulaAnalysisResult, 'patent' | 'priorArt' | 'traditionalKnowledge' | 'abs' | 'regulatory'>;
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
}> = [
  { key: 'patent', title: 'Patent / Section 3(p) Considerations', icon: 'award' },
  { key: 'priorArt', title: 'Prior-Art & TKDL Findings', icon: 'search' },
  { key: 'traditionalKnowledge', title: 'Traditional Knowledge Grounding', icon: 'book-open' },
  { key: 'abs', title: 'Biological Diversity Act (ABS) Relevance', icon: 'globe' },
  { key: 'regulatory', title: 'Drugs & Cosmetics / AYUSH Regulatory', icon: 'layers' },
];

function ActionButton({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
  disabled: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      testID={`formula-${label.toLowerCase().replace(/\s+/g, '-')}`}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [{
        flex: 1,
        minHeight: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 7,
        opacity: pressed || disabled ? 0.6 : 1,
      }]}
    >
      <Feather name={icon} size={15} color={colors.lavenderDeep} />
      <Text style={{ color: colors.lavenderDeep, fontSize: 10, fontWeight: '700', marginTop: 4, textAlign: 'center' }}>{label}</Text>
    </Pressable>
  );
}

function SectionResult({ title, icon, section }: { title: string; icon: React.ComponentProps<typeof Feather>['name']; section: FormulaAnalysisSection }) {
  const colors = useColors();
  const tone = section.status === 'unavailable' ? 'warning' : section.status === 'available' ? 'success' : 'neutral';
  return (
    <SurfaceCard style={{ marginTop: 10, padding: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: colors.lavenderLight, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name={icon} size={14} color={colors.lavenderDeep} />
        </View>
        <Text style={{ flex: 1, color: colors.foreground, fontSize: 13, fontWeight: '700' }}>{title}</Text>
        <StatusBadge label={section.status === 'not-run' ? 'Not run' : section.status === 'available' ? 'Available' : 'Review'} tone={tone} />
      </View>
      <Text style={{ color: colors.inkSubtle, fontSize: 12, lineHeight: 18, marginTop: 12 }}>{section.summary}</Text>
      {section.findings.map((finding) => (
        <View key={finding} style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <Text style={{ color: colors.pink, fontSize: 12 }}>•</Text>
          <Text style={{ flex: 1, color: colors.foreground, fontSize: 11.5, lineHeight: 17 }}>{finding}</Text>
        </View>
      ))}
      {section.evidence.map((source) => (
        <EvidenceCard key={`${source.title}-${source.reference}`} title={source.title} section={source.reference} version="Source attached" />
      ))}
    </SurfaceCard>
  );
}

export default function FormulaAnalyzerScreen() {
  const colors = useColors();
  const router = useRouter();
  const [input, setInput] = useState(example);
  const [result, setResult] = useState<MobileFormulaAnalysisResult | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const analysisMutation = useMobileFormulaAnalysis();
  const projectMutation = useMobileProjectCreate();
  const memoryMutation = useMobileMemoryCreate();

  useEffect(() => {
    void Promise.all([getResearchClientId(), getActiveProjectId()]).then(([storedClientId, storedProjectId]) => {
      setClientId(storedClientId);
      setProjectId(storedProjectId);
    });
  }, []);

  const runAnalysis = async (action: AnalysisAction) => {
    const formulation = input.trim();
    if (!formulation || analysisMutation.isPending) return;
    setSaveMessage('');
    Haptics.selectionAsync();
    try {
      const response = await analysisMutation.mutateAsync({ data: { formulation, action } });
      setResult(response);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setSaveMessage('The analysis could not be completed. Please try again.');
    }
  };

  const saveToResearch = async () => {
    if (!clientId || !result || memoryMutation.isPending || projectMutation.isPending) return;
    try {
      let targetProjectId = projectId;
      if (!targetProjectId) {
        const project = await projectMutation.mutateAsync({
          data: {
            clientId,
            name: 'Ayurveda formula research',
            description: 'Saved formulation analyses and evidence review.',
          },
        });
        targetProjectId = project.id;
        setProjectId(targetProjectId);
        await setActiveProjectId(targetProjectId);
      }
      const recognizedEntities = result.ingredients
        .filter((ingredient) => ingredient.status === 'recognized')
        .map((ingredient) => ingredient.normalizedEntity);
      await memoryMutation.mutateAsync({
        projectId: targetProjectId,
        data: {
          clientId,
          title: 'Ayurveda Formula Analyzer result',
          finding: [
            `Formulation: ${result.formulation}`,
            `Representation: ${result.representation}`,
            `Ingredients: ${result.ingredients.map((ingredient) => `${ingredient.commonName} — ${ingredient.botanicalName}`).join('; ')}`,
            `Patent/IP: ${result.patent.summary}`,
            `Prior art: ${result.priorArt.summary}`,
            `Traditional knowledge: ${result.traditionalKnowledge.summary}`,
            `ABS: ${result.abs.summary}`,
            `Regulatory: ${result.regulatory.summary}`,
          ].join('\n'),
          entities: recognizedEntities,
          sources: result.priorArt.evidence.concat(result.traditionalKnowledge.evidence).map((source) => ({
            title: source.title,
            reference: source.reference,
            ...(source.url ? { url: source.url } : {}),
          })),
        },
      });
      setSaveMessage('Saved to your research workspace.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setSaveMessage('This result could not be saved. Create a research project and try again.');
    }
  };

  const recognizedCount = useMemo(
    () => result?.ingredients.filter((ingredient) => ingredient.status === 'recognized').length ?? 0,
    [result],
  );

  return (
    <AppScreen>
      <BackHeader title="Formula Analyzer" subtitle="Normalize a formulation before IP review" />
      <Text style={[styles.pageTitle, { color: colors.foreground, fontSize: 24 }]}>Ayurveda Formula Analyzer</Text>
      <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>
        Normalize herbal ingredients, identify chemical markers in the Ayurvedic Pharmacopoeia, and screen for Section 3(p) prior art.
      </Text>

      <SurfaceCard style={{ marginTop: 20, padding: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '700' }}>Formulation input</Text>
          <Pressable onPress={() => setInput(example)}><Text style={{ color: colors.lavenderDeep, fontSize: 11, fontWeight: '700' }}>Use example</Text></Pressable>
        </View>
        <TextInput
          testID="formula-input"
          value={input}
          onChangeText={setInput}
          multiline
          placeholder="Ashwagandha, Pippali, Turmeric…"
          placeholderTextColor={colors.inkSubtle}
          style={{ minHeight: 90, color: colors.foreground, fontSize: 13.5, lineHeight: 21, paddingTop: 14, textAlignVertical: 'top' }}
        />
        <Text style={{ color: colors.inkSubtle, fontSize: 10.5, lineHeight: 15 }}>
          Example: “Formulation containing Ashwagandha extract, Piper longum and turmeric in a sustained-release tablet.”
        </Text>
      </SurfaceCard>

      <View style={{ marginTop: 12 }}>
        <PrimaryButton label="Run Full Analysis" icon="activity" variant="noir" onPress={() => void runAnalysis('full')} loading={analysisMutation.isPending} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 9 }}>
        <ActionButton label="Search Prior Art" icon="search" onPress={() => void runAnalysis('prior-art')} disabled={analysisMutation.isPending} />
        <ActionButton label="Check ABS/TK" icon="globe" onPress={() => void runAnalysis('abs-tk')} disabled={analysisMutation.isPending} />
      </View>

      {saveMessage ? (
        <Text style={{ color: saveMessage.startsWith('Saved') ? colors.success : colors.destructive, fontSize: 11, lineHeight: 16, marginTop: 13 }}>{saveMessage}</Text>
      ) : null}

      {result ? (
        <View style={{ marginTop: 25 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 0, marginBottom: 3 }]}>Normalized formulation</Text>
              <Text style={{ color: colors.inkSubtle, fontSize: 11 }}>{recognizedCount} recognized ingredient{recognizedCount === 1 ? '' : 's'}</Text>
            </View>
            <Pressable onPress={() => void saveToResearch()} disabled={memoryMutation.isPending || projectMutation.isPending} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, opacity: memoryMutation.isPending || projectMutation.isPending ? 0.6 : 1 }}>
              <Feather name="bookmark" size={14} color={colors.lavenderDeep} />
              <Text style={{ color: colors.lavenderDeep, fontSize: 11, fontWeight: '700' }}>Save to Research</Text>
            </Pressable>
          </View>

          {/* Trace Evidence Chain Action Callout */}
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.push({
                pathname: '/evidence',
                params: { query: result.formulation },
              });
            }}
            style={({ pressed }) => [
              {
                marginTop: 12,
                padding: 13,
                borderRadius: 13,
                backgroundColor: colors.lavenderLight,
                borderWidth: 1.5,
                borderColor: colors.lavenderDeep,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Feather name="git-commit" size={14} color={colors.lavenderDeep} />
                <Text style={{ color: colors.lavenderDeep, fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                  GROUNDED EVIDENCE REASONING GRAPH
                </Text>
              </View>
              <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '800', marginTop: 3 }}>
                View 5-Stage Evidence Chain for this Formula
              </Text>
              <Text style={{ color: colors.inkSubtle, fontSize: 11, marginTop: 1 }}>
                Explore exact API monographs, TKDL prior-art, Section 3(p) objections & licensing paths.
              </Text>
            </View>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: colors.lavenderDeep,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="arrow-right" size={16} color="#FFFFFF" />
            </View>
          </Pressable>

          <SurfaceCard style={{ marginTop: 11, padding: 14 }}>
            <Text style={{ color: colors.inkSubtle, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' }}>Normalized Botanicals</Text>
            {result.ingredients.map((ingredient) => (
              <View key={`${ingredient.input}-${ingredient.normalizedEntity}`} style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 11 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                  <Text style={{ flex: 1, color: colors.foreground, fontSize: 13, fontWeight: '700' }}>{ingredient.commonName}</Text>
                  <StatusBadge label={ingredient.status === 'recognized' ? 'Normalized' : 'Needs review'} tone={ingredient.status === 'recognized' ? 'success' : 'warning'} />
                </View>
                <Text style={{ color: colors.foreground, fontSize: 12, fontStyle: 'italic', marginTop: 5 }}>{ingredient.botanicalName}</Text>
                <Text style={{ color: colors.inkSubtle, fontSize: 11, lineHeight: 16, marginTop: 4 }}>Entity: {ingredient.normalizedEntity}</Text>
                <Text style={{ color: colors.inkSubtle, fontSize: 10, lineHeight: 15, marginTop: 3 }}>Source: {ingredient.source}</Text>
              </View>
            ))}
            <Text style={{ color: colors.inkSubtle, fontSize: 10, lineHeight: 15, marginTop: 4 }}>Amounts, ratios, preparation method, and claims are evaluated against Ayurvedic Pharmacopoeia standards.</Text>
          </SurfaceCard>

          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 25, marginBottom: 1 }]}>Formulation analysis</Text>
          <Text style={{ color: colors.inkSubtle, fontSize: 11, lineHeight: 16 }}>Evidence-backed sections are separated from unavailable or not-run checks.</Text>
          {sections.map((section) => (
            <SectionResult key={section.key} title={section.title} icon={section.icon} section={result[section.key]} />
          ))}

          <SurfaceCard style={{ marginTop: 10, padding: 14, backgroundColor: colors.black, borderColor: '#262438' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Feather name="zap" size={15} color={colors.pink} />
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>IP-SAKTI Regulatory Synthesis</Text>
              <StatusBadge label={result.explanationStatus === 'available' ? 'Grounded' : 'Unavailable'} tone={result.explanationStatus === 'available' ? 'lavender' : 'warning'} />
            </View>
            <Text style={{ color: '#D4D0DE', fontSize: 12, lineHeight: 19, marginTop: 11 }}>{result.explanation}</Text>
          </SurfaceCard>
          <Text style={{ color: colors.inkSubtle, fontSize: 10, textAlign: 'center', lineHeight: 15, marginTop: 14 }}>This is structured research guidance, not a legal conclusion. Verify sources with a qualified professional.</Text>
        </View>
      ) : null}
    </AppScreen>
  );
}
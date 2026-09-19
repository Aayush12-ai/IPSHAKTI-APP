import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

const example = 'Ashwagandha\nPippali\nTurmeric';

const sections: Array<{
  key: keyof Pick<MobileFormulaAnalysisResult, 'patent' | 'priorArt' | 'traditionalKnowledge' | 'abs' | 'regulatory'>;
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
}> = [
  { key: 'patent', title: 'Patent/IP considerations', icon: 'award' },
  { key: 'priorArt', title: 'Prior-art findings', icon: 'search' },
  { key: 'traditionalKnowledge', title: 'Traditional knowledge relevance', icon: 'book-open' },
  { key: 'abs', title: 'ABS relevance', icon: 'globe' },
  { key: 'regulatory', title: 'Regulatory considerations', icon: 'layers' },
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
      <Feather name={icon} size={15} color={colors.forest} />
      <Text style={{ color: colors.forest, fontSize: 10, fontWeight: '700', marginTop: 4, textAlign: 'center' }}>{label}</Text>
    </Pressable>
  );
}

function SectionResult({ title, icon, section }: { title: string; icon: React.ComponentProps<typeof Feather>['name']; section: FormulaAnalysisSection }) {
  const colors = useColors();
  const tone = section.status === 'unavailable' ? 'warning' : section.status === 'available' ? 'success' : 'neutral';
  return (
    <SurfaceCard style={{ marginTop: 10, padding: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: colors.sageLight, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name={icon} size={14} color={colors.forest} />
        </View>
        <Text style={{ flex: 1, color: colors.foreground, fontSize: 13, fontWeight: '700' }}>{title}</Text>
        <StatusBadge label={section.status === 'not-run' ? 'Not run' : section.status === 'available' ? 'Available' : 'Review'} tone={tone} />
      </View>
      <Text style={{ color: colors.inkSubtle, fontSize: 12, lineHeight: 18, marginTop: 12 }}>{section.summary}</Text>
      {section.findings.map((finding) => (
        <View key={finding} style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <Text style={{ color: colors.warning, fontSize: 12 }}>•</Text>
          <Text style={{ flex: 1, color: colors.foreground, fontSize: 11, lineHeight: 17 }}>{finding}</Text>
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
    try {
      const response = await analysisMutation.mutateAsync({ data: { formulation, action } });
      setResult(response);
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
        Enter ingredients line by line, or describe the formulation naturally. Only recognized records and attached evidence are shown.
      </Text>

      <SurfaceCard style={{ marginTop: 20, padding: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '700' }}>Formulation input</Text>
          <Pressable onPress={() => setInput(example)}><Text style={{ color: colors.forest, fontSize: 11, fontWeight: '700' }}>Use example</Text></Pressable>
        </View>
        <TextInput
          testID="formula-input"
          value={input}
          onChangeText={setInput}
          multiline
          placeholder="Ashwagandha, Pippali, Turmeric…"
          placeholderTextColor={colors.inkSubtle}
          style={{ minHeight: 104, color: colors.foreground, fontSize: 14, lineHeight: 21, paddingTop: 14, textAlignVertical: 'top' }}
        />
        <Text style={{ color: colors.inkSubtle, fontSize: 10, lineHeight: 15 }}>
          Example: “Formulation containing Ashwagandha extract, Piper longum and turmeric in a sustained-release tablet.”
        </Text>
      </SurfaceCard>

      <View style={{ marginTop: 12 }}>
        <PrimaryButton label="Run Full Analysis" icon="activity" onPress={() => void runAnalysis('full')} loading={analysisMutation.isPending} />
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
              <Feather name="bookmark" size={14} color={colors.forest} />
              <Text style={{ color: colors.forest, fontSize: 11, fontWeight: '700' }}>Save to Research</Text>
            </Pressable>
          </View>

          <SurfaceCard style={{ marginTop: 11, padding: 14 }}>
            <Text style={{ color: colors.inkSubtle, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>Ingredients</Text>
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
            <Text style={{ color: colors.inkSubtle, fontSize: 10, lineHeight: 15, marginTop: 4 }}>Amounts, ratios, preparation method, and claims are not inferred.</Text>
          </SurfaceCard>

          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 25, marginBottom: 1 }]}>Formulation analysis</Text>
          <Text style={{ color: colors.inkSubtle, fontSize: 11, lineHeight: 16 }}>Evidence-backed sections are separated from unavailable or not-run checks.</Text>
          {sections.map((section) => (
            <SectionResult key={section.key} title={section.title} icon={section.icon} section={result[section.key]} />
          ))}

          <SurfaceCard style={{ marginTop: 10, padding: 14, backgroundColor: colors.forest, borderColor: colors.forest }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Feather name="zap" size={15} color={colors.saffron} />
              <Text style={{ color: colors.primaryForeground, fontSize: 13, fontWeight: '700' }}>Gemini explanation</Text>
              <StatusBadge label={result.explanationStatus === 'available' ? 'Grounded' : 'Unavailable'} tone={result.explanationStatus === 'available' ? 'success' : 'warning'} />
            </View>
            <Text style={{ color: '#D8EBDD', fontSize: 12, lineHeight: 19, marginTop: 11 }}>{result.explanation}</Text>
          </SurfaceCard>
          <Text style={{ color: colors.inkSubtle, fontSize: 10, textAlign: 'center', lineHeight: 15, marginTop: 14 }}>This is structured research guidance, not a legal conclusion. Verify sources with a qualified professional.</Text>
        </View>
      ) : null}
    </AppScreen>
  );
}
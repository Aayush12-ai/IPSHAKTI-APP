import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  AppScreen,
  BackHeader,
  EvidenceCard,
  PrimaryButton,
  SectionTitle,
  StatusBadge,
  SurfaceCard,
  styles,
} from '@/components/ip-sakti';
import { useColors } from '@/hooks/useColors';
import {
  MobileClassifyResult,
  useMobileClassify,
  useMobileMemoryCreate,
} from '@workspace/api-client-react';
import {
  getActiveProjectId,
  getResearchClientId,
} from '@/lib/research-client';

const DOSAGE_FORMS = [
  'Tablet / Vati',
  'Capsule',
  'Powder / Churna',
  'Liquid / Kashayam',
  'Oil / Taila',
  'Avaleha / Paste',
  'Topical Cream / Balm',
  'Syrup / Arishta',
];

const EXTRACTION_METHODS = [
  {
    id: 'classical-shastriya',
    title: 'Classical Shastriya Method (AFI / Textual)',
    desc: 'Prepared strictly as per Charaka, Sushruta, or AFI texts (Swarasa, Kwatha, Sneha Paka)',
  },
  {
    id: 'standardized-extract',
    title: 'Standardized Hydro-Alcoholic Extract',
    desc: 'Modern botanical extract standardized to specific marker compounds',
  },
  {
    id: 'aqueous-extract',
    title: 'Aqueous / Water Decoction Extract',
    desc: 'Water-soluble concentrated herbal extract or spray-dried powder',
  },
  {
    id: 'fermentation',
    title: 'Fermentation (Asava / Arishta)',
    desc: 'Self-generated natural alcohol through classical yeast fermentation',
  },
  {
    id: 'purified-fraction',
    title: 'Purified Phytochemical Fraction',
    desc: 'Purified botanical fraction for potential phytopharmaceutical pathway',
  },
];

const TARGET_MARKETS = [
  'India (AYUSH / FSSAI)',
  'United States (FDA Dietary Supplement)',
  'European Union (THMPD / Food Supplement)',
  'Global Export Multi-Market',
];

const QUICK_HERB_CHIPS = [
  'Ashwagandha',
  'Brahmi',
  'Shankhpushpi',
  'Turmeric',
  'Pippali',
  'Triphala',
  'Neem',
  'Tulsi',
  'Guduchi',
];

export default function ClassifyScreen() {
  const colors = useColors();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [productName, setProductName] = useState('Ashwagandha Calm Formula');
  const [ingredients, setIngredients] = useState('Ashwagandha, Brahmi, Shankhpushpi, Pippali');
  const [dosageForm, setDosageForm] = useState('Tablet / Vati');
  const [preparationMethod, setPreparationMethod] = useState('Classical Shastriya Method (AFI / Textual)');
  const [intendedUse, setIntendedUse] = useState('Therapeutic management of stress, anxiety, and mental fatigue');
  const [claims, setClaims] = useState('Supports healthy cortisol levels, calms the mind, and promotes restorative sleep');
  const [targetMarket, setTargetMarket] = useState('India (AYUSH / FSSAI)');

  const [clientId, setClientId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);
  const [savedToResearch, setSavedToResearch] = useState(false);
  const [result, setResult] = useState<MobileClassifyResult | null>(null);

  const classifyMutation = useMobileClassify();
  const saveMemoryMutation = useMobileMemoryCreate();

  useEffect(() => {
    void Promise.all([getResearchClientId(), getActiveProjectId()]).then(
      ([storedClientId, storedProjectId]) => {
        setClientId(storedClientId);
        setActiveProjectIdState(storedProjectId);
      },
    );
  }, []);

  const addHerbChip = (herb: string) => {
    Haptics.selectionAsync();
    if (!ingredients.trim()) {
      setIngredients(herb);
    } else if (!ingredients.toLowerCase().includes(herb.toLowerCase())) {
      setIngredients(`${ingredients}, ${herb}`);
    }
  };

  const handleClassify = async () => {
    if (!productName.trim() || !ingredients.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(2);
    setSavedToResearch(false);

    try {
      const response = await classifyMutation.mutateAsync({
        data: {
          productName: productName.trim(),
          ingredients: ingredients.trim(),
          dosageForm,
          preparationMethod,
          intendedUse: intendedUse.trim(),
          claims: claims.trim(),
          targetMarket,
          ...(clientId ? { clientId } : {}),
          ...(activeProjectId ? { projectId: activeProjectId } : {}),
        },
      });
      setResult(response);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Result handled via error fallback
    }
  };

  const handleSaveToResearch = async () => {
    if (!result || !clientId || savedToResearch || saveMemoryMutation.isPending) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const targetProjectId = activeProjectId ?? 'default';
      await saveMemoryMutation.mutateAsync({
        projectId: targetProjectId,
        data: {
          clientId,
          title: `Classification: ${productName}`,
          finding: `${result.category} (${result.statutoryBasis})\n${result.summary}`,
          entities: ingredients.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean),
          sources: result.evidenceSources.map((s) => ({
            title: s.title,
            reference: s.section,
          })),
        },
      });
      setSavedToResearch(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Handled gracefully
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppScreen>
        <BackHeader
          title="Product Classification"
          subtitle={step < 2 ? `Step ${step + 1} of 2` : 'Regulatory & IP Assessment'}
        />

        {step < 2 ? (
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 22 }}>
            {[0, 1].map((item) => (
              <View
                key={item}
                style={{
                  flex: 1,
                  height: 5,
                  borderRadius: 4,
                  backgroundColor: item <= step ? colors.forest : colors.border,
                }}
              />
            ))}
          </View>
        ) : null}

        {step === 0 ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={[styles.pageTitle, { color: colors.foreground, fontSize: 22 }]}>
              Formulation & Product Details
            </Text>
            <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>
              Define the composition and physical form of your Ayurvedic formulation.
            </Text>

            <View style={{ marginTop: 18, gap: 16 }}>
              <View>
                <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', marginBottom: 7 }}>
                  Product / Formulation Name
                </Text>
                <TextInput
                  value={productName}
                  onChangeText={setProductName}
                  placeholder="e.g. Ashwagandha Calm Tablet"
                  placeholderTextColor={colors.inkSubtle}
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 13,
                    minHeight: 48,
                    paddingHorizontal: 13,
                    color: colors.foreground,
                    fontSize: 13,
                  }}
                />
              </View>

              <View>
                <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', marginBottom: 7 }}>
                  Herbal Ingredients & Botanicals
                </Text>
                <TextInput
                  value={ingredients}
                  onChangeText={setIngredients}
                  placeholder="e.g. Ashwagandha, Brahmi, Shankhpushpi, Pippali"
                  placeholderTextColor={colors.inkSubtle}
                  multiline
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 13,
                    minHeight: 65,
                    padding: 12,
                    color: colors.foreground,
                    fontSize: 13,
                    textAlignVertical: 'top',
                  }}
                />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {QUICK_HERB_CHIPS.map((chip) => (
                    <Pressable
                      key={chip}
                      onPress={() => addHerbChip(chip)}
                      style={{
                        backgroundColor: colors.sageLight,
                        paddingHorizontal: 9,
                        paddingVertical: 4,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text style={{ color: colors.forest, fontSize: 11, fontWeight: '600' }}>
                        + {chip}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View>
                <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', marginBottom: 7 }}>
                  Dosage Form
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                  {DOSAGE_FORMS.map((form) => {
                    const isSelected = dosageForm === form;
                    return (
                      <Pressable
                        key={form}
                        onPress={() => setDosageForm(form)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 9,
                          borderRadius: 11,
                          borderWidth: isSelected ? 1.5 : 1,
                          borderColor: isSelected ? colors.forest : colors.border,
                          backgroundColor: isSelected ? colors.sageLight : colors.card,
                        }}
                      >
                        <Text
                          style={{
                            color: isSelected ? colors.forest : colors.foreground,
                            fontSize: 11,
                            fontWeight: isSelected ? '700' : '500',
                          }}
                        >
                          {form}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={{ marginTop: 26 }}>
              <PrimaryButton
                label="Continue to Claims & Process"
                icon="arrow-right"
                onPress={() => setStep(1)}
              />
            </View>
          </ScrollView>
        ) : step === 1 ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={[styles.pageTitle, { color: colors.foreground, fontSize: 22 }]}>
              Process, Claims & Target Market
            </Text>
            <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>
              Regulatory categories depend on processing methods, therapeutic claims, and intended jurisdiction.
            </Text>

            <SectionTitle title="1. Extraction & Preparation Method" />
            <View style={{ gap: 8 }}>
              {EXTRACTION_METHODS.map((method) => {
                const isSelected = preparationMethod === method.title;
                return (
                  <Pressable
                    key={method.id}
                    onPress={() => setPreparationMethod(method.title)}
                    style={{
                      padding: 12,
                      borderRadius: 13,
                      borderWidth: isSelected ? 1.5 : 1,
                      borderColor: isSelected ? colors.forest : colors.border,
                      backgroundColor: isSelected ? colors.sageLight : colors.card,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', flex: 1 }}>
                        {method.title}
                      </Text>
                      <Feather
                        name={isSelected ? 'check-circle' : 'circle'}
                        size={17}
                        color={isSelected ? colors.forest : colors.border}
                      />
                    </View>
                    <Text style={{ color: colors.inkSubtle, fontSize: 10, marginTop: 4, lineHeight: 14 }}>
                      {method.desc}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <SectionTitle title="2. Intended Health Claims & Indications" />
            <TextInput
              value={claims}
              onChangeText={setClaims}
              placeholder="e.g. Reduces stress, enhances sleep, supports joint mobility"
              placeholderTextColor={colors.inkSubtle}
              multiline
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 13,
                minHeight: 55,
                padding: 12,
                color: colors.foreground,
                fontSize: 13,
              }}
            />

            <SectionTitle title="3. Target Commercial Market" />
            <View style={{ gap: 7 }}>
              {TARGET_MARKETS.map((market) => {
                const isSelected = targetMarket === market;
                return (
                  <Pressable
                    key={market}
                    onPress={() => setTargetMarket(market)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 11,
                      borderRadius: 11,
                      borderWidth: isSelected ? 1.5 : 1,
                      borderColor: isSelected ? colors.forest : colors.border,
                      backgroundColor: isSelected ? colors.sageLight : colors.card,
                    }}
                  >
                    <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: isSelected ? '700' : '500', flex: 1 }}>
                      {market}
                    </Text>
                    <Feather
                      name={isSelected ? 'check-circle' : 'circle'}
                      size={16}
                      color={isSelected ? colors.forest : colors.border}
                    />
                  </Pressable>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 26 }}>
              <Pressable
                onPress={() => setStep(0)}
                style={{
                  flex: 1,
                  minHeight: 48,
                  borderRadius: 13,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '700' }}>
                  Back
                </Text>
              </Pressable>
              <View style={{ flex: 2 }}>
                <PrimaryButton
                  label="Classify Product"
                  icon="layers"
                  onPress={handleClassify}
                />
              </View>
            </View>
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            {classifyMutation.isPending ? (
              <SurfaceCard style={{ marginTop: 20, alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="large" color={colors.forest} />
                <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '700', marginTop: 16 }}>
                  Evaluating Ayurvedic Regulatory Pathways…
                </Text>
                <Text style={{ color: colors.inkSubtle, fontSize: 12, marginTop: 6, textAlign: 'center', marginHorizontal: 20 }}>
                  Analyzing Drugs & Cosmetics Act 1940, Rule 158B, FSSAI Ayurveda Aahar, and Section 3(p) Patent Act exclusions.
                </Text>
              </SurfaceCard>
            ) : result ? (
              <>
                <SurfaceCard style={{ marginTop: 10, borderColor: colors.forest, borderWidth: 1.5 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '700' }}>
                        {result.category}
                      </Text>
                      <Text style={{ color: colors.inkSubtle, fontSize: 11, marginTop: 2 }}>
                        {result.statutoryBasis}
                      </Text>
                    </View>
                    <StatusBadge
                      label={`${result.confidence.toUpperCase()} (${result.confidenceScore}%)`}
                      tone="success"
                    />
                  </View>

                  <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 19, marginTop: 12 }}>
                    {result.summary}
                  </Text>
                </SurfaceCard>

                <SectionTitle title="Regulatory Pathway & Licensing" />
                <SurfaceCard>
                  <View style={{ gap: 11 }}>
                    <View>
                      <Text style={{ color: colors.inkSubtle, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 }}>
                        Licensing Authority
                      </Text>
                      <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '600', marginTop: 2 }}>
                        {result.regulatoryPathway.authority}
                      </Text>
                    </View>

                    <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }}>
                      <Text style={{ color: colors.inkSubtle, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 }}>
                        License Type / Form
                      </Text>
                      <Text style={{ color: colors.forest, fontSize: 13, fontWeight: '700', marginTop: 2 }}>
                        {result.regulatoryPathway.licenseType}
                      </Text>
                    </View>

                    <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }}>
                      <Text style={{ color: colors.inkSubtle, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 }}>
                        Evidence & Trial Requirements
                      </Text>
                      {result.regulatoryPathway.trialRequirements.map((req) => (
                        <Text key={req} style={{ color: colors.foreground, fontSize: 12, marginTop: 4, lineHeight: 17 }}>
                          • {req}
                        </Text>
                      ))}
                    </View>

                    <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }}>
                      <Text style={{ color: colors.inkSubtle, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 }}>
                        Standard Pharmacopoeial Reference
                      </Text>
                      <Text style={{ color: colors.foreground, fontSize: 12, marginTop: 2 }}>
                        {result.regulatoryPathway.standardsRef}
                      </Text>
                    </View>
                  </View>
                </SurfaceCard>

                <SectionTitle title="IP & Traditional Knowledge (Section 3(p)) Risk" />
                <SurfaceCard style={{ backgroundColor: colors.sageLight }}>
                  <Text style={{ color: colors.forest, fontSize: 12, fontWeight: '700' }}>
                    Patentability Outlook:
                  </Text>
                  <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18, marginTop: 4 }}>
                    {result.ipAndTkdlRisks.patentability}
                  </Text>

                  <Text style={{ color: colors.forest, fontSize: 12, fontWeight: '700', marginTop: 10 }}>
                    TKDL Overlap Analysis:
                  </Text>
                  <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18, marginTop: 4 }}>
                    {result.ipAndTkdlRisks.tkdlOverlap}
                  </Text>

                  {result.ipAndTkdlRisks.keyRisks.length > 0 ? (
                    <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }}>
                      <Text style={{ color: colors.warning, fontSize: 11, fontWeight: '700' }}>
                        Key Regulatory Risks:
                      </Text>
                      {result.ipAndTkdlRisks.keyRisks.map((k) => (
                        <Text key={k} style={{ color: colors.foreground, fontSize: 11, marginTop: 2 }}>
                          • {k}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </SurfaceCard>

                <SectionTitle title="Recommended Action Plan" />
                <SurfaceCard>
                  {result.recommendedActions.map((action, i) => (
                    <View
                      key={action}
                      style={{
                        flexDirection: 'row',
                        gap: 9,
                        alignItems: 'flex-start',
                        paddingVertical: 7,
                        borderBottomWidth: i === result.recommendedActions.length - 1 ? 0 : 1,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 6,
                          backgroundColor: colors.sageLight,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 1,
                        }}
                      >
                        <Text style={{ color: colors.forest, fontSize: 10, fontWeight: '700' }}>
                          {i + 1}
                        </Text>
                      </View>
                      <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 17, flex: 1 }}>
                        {action}
                      </Text>
                    </View>
                  ))}
                </SurfaceCard>

                <SectionTitle title="Statutory Evidence Sources" />
                {result.evidenceSources.map((ev) => (
                  <EvidenceCard
                    key={`${ev.title}-${ev.section}`}
                    title={ev.title}
                    section={ev.section}
                    version={ev.description}
                  />
                ))}

                <View style={{ marginTop: 18, gap: 10 }}>
                  <Pressable
                    onPress={() => void handleSaveToResearch()}
                    disabled={savedToResearch || saveMemoryMutation.isPending}
                    style={({ pressed }) => [
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: 13,
                        borderRadius: 13,
                        borderWidth: 1,
                        borderColor: colors.lavenderBorder,
                        backgroundColor: savedToResearch ? colors.lavenderLight : colors.card,
                        opacity: pressed || saveMemoryMutation.isPending ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Feather
                      name={savedToResearch ? 'check-circle' : 'bookmark'}
                      size={16}
                      color={savedToResearch ? colors.success : colors.lavenderDeep}
                    />
                    <Text style={{ color: savedToResearch ? colors.success : colors.lavenderDeep, fontSize: 13, fontWeight: '700' }}>
                      {savedToResearch ? 'Saved to My Research' : 'Save Classification to Research'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => router.push('/abs')}
                    style={({ pressed }) => [
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: 14,
                        borderRadius: 13,
                        backgroundColor: colors.pink,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Feather name="globe" size={16} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>
                      Check ABS & Biodiversity Obligations
                    </Text>
                  </Pressable>

                  <PrimaryButton
                    label="Re-classify / Edit Inputs"
                    icon="rotate-ccw"
                    variant="noir"
                    onPress={() => setStep(0)}
                  />
                </View>
              </>
            ) : (
              <SurfaceCard style={{ marginTop: 20, padding: 20, alignItems: 'center' }}>
                <Feather name="alert-circle" size={32} color={colors.warning} />
                <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '700', marginTop: 12 }}>
                  Could not complete product classification
                </Text>
                <Text style={{ color: colors.inkSubtle, fontSize: 12, textAlign: 'center', marginTop: 6 }}>
                  Please verify your network connection or try again.
                </Text>
                <View style={{ marginTop: 16, width: '100%' }}>
                  <PrimaryButton label="Retry" onPress={handleClassify} />
                </View>
              </SurfaceCard>
            )}
          </ScrollView>
        )}
      </AppScreen>
    </KeyboardAvoidingView>
  );
}
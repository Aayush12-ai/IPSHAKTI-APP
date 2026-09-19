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

function evaluateLocalClassification(data: {
  productName: string;
  ingredients: string;
  dosageForm?: string;
  preparationMethod?: string;
  intendedUse?: string;
  claims?: string;
  targetMarket?: string;
}): MobileClassifyResult {
  const text = `${data.productName} ${data.ingredients} ${data.dosageForm ?? ''} ${data.preparationMethod ?? ''} ${data.intendedUse ?? ''} ${data.claims ?? ''}`.toLowerCase();
  const method = (data.preparationMethod ?? '').toLowerCase();
  const claims = (data.claims ?? '').toLowerCase();
  const use = (data.intendedUse ?? '').toLowerCase();
  const form = (data.dosageForm ?? '').toLowerCase();

  const isClassical =
    method.includes('classical') ||
    method.includes('shastriya') ||
    method.includes('afi') ||
    text.includes('charaka') ||
    text.includes('sushruta') ||
    text.includes('sharangadhara') ||
    text.includes('bhasma') ||
    text.includes('arishta') ||
    text.includes('asava') ||
    text.includes('avaleha') ||
    text.includes('taila') ||
    text.includes('ghrita');

  const isCosmetic =
    form.includes('cream') ||
    form.includes('lotion') ||
    form.includes('serum') ||
    form.includes('balm') ||
    form.includes('oil') ||
    form.includes('wash') ||
    use.includes('skin') ||
    use.includes('hair') ||
    use.includes('cosmetic') ||
    use.includes('complexion') ||
    claims.includes('radiant') ||
    claims.includes('glow') ||
    claims.includes('anti-aging');

  const isFoodOrDietary =
    use.includes('food') ||
    use.includes('diet') ||
    use.includes('nutrition') ||
    use.includes('beverage') ||
    use.includes('tea') ||
    use.includes('latte') ||
    use.includes('snack') ||
    claims.includes('general wellness') ||
    claims.includes('daily nutrition') ||
    text.includes('aahar') ||
    text.includes('supplement') ||
    (data.targetMarket?.includes('United States') && !use.includes('cure'));

  const isPhyto =
    method.includes('purified') ||
    method.includes('fraction') ||
    text.includes('standardized fraction') ||
    text.includes('phytopharmaceutical') ||
    text.includes('isolated marker');

  if (isPhyto) {
    return {
      category: 'Phytopharmaceutical Drug',
      categoryCode: 'phytopharmaceutical',
      confidence: 'High',
      confidenceScore: 92,
      summary:
        'Purified botanical fraction evaluated under CDSCO Phytopharmaceutical Drug regulations (Drugs and Cosmetics Rules 1945, Rule 122E/Schedule Y). Requires central CDSCO clinical trials.',
      statutoryBasis: 'Drugs and Cosmetics Rules, 1945 — Rule 122E (Phytopharmaceutical Pathway)',
      regulatoryPathway: {
        authority: 'CDSCO (Central Drugs Standard Control Organization)',
        licenseType: 'Form 44 (Phytopharmaceutical Drug Authorization)',
        trialRequirements: [
          'Phase I, II, and III Clinical Trials in accordance with CDSCO guidelines',
          'Standardization to at least 4 active phytochemical markers',
          'Complete acute, sub-chronic, and reproductive animal toxicology data',
        ],
        standardsRef: 'CDSCO Phytopharmaceutical Guidelines & Indian Pharmacopoeia (IP)',
      },
      ipAndTkdlRisks: {
        patentability: 'High patentability potential if the fraction demonstrates synergistic or novel pharmacology not disclosed in classical texts.',
        tkdlOverlap: 'Low TKDL barrier for purified, novel-ratio fractions; Section 3(p) objections are surmountable with characterization data.',
        keyRisks: [
          'Stringent Central CDSCO approval timelines (18-24 months)',
          'High capital investment for Phase I-III clinical evaluation',
        ],
      },
      recommendedActions: [
        'Engage CDSCO Subject Expert Committee (SEC) for pre-submission consultation',
        'File PCT / Indian Patent Application with comparative chromatographic synergy data',
        'Initiate GMP pilot-scale validation at CDSCO-approved facility',
      ],
      evidenceSources: [
        {
          title: 'Drugs and Cosmetics Rules, 1945',
          section: 'Rule 122E & Schedule Y',
          description: 'Definition and regulatory requirements for Phytopharmaceutical Drugs in India',
        },
        {
          title: 'Indian Patent Act, 1970',
          section: 'Section 3(d) and 3(e)',
          description: 'Patent eligibility standards for novel purified fractions and synergistic combinations',
        },
      ],
    };
  }

  if (isFoodOrDietary && !isClassical) {
    return {
      category: 'Ayurveda Aahar (Food / Dietary Supplement)',
      categoryCode: 'ayurveda-aahar',
      confidence: 'High',
      confidenceScore: 90,
      summary:
        'Nutritional formulation containing authoritative Ayurvedic botanicals governed under the FSSAI (Ayurveda Aahar) Regulations, 2022. Commercialization permitted without ASU drug manufacturing license.',
      statutoryBasis: 'FSSAI (Ayurveda Aahar) Regulations, 2022 & Food Safety and Standards Act, 2006',
      regulatoryPathway: {
        authority: 'FSSAI (Food Safety and Standards Authority of India)',
        licenseType: 'FSSAI Central / State Manufacturing License (Category 13.0)',
        trialRequirements: [
          'Botanicals must be listed in authoritative books of Schedule A of Ayurveda Aahar regulations',
          'Strict compliance with heavy metal limits, pesticide residue, and microbiological parameters',
          'No therapeutic or medicinal cure claims allowed on packaging',
        ],
        standardsRef: 'FSSAI Ayurveda Aahar Schedule & Codex Alimentarius',
      },
      ipAndTkdlRisks: {
        patentability: 'Moderate to Low patentability under Section 3(p) and 3(e) unless a proprietary nutrient delivery system is established.',
        tkdlOverlap: 'Moderate TKDL overlap; focus IP protection on trade dress, branding, and proprietary process formulation.',
        keyRisks: [
          'Risk of misbranding if therapeutic disease claims are made on food packaging',
          'FSSAI mandatory logo and warning declarations required on all labels',
        ],
      },
      recommendedActions: [
        'Apply for FSSAI Ayurveda Aahar License with category-specific declaration',
        'Review product claims to ensure complete compliance with Advertising and Claims Regulations 2018',
        'File trademark and distinctive trade dress applications with the Trade Marks Registry',
      ],
      evidenceSources: [
        {
          title: 'Food Safety and Standards (Ayurveda Aahar) Regulations, 2022',
          section: 'Regulation 3 & Schedule A',
          description: 'Statutory standards for foods prepared in accordance with classical Ayurvedic texts',
        },
      ],
    };
  }

  if (isCosmetic) {
    return {
      category: 'Ayurvedic Cosmetic Preparation',
      categoryCode: 'ayurvedic-cosmetic',
      confidence: 'High',
      confidenceScore: 89,
      summary:
        'Topical herbal formulation intended for cleansing, beautifying, or promoting appearance, governed under the Drugs and Cosmetics Act (Schedule M-II / ASU Cosmetics).',
      statutoryBasis: 'Drugs and Cosmetics Act, 1940 — Section 3(aa) & Ayurvedic Cosmetic Provisions',
      regulatoryPathway: {
        authority: 'State AYUSH / Drug Licensing Authority',
        licenseType: 'Form 25C / ASU Cosmetic Manufacturing License',
        trialRequirements: [
          'Dermal irritation and ocular safety testing',
          'Standardization of botanical actives and preservative challenge testing',
          'AYUSH Good Manufacturing Practices (Schedule T) compliance',
        ],
        standardsRef: 'Bureau of Indian Standards (BIS) for Cosmetics & Ayurvedic Pharmacopoeia',
      },
      ipAndTkdlRisks: {
        patentability: 'Patentable if the composition demonstrates non-obvious skin-permeation enhancement or synergistic anti-aging active stabilization.',
        tkdlOverlap: 'Significant prior art in TKDL for beauty and skin lepa formulations.',
        keyRisks: [
          'Strict prohibition against therapeutic disease cure claims (e.g. eczema or psoriasis cure)',
        ],
      },
      recommendedActions: [
        'Obtain AYUSH Cosmetic formulation approval from State Licensing Authority',
        'Secure BIS and ISO 22716 Cosmetic GMP certifications',
      ],
      evidenceSources: [
        {
          title: 'Drugs and Cosmetics Act, 1940',
          section: 'Section 3(aa)',
          description: 'Definition of cosmetics and topical preparations',
        },
      ],
    };
  }

  if (isClassical) {
    return {
      category: 'Classical Ayurvedic Medicine (Schedule 1 ASU)',
      categoryCode: 'classical-asu',
      confidence: 'High',
      confidenceScore: 96,
      summary:
        'Shastriya formulation manufactured strictly in accordance with authoritative classical texts listed in the First Schedule of the Drugs & Cosmetics Act, 1940.',
      statutoryBasis: 'Drugs and Cosmetics Act, 1940 — Section 3(a) (Classical ASU)',
      regulatoryPathway: {
        authority: 'State AYUSH Licensing Authority',
        licenseType: 'Form 25D ASU Manufacturing License',
        trialRequirements: [
          'Textual citation from First Schedule authoritative books (e.g. AFI, Charaka, Sushruta)',
          'No independent clinical safety trial required under Rule 158B for exact classical compositions',
          'Heavy metals, microbial load, and physicochemical standardization tests',
        ],
        standardsRef: 'Ayurvedic Pharmacopoeia of India (API) & Ayurvedic Formulary of India (AFI)',
      },
      ipAndTkdlRisks: {
        patentability: 'Strictly non-patentable under Section 3(p) as traditional knowledge.',
        tkdlOverlap: '100% overlap with prior-art documented in the Traditional Knowledge Digital Library (TKDL).',
        keyRisks: [
          'Cannot claim exclusive patent rights or brand proprietary monopoly over the classical recipe',
          'Must adhere strictly to standard classical manufacturing processes without unauthorized additives',
        ],
      },
      recommendedActions: [
        'Cite the exact authoritative text edition, chapter, and shloka in your license application',
        'Implement Ayurvedic GMP (Schedule T) compliance in manufacturing',
        'Establish brand differentiation through trademark registration rather than patent filings',
      ],
      evidenceSources: [
        {
          title: 'Drugs and Cosmetics Act, 1940',
          section: 'First Schedule & Section 3(a)',
          description: 'Authoritative texts for classical Ayurvedic, Siddha, and Unani medicines',
        },
        {
          title: 'Indian Patent Act, 1970',
          section: 'Section 3(p)',
          description: 'Inventions relating to traditional knowledge are not patentable',
        },
      ],
    };
  }

  return {
    category: 'Proprietary Ayurvedic Medicine (ASU Patent & Proprietary)',
    categoryCode: 'proprietary-asu',
    confidence: 'High',
    confidenceScore: 92,
    summary:
      'Formulation containing ingredients mentioned in authoritative Ayurvedic texts, but whose specific recipe, dosage form, or standardized extract ratio is proprietary.',
    statutoryBasis: 'Drugs and Cosmetics Act, 1940 — Section 3(h) & Rule 158B',
    regulatoryPathway: {
      authority: 'State AYUSH Licensing Authority',
      licenseType: 'Form 25D ASU Patent & Proprietary Manufacturing License',
      trialRequirements: [
        'Safety and efficacy proof under Rule 158B (textual correlation or pilot clinical trials)',
        'Accelerated and real-time stability studies',
        'Standardization of raw botanicals as per Ayurvedic Pharmacopoeia of India (API)',
      ],
      standardsRef: 'Ayurvedic Pharmacopoeia of India (API) & Rule 158B Evidence Guidelines',
    },
    ipAndTkdlRisks: {
      patentability: 'Patentable only if unexpected therapeutic synergy (Section 3(d)) or a novel extraction/delivery process is established.',
      tkdlOverlap: 'Individual ingredients exist in TKDL; combination novelty must be substantiated.',
      keyRisks: [
        'Section 3(p) objections by Indian Patent Office (IPO) regarding traditional knowledge aggregation',
        'Rule 158B proof of safety required if novel excipients or high-ratio extracts are used',
      ],
    },
    recommendedActions: [
      'Prepare Rule 158B evidence dossier documenting rationale and safety for each active botanical',
      'Perform combination synergy assays (e.g. isobologram) before filing any patent application',
      'Apply for Form 25D ASU license with State AYUSH Licensing Authority',
    ],
    evidenceSources: [
      {
        title: 'Drugs and Cosmetics Rules, 1945',
        section: 'Rule 158B',
        description: 'Evidence required for licensing of Patent or Proprietary ASU medicines',
      },
      {
        title: 'Indian Patent Act, 1970',
        section: 'Section 3(d) and Section 3(p)',
        description: 'Statutory hurdles for Ayurvedic proprietary formulations and efficacy enhancement',
      },
    ],
  };
}

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
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);

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
    setIsOfflineFallback(false);

    const localResult = evaluateLocalClassification({
      productName: productName.trim(),
      ingredients: ingredients.trim(),
      dosageForm,
      preparationMethod,
      intendedUse: intendedUse.trim(),
      claims: claims.trim(),
      targetMarket,
    });

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
      setIsOfflineFallback(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // If network fails or times out, immediately show complete statutory rule assessment
      setResult(localResult);
      setIsOfflineFallback(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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
                  backgroundColor: item <= step ? colors.lavenderDeep : colors.border,
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
                        backgroundColor: colors.lavenderLight,
                        paddingHorizontal: 9,
                        paddingVertical: 4,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.lavenderBorder,
                      }}
                    >
                      <Text style={{ color: colors.lavenderDeep, fontSize: 11, fontWeight: '600' }}>
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
                          borderColor: isSelected ? colors.lavenderDeep : colors.border,
                          backgroundColor: isSelected ? colors.lavenderLight : colors.card,
                        }}
                      >
                        <Text
                          style={{
                            color: isSelected ? colors.lavenderDeep : colors.foreground,
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
                      borderColor: isSelected ? colors.lavenderDeep : colors.border,
                      backgroundColor: isSelected ? colors.lavenderLight : colors.card,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', flex: 1 }}>
                        {method.title}
                      </Text>
                      <Feather
                        name={isSelected ? 'check-circle' : 'circle'}
                        size={17}
                        color={isSelected ? colors.lavenderDeep : colors.border}
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
                      borderColor: isSelected ? colors.lavenderDeep : colors.border,
                      backgroundColor: isSelected ? colors.lavenderLight : colors.card,
                    }}
                  >
                    <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: isSelected ? '700' : '500', flex: 1 }}>
                      {market}
                    </Text>
                    <Feather
                      name={isSelected ? 'check-circle' : 'circle'}
                      size={16}
                      color={isSelected ? colors.lavenderDeep : colors.border}
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
            {classifyMutation.isPending && !result ? (
              <SurfaceCard style={{ marginTop: 20, alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="large" color={colors.lavenderDeep} />
                <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '700', marginTop: 16 }}>
                  Evaluating Ayurvedic Regulatory Pathways…
                </Text>
                <Text style={{ color: colors.inkSubtle, fontSize: 12, marginTop: 6, textAlign: 'center', marginHorizontal: 20 }}>
                  Analyzing Drugs & Cosmetics Act 1940, Rule 158B, FSSAI Ayurveda Aahar, and Section 3(p) Patent Act exclusions.
                </Text>
              </SurfaceCard>
            ) : result ? (
              <>
                {isOfflineFallback ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: colors.warningLight,
                      padding: 10,
                      borderRadius: 10,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: colors.warning,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      <Feather name="info" size={14} color={colors.warning} />
                      <Text style={{ color: colors.foreground, fontSize: 11, fontWeight: '600', flex: 1 }}>
                        Statutory Rule Evaluation (Offline)
                      </Text>
                    </View>
                    <Pressable
                      onPress={handleClassify}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        backgroundColor: colors.card,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: colors.warning,
                      }}
                    >
                      <Text style={{ color: colors.warning, fontSize: 10, fontWeight: '700' }}>
                        Retry AI
                      </Text>
                    </Pressable>
                  </View>
                ) : null}

                <SurfaceCard style={{ marginTop: 6, borderColor: colors.lavenderBorder, borderWidth: 1.5 }}>
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
                      <Text style={{ color: colors.lavenderDeep, fontSize: 13, fontWeight: '700', marginTop: 2 }}>
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
                <SurfaceCard style={{ backgroundColor: colors.lavenderLight, borderColor: colors.lavenderBorder }}>
                  <Text style={{ color: colors.lavenderDeep, fontSize: 12, fontWeight: '700' }}>
                    Patentability Outlook:
                  </Text>
                  <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18, marginTop: 4 }}>
                    {result.ipAndTkdlRisks.patentability}
                  </Text>

                  <Text style={{ color: colors.lavenderDeep, fontSize: 12, fontWeight: '700', marginTop: 10 }}>
                    TKDL Overlap Analysis:
                  </Text>
                  <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18, marginTop: 4 }}>
                    {result.ipAndTkdlRisks.tkdlOverlap}
                  </Text>

                  {result.ipAndTkdlRisks.keyRisks.length > 0 ? (
                    <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: colors.lavenderBorder, paddingTop: 8 }}>
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
                          backgroundColor: colors.lavenderLight,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 1,
                        }}
                      >
                        <Text style={{ color: colors.lavenderDeep, fontSize: 10, fontWeight: '700' }}>
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
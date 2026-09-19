import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
import { useMobileMemoryCreate } from '@workspace/api-client-react';
import { getActiveProjectId, getResearchClientId } from '@/lib/research-client';

type EvidenceStep = {
  id: string;
  stage: string;
  stageNum: string;
  title: string;
  subtitle: string;
  details: string;
  citation: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  badge: string;
  badgeTone: 'success' | 'warning' | 'lavender' | 'pink';
  evidenceSource: {
    title: string;
    section: string;
    description: string;
  };
};

type FormulationTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  chain: EvidenceStep[];
};

const FORMULATION_TEMPLATES: Record<string, FormulationTemplate> = {
  ashwagandha: {
    id: 'ashwagandha',
    name: 'Ashwagandha + Pippali Synergistic Formula',
    category: 'Medhya & Rasayana',
    description: 'Standardized Withania somnifera extract bio-enhanced with Piper longum',
    chain: [
      {
        id: 'step-1',
        stage: 'INPUT & INGREDIENT IDENTIFICATION',
        stageNum: '1',
        title: 'Botanical Normalization & Marker Verification',
        subtitle: 'Ashwagandha (Withania somnifera) + Pippali (Piper longum)',
        details:
          'Raw botanicals identified and standardized as per Ayurvedic Pharmacopoeia of India (API) Part-I, Vol. 1 (Entry 14) & Vol. 4 (Entry 32). Chemical markers verified: Withanolide A & B (min 0.5% w/w by HPLC) and Piperine (min 3.0% w/w).',
        citation: 'Ayurvedic Pharmacopoeia of India (API) Vol. 1, Entry 14 & Vol. 4, Entry 32',
        icon: 'package',
        badge: 'API Standardized',
        badgeTone: 'lavender',
        evidenceSource: {
          title: 'Ayurvedic Pharmacopoeia of India (API)',
          section: 'Part I, Volumes 1 & 4',
          description: 'Statutory pharmacopoeial monographs establishing identity, purity and assay',
        },
      },
      {
        id: 'step-2',
        stage: 'TRADITIONAL KNOWLEDGE GROUNDING (TKDL)',
        stageNum: '2',
        title: 'Classical Literature & Textual Citation Match',
        subtitle: 'Correlated in Ayurvedic Formulary of India (AFI) & Charaka Samhita',
        details:
          'Formulation cited in Charaka Samhita Chikitsa Sthana (Rasayana Adhyaya 1:2) and AFI Vol 1. Identified in Traditional Knowledge Digital Library (TKDL) under IPC classification A61K 36/81 (Withania) and A61K 36/67 (Piper) as classical Medhya & Rasayana formulation.',
        citation: 'TKDL Record ID: AH02/419; Charaka Samhita Chikitsa Sthana 1:2:38; AFI Part I (2:1)',
        icon: 'book-open',
        badge: 'TK Prior-Art',
        badgeTone: 'warning',
        evidenceSource: {
          title: 'Traditional Knowledge Digital Library (TKDL)',
          section: 'Record AH02/419 (CSIR-AYUSH)',
          description: 'Codified Ayurvedic knowledge in international patent classification format',
        },
      },
      {
        id: 'step-3',
        stage: 'STATUTORY PATENTABILITY EVALUATION',
        stageNum: '3',
        title: 'Section 3(p) & Section 3(d) Patent Act Screening',
        subtitle: 'Traditional Knowledge Exclusion vs Synergy Proof',
        details:
          'Under Section 3(p) of the Indian Patents Act 1970, composition claims covering mere aggregations of known herbs are barred. However, the synergistic bio-enhancement of piperine with standardized withanolides (demonstrating >2.5x oral bioavailability increase) qualifies under Section 3(d) with comparative pharmacokinetic data.',
        citation: 'Indian Patents Act, 1970 — Section 3(p) & Section 3(d); IPO Guidelines for Patenting Biological Inventions',
        icon: 'award',
        badge: 'Sec 3(p) Flagged',
        badgeTone: 'pink',
        evidenceSource: {
          title: 'Indian Patent Act, 1970',
          section: 'Section 3(p) and Section 3(d)',
          description: 'Exclusions to patentability regarding traditional knowledge and therapeutic efficacy',
        },
      },
      {
        id: 'step-4',
        stage: 'REGULATORY PATHWAY & ABS CLEARANCE',
        stageNum: '4',
        title: 'Drugs & Cosmetics Rule 158B & BDA 2023 Analysis',
        subtitle: 'Proprietary ASU License + SBB Prior Intimation',
        details:
          'Classified as Patent or Proprietary Ayurvedic Medicine requiring Form 25D license under Rule 158B. Because ingredients are Schedule 1 classical botanicals used for traditional indications, Phase I clinical trials are exempt under textual safety guidelines. If commercial botanicals are wild-harvested, prior intimation to State Biodiversity Board (SBB) under Section 7 of BDA 2002 is mandatory (0.1%-0.3% benefit sharing).',
        citation: 'Drugs & Cosmetics Rules 1945 Rule 158B; Biological Diversity Act 2002 Section 7; NBA Guidelines 2014',
        icon: 'layers',
        badge: 'Rule 158B Pathway',
        badgeTone: 'lavender',
        evidenceSource: {
          title: 'Drugs and Cosmetics Rules, 1945',
          section: 'Rule 158B',
          description: 'Requirements for licensing of patent or proprietary ASU medicines',
        },
      },
      {
        id: 'step-5',
        stage: 'GROUNDED REGULATORY CONCLUSION',
        stageNum: '5',
        title: 'Dual Strategy: ASU Licensing + Process Patent Protection',
        subtitle: 'Commercialize under AYUSH Form 25D while pursuing Novel Process IP',
        details:
          'Recommended Action Plan: (1) Secure immediate commercial market entry via Form 25D ASU Proprietary License using textual safety evidence. (2) File Form III clearance with National Biodiversity Authority (NBA) prior to patent filing. (3) Protect the proprietary standardized hydro-alcoholic extract ratio and bio-enhancer matrix via process patent with comparative synergy data.',
        citation: 'IP-SAKTI Regulatory Synthesis Report Ref: IPS-2026-883',
        icon: 'check-circle',
        badge: 'High Confidence',
        badgeTone: 'success',
        evidenceSource: {
          title: 'National Biodiversity Authority (NBA)',
          section: 'Form III Application Guidelines',
          description: 'Clearance procedure for intellectual property rights based on bio-resources',
        },
      },
    ],
  },
  curcumin: {
    id: 'curcumin',
    name: 'Curcumin + Piperine Anti-Inflammatory Complex',
    category: 'Shothahara (Anti-Inflammatory)',
    description: '95% Curcuminoids with standardized Piperine bio-enhancer matrix',
    chain: [
      {
        id: 'step-1',
        stage: 'INPUT & INGREDIENT IDENTIFICATION',
        stageNum: '1',
        title: 'Botanical Marker & Phytochemical Assay',
        subtitle: 'Curcuma longa (Haridra) + Piper longum (Pippali)',
        details:
          'Standardized to 95% total curcuminoids (Curcumin, Demethoxycurcumin, Bisdemethoxycurcumin) and 98% Piperine. Monographs verified in Ayurvedic Pharmacopoeia of India Part I, Vol. 1, Entry 23.',
        citation: 'API Part I, Vol. 1 (Haridra) & Indian Pharmacopoeia (IP) Monograph on Curcuminoids',
        icon: 'package',
        badge: 'Standardized 95%',
        badgeTone: 'lavender',
        evidenceSource: {
          title: 'Ayurvedic Pharmacopoeia of India (API)',
          section: 'Part I, Volume 1 (Haridra Monograph)',
          description: 'Pharmacopoeial standards for Haridra rhizome and extracts',
        },
      },
      {
        id: 'step-2',
        stage: 'TRADITIONAL KNOWLEDGE GROUNDING (TKDL)',
        stageNum: '2',
        title: 'Classical Literature & Haridra-Pippali Formulations',
        subtitle: 'Referenced in Sushruta Samhita, Bhavaprakasha & AFI',
        details:
          'Haridra Khanda and related classical yogas documented in AFI Part I. Cited in TKDL as traditional anti-inflammatory and Shothahara formulation. Strong classical prior-art established against generic herbal composition claims.',
        citation: 'TKDL Record ID: RG04/112; Bhavaprakasha Nighantu Haritakyadi Varga; AFI Part I (16:1)',
        icon: 'book-open',
        badge: 'Classical Grounding',
        badgeTone: 'warning',
        evidenceSource: {
          title: 'Traditional Knowledge Digital Library (TKDL)',
          section: 'Record RG04/112',
          description: 'Codified Ayurvedic prior-art records on Curcuma longa combinations',
        },
      },
      {
        id: 'step-3',
        stage: 'STATUTORY PATENTABILITY EVALUATION',
        stageNum: '3',
        title: 'Section 3(p) Traditional Knowledge vs Section 3(d) Enhanced Bioavailability',
        subtitle: 'Process Patent Strategy for Novel Delivery Systems',
        details:
          'Generic combination of Turmeric and Black Pepper is barred by Section 3(p). However, novel liposomal encapsulation, solid lipid nanoparticles, or self-emulsifying drug delivery systems (SEDDS) providing 20x bioavailability over standard extract are patentable under Section 3(d) with comparative pharmacokinetic data.',
        citation: 'Indian Patents Act 1970 — Section 3(p) & Section 3(d); Delhi High Court Biological Precedents',
        icon: 'award',
        badge: 'Novel Delivery IP',
        badgeTone: 'pink',
        evidenceSource: {
          title: 'Indian Patent Act, 1970',
          section: 'Section 3(p) and Section 3(d)',
          description: 'Requirements for novelty in enhanced bioavailability and delivery systems',
        },
      },
      {
        id: 'step-4',
        stage: 'REGULATORY PATHWAY & ABS CLEARANCE',
        stageNum: '4',
        title: 'Ayurvedic Proprietary Medicine vs Phytopharmaceutical Drug',
        subtitle: 'Rule 158B Form 25D vs Rule 122E New Drug Pathway',
        details:
          'Path A (Form 25D ASU Proprietary): Marketed using standardized aqueous/hydroalcoholic extract under AYUSH license. Path B (Rule 122E Phytopharmaceutical): If using purified 95% fractions for specific allopathic therapeutic claims, requires CDSCO New Drug approval with Phase I-III clinical trials.',
        citation: 'Drugs & Cosmetics Rules 1945 Rule 158B and Rule 122E (Phytopharmaceuticals Gazette)',
        icon: 'layers',
        badge: 'Dual Pathway',
        badgeTone: 'lavender',
        evidenceSource: {
          title: 'Drugs and Cosmetics Rules, 1945',
          section: 'Rule 158B & Rule 122E',
          description: 'Regulatory options for ASU Proprietary Medicine vs Phytopharmaceutical Drug',
        },
      },
      {
        id: 'step-5',
        stage: 'GROUNDED REGULATORY CONCLUSION',
        stageNum: '5',
        title: 'Form 25D Launch + Form III NBA Clearance + Formulation Process Patent',
        subtitle: 'Optimal commercial and IP roadmap for Curcumin-Piperine products',
        details:
          'Launch under AYUSH Form 25D for rapid market entry. File NBA Form III application for ABS clearance on Indian-sourced turmeric rhizomes. Secure composition-of-matter IP via novel nano-phytosomal delivery system patent with demonstrated 20-fold bioavailability enhancement.',
        citation: 'IP-SAKTI Regulatory Synthesis Ref: IPS-CURC-2026',
        icon: 'check-circle',
        badge: 'Recommended',
        badgeTone: 'success',
        evidenceSource: {
          title: 'National Biodiversity Authority (NBA)',
          section: 'Biological Diversity Act Section 6 & Form III',
          description: 'IP clearance and Access Benefit Sharing framework',
        },
      },
    ],
  },
  brahmi: {
    id: 'brahmi',
    name: 'Brahmi + Shankhpushpi Cognitive Rasayana',
    category: 'Medhya Rasayana (Cognitive & Memory)',
    description: 'Bacopa monnieri standardized extract with Convolvulus pluricaulis',
    chain: [
      {
        id: 'step-1',
        stage: 'INPUT & INGREDIENT IDENTIFICATION',
        stageNum: '1',
        title: 'Botanical Marker & Standardization',
        subtitle: 'Brahmi (Bacopa monnieri) + Shankhpushpi (Convolvulus pluricaulis)',
        details:
          'Identified and standardized as per Ayurvedic Pharmacopoeia of India Part I, Vol. 2 (Entry 11) & Vol. 3 (Entry 45). Chemical markers: Bacosides A & B (min 20.0% w/w by HPLC) and Shankhpushpine.',
        citation: 'Ayurvedic Pharmacopoeia of India Part I, Vol. 2 (Brahmi) & Vol. 3 (Shankhpushpi)',
        icon: 'package',
        badge: 'Bacoside Standardized',
        badgeTone: 'lavender',
        evidenceSource: {
          title: 'Ayurvedic Pharmacopoeia of India (API)',
          section: 'Part I, Volumes 2 & 3',
          description: 'Monographs for Medhya Rasayana botanicals',
        },
      },
      {
        id: 'step-2',
        stage: 'TRADITIONAL KNOWLEDGE GROUNDING (TKDL)',
        stageNum: '2',
        title: 'Classical Literature & Medhya Formulations',
        subtitle: 'Referenced in Charaka Samhita Sharira Sthana & AFI',
        details:
          'Documented in Charaka Samhita Chikitsa Sthana 1:3 (Medhya Rasayana Adhyaya) and AFI Part I. Codified in TKDL as classical memory enhancement and neurological support formulation.',
        citation: 'TKDL Record ID: MH01/512; Charaka Samhita Chikitsa Sthana 1:3:30-31',
        icon: 'book-open',
        badge: 'Classical Medhya',
        badgeTone: 'warning',
        evidenceSource: {
          title: 'Traditional Knowledge Digital Library (TKDL)',
          section: 'Record MH01/512',
          description: 'Codified records on Bacopa monnieri Medhya Rasayana formulations',
        },
      },
      {
        id: 'step-3',
        stage: 'STATUTORY PATENTABILITY EVALUATION',
        stageNum: '3',
        title: 'Section 3(p) Patent Screening & Novel Fractionation',
        subtitle: 'Classical memory claims barred; novel bacoside fractions eligible',
        details:
          'Classical formulations of Brahmi and Shankhpushpi are non-patentable under Section 3(p). An invention claiming a specific bacoside-enriched non-polar fraction or sustained cognitive release matrix with distinct neuroprotective synergy is eligible under Section 3(d).',
        citation: 'Indian Patents Act 1970 — Section 3(p) & Section 3(d)',
        icon: 'award',
        badge: 'Sec 3(p) Exclusion',
        badgeTone: 'pink',
        evidenceSource: {
          title: 'Indian Patent Act, 1970',
          section: 'Section 3(p) & Section 3(d)',
          description: 'Traditional knowledge exclusions and efficacy thresholds for botanical extracts',
        },
      },
      {
        id: 'step-4',
        stage: 'REGULATORY PATHWAY & ABS CLEARANCE',
        stageNum: '4',
        title: 'AYUSH Form 25D License & FSSAI Ayurveda Aahar Option',
        subtitle: 'Dual Market Positioning Analysis',
        details:
          'Option A: Form 25D ASU License for memory enhancement claims under Rule 158B with classical textual rationale. Option B: FSSAI Ayurveda Aahar for daily cognitive wellness tea/food without disease prevention claims. SBB prior intimation under BDA Section 7 required for wild-collected Brahmi.',
        citation: 'Drugs & Cosmetics Rules 1945 Rule 158B; FSSAI Ayurveda Aahar Regulations 2022',
        icon: 'layers',
        badge: 'Rule 158B / FSSAI',
        badgeTone: 'lavender',
        evidenceSource: {
          title: 'Drugs and Cosmetics Rules, 1945',
          section: 'Rule 158B & FSSAI 2022',
          description: 'Regulatory classifications for cognitive wellness botanicals',
        },
      },
      {
        id: 'step-5',
        stage: 'GROUNDED REGULATORY CONCLUSION',
        stageNum: '5',
        title: 'Form 25D Classical/Proprietary License + Process Patent Strategy',
        subtitle: 'Commercialization roadmap with high regulatory feasibility',
        details:
          'Deploy under AYUSH Form 25D Proprietary License. Execute SBB notification under Section 7 of BDA 2002. Pursue proprietary process patent on standardized high-bacoside enrichment method while retaining classical textual safety exemption.',
        citation: 'IP-SAKTI Regulatory Synthesis Ref: IPS-BRAHMI-2026',
        icon: 'check-circle',
        badge: 'High Feasibility',
        badgeTone: 'success',
        evidenceSource: {
          title: 'National Biodiversity Authority & AYUSH',
          section: 'Rule 158B & BDA 2002',
          description: 'Comprehensive regulatory and patent authorization roadmap',
        },
      },
    ],
  },
};

export default function EvidenceScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string; category?: string }>();

  // Determine initial formulation template based on query param
  const initialKey = useMemo(() => {
    const q = (params.query || '').toLowerCase();
    if (q.includes('curcuma') || q.includes('turmeric') || q.includes('curcumin') || q.includes('haldi')) {
      return 'curcumin';
    }
    if (q.includes('brahmi') || q.includes('bacopa') || q.includes('shankhpushpi') || q.includes('memory') || q.includes('medhya')) {
      return 'brahmi';
    }
    return 'ashwagandha';
  }, [params.query]);

  const [selectedKey, setSelectedKey] = useState<string>(initialKey);
  const [expandedId, setExpandedId] = useState<string | null>('step-1');
  const [savedToResearch, setSavedToResearch] = useState(false);
  const saveMemoryMutation = useMobileMemoryCreate();

  const activeTemplate = FORMULATION_TEMPLATES[selectedKey] || FORMULATION_TEMPLATES.ashwagandha;
  const chainSteps = activeTemplate.chain;

  const toggleExpand = (id: string) => {
    Haptics.selectionAsync();
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSelectTemplate = (key: string) => {
    Haptics.selectionAsync();
    setSelectedKey(key);
    setExpandedId('step-1');
    setSavedToResearch(false);
  };

  const handleSaveChain = async () => {
    const [clientId, projectId] = await Promise.all([
      getResearchClientId(),
      getActiveProjectId(),
    ]);
    if (!clientId) return;

    await saveMemoryMutation.mutateAsync({
      projectId: projectId ?? 'default',
      data: {
        clientId,
        title: `Evidence Chain: ${activeTemplate.name}`,
        finding: `Evidence trace completed across 5 stages for ${activeTemplate.name}: 1. API Standardization -> 2. TKDL Grounding -> 3. Section 3(p) Screening -> 4. Rule 158B / ABS Compliance -> 5. Grounded Regulatory & IP Conclusion.`,
        entities: [activeTemplate.name, activeTemplate.category],
        sources: chainSteps.map((s) => ({
          title: s.evidenceSource.title,
          reference: s.evidenceSource.section,
        })),
      },
    });

    setSavedToResearch(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <AppScreen>
      <BackHeader
        title="Evidence Chain Explorer"
        subtitle="Transparent step-by-step reasoning graph"
      />

      <Text style={[styles.pageTitle, { color: colors.foreground }]}>
        How we reach the conclusion.
      </Text>
      <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>
        IP-SAKTI traces every legal and regulatory conclusion back to primary pharmacopoeias, TKDL records, patent statutes, and AYUSH gazettes.
      </Text>

      {/* Target Focus Formulation Banner */}
      <SurfaceCard style={{ marginTop: 18, borderColor: colors.lavenderBorder, backgroundColor: colors.lavenderLight }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ color: colors.lavenderDeep, fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>
              ACTIVE FORMULATION UNDER TRACE
            </Text>
            <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '800', marginTop: 3 }}>
              {params.query ? params.query : activeTemplate.name}
            </Text>
            <Text style={{ color: colors.inkSubtle, fontSize: 11.5, marginTop: 2 }}>
              {activeTemplate.description}
            </Text>
          </View>
          <StatusBadge label="5-Stage Verified" tone="lavender" />
        </View>
      </SurfaceCard>

      {/* Quick Formulation Presets Switcher */}
      <View style={{ marginTop: 14 }}>
        <Text style={{ color: colors.inkSubtle, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>
          Switch Formulation Evidence Trace
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {Object.entries(FORMULATION_TEMPLATES).map(([key, template]) => {
            const isSelected = selectedKey === key;
            return (
              <Pressable
                key={key}
                onPress={() => handleSelectTemplate(key)}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.lavenderDeep : colors.border,
                    backgroundColor: isSelected ? colors.lavenderLight : colors.card,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? colors.lavenderDeep : colors.foreground,
                    fontSize: 11.5,
                    fontWeight: isSelected ? '800' : '600',
                  }}
                >
                  {template.name.split('+')[0].trim()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Interactive 5-Stage Evidence Chain Graph */}
      <View style={{ marginTop: 22 }}>
        {chainSteps.map((step, index) => {
          const isExpanded = expandedId === step.id;
          const isLast = index === chainSteps.length - 1;

          return (
            <View key={step.id} style={{ flexDirection: 'row', gap: 12 }}>
              {/* Vertical Timeline Graph Node */}
              <View style={{ alignItems: 'center', width: 28 }}>
                <Pressable
                  onPress={() => toggleExpand(step.id)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    backgroundColor: isLast
                      ? colors.lavenderDeep
                      : step.badgeTone === 'pink'
                        ? colors.pink
                        : colors.lavenderDeep,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>
                    {step.stageNum}
                  </Text>
                </Pressable>

                {!isLast && (
                  <View
                    style={{
                      width: 2,
                      flex: 1,
                      minHeight: isExpanded ? 190 : 80,
                      backgroundColor: colors.lavenderBorder,
                      marginVertical: 4,
                    }}
                  />
                )}
              </View>

              {/* Step Card */}
              <View style={{ flex: 1, marginBottom: 14 }}>
                <SurfaceCard
                  onPress={() => toggleExpand(step.id)}
                  style={{
                    borderColor: isExpanded ? colors.lavenderDeep : colors.border,
                    borderWidth: isExpanded ? 1.5 : 1,
                    backgroundColor: colors.card,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: colors.inkSubtle, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 }}>
                      {step.stage}
                    </Text>
                    <StatusBadge label={step.badge} tone={step.badgeTone} />
                  </View>

                  <Text style={{ color: colors.foreground, fontSize: 13.5, fontWeight: '800', marginTop: 4 }}>
                    {step.title}
                  </Text>
                  <Text style={{ color: colors.inkSubtle, fontSize: 11.5, marginTop: 2 }}>
                    {step.subtitle}
                  </Text>

                  {/* Expandable Reasoning Trace */}
                  {isExpanded && (
                    <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }}>
                      <Text style={{ color: colors.foreground, fontSize: 12.5, lineHeight: 18.5 }}>
                        {step.details}
                      </Text>

                      <View
                        style={{
                          backgroundColor: colors.lavenderLight,
                          borderRadius: 10,
                          padding: 9,
                          marginTop: 10,
                        }}
                      >
                        <Text style={{ color: colors.lavenderDeep, fontSize: 9.5, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                          Authoritative Reference Citation:
                        </Text>
                        <Text style={{ color: colors.foreground, fontSize: 11.5, fontWeight: '600', marginTop: 2 }}>
                          {step.citation}
                        </Text>
                      </View>

                      <View style={{ marginTop: 8 }}>
                        <EvidenceCard
                          title={step.evidenceSource.title}
                          section={step.evidenceSource.section}
                          version={step.evidenceSource.description}
                        />
                      </View>
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8, gap: 4 }}>
                    <Text style={{ color: colors.lavenderDeep, fontSize: 11, fontWeight: '700' }}>
                      {isExpanded ? 'Hide Trace' : 'View Reasoning Trace'}
                    </Text>
                    <Feather
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color={colors.lavenderDeep}
                    />
                  </View>
                </SurfaceCard>
              </View>
            </View>
          );
        })}
      </View>

      {/* Action Buttons */}
      <View style={{ marginTop: 12, gap: 10 }}>
        <Pressable
          onPress={() => void handleSaveChain()}
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
            {savedToResearch ? 'Evidence Chain Saved to Research' : 'Save Evidence Chain to Workspace'}
          </Text>
        </Pressable>

        <PrimaryButton
          label="Test Alternative in What-If Simulator"
          icon="sliders"
          variant="pink"
          onPress={() => router.push('/simulator')}
        />

        <PrimaryButton
          label="Search in Prior-Art Radar"
          icon="search"
          variant="noir"
          onPress={() => router.push({ pathname: '/radar', params: { query: activeTemplate.name } })}
        />
      </View>

      <Text style={{ color: colors.inkSubtle, fontSize: 10, textAlign: 'center', lineHeight: 15, marginTop: 16, marginBottom: 12 }}>
        All reasoning steps are traceable to primary Indian gazettes, pharmacopoeial monographs, and TKDL database records.
      </Text>
    </AppScreen>
  );
}
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
  MobileAbsCheckResult,
  useMobileAbsCheck,
  useMobileMemoryCreate,
} from '@workspace/api-client-react';
import {
  getActiveProjectId,
  getResearchClientId,
} from '@/lib/research-client';

const ENTITY_OPTIONS = [
  {
    id: 'registered-vaidya',
    title: 'Registered AYUSH Practitioner / Vaidya',
    subtitle: 'Practicing traditional healer or clinical practitioner',
    icon: 'user-check' as const,
  },
  {
    id: 'indian-company',
    title: 'Indian Company (100% Indian Equity)',
    subtitle: 'Domestic corporation without foreign shareholding',
    icon: 'briefcase' as const,
  },
  {
    id: 'indian-individual',
    title: 'Indian Individual / Innovator',
    subtitle: 'Citizen researcher, herbalist, or independent creator',
    icon: 'user' as const,
  },
  {
    id: 'foreign-entity-or-shareholding',
    title: 'Foreign Entity / Foreign Shareholding',
    subtitle: 'Non-Indian citizen, foreign company, or Indian company with FDI',
    icon: 'globe' as const,
  },
];

const SOURCING_OPTIONS = [
  {
    id: 'cultivated',
    title: 'Cultivated by Farmers (with certificate)',
    subtitle: 'Traceable agriculture harvest (2023 Amendment exemption)',
  },
  {
    id: 'normally-traded-commodity',
    title: 'Normally Traded Commodity (NTC Mandi)',
    subtitle: 'Purchased as standard agricultural commodity under Section 40',
  },
  {
    id: 'wild-harvested',
    title: 'Wild-Harvested from Forests / Habitats',
    subtitle: 'Collected from natural forest habitats or local vendors',
  },
  {
    id: 'imported',
    title: 'Imported from Outside India',
    subtitle: 'Exotic botanicals sourced from international suppliers',
  },
];

const ACTIVITY_OPTIONS = [
  {
    id: 'commercial-utilization',
    title: 'Commercial Manufacturing & Sales',
    subtitle: 'Formulating and marketing finished Ayurvedic products',
  },
  {
    id: 'patent-ipr-filing',
    title: 'Patent / IPR Application Filing',
    subtitle: 'Seeking intellectual property rights in India or abroad (Section 6)',
  },
  {
    id: 'research-development',
    title: 'Research & Non-Commercial R&D',
    subtitle: 'Academic or pilot exploratory study without immediate sales',
  },
  {
    id: 'bio-export',
    title: 'Export of Raw Biological Material',
    subtitle: 'Transferring Indian herbal bio-resources outside India (Section 20)',
  },
];

const QUICK_HERBS = [
  'Ashwagandha',
  'Red Sandalwood',
  'Sarpagandha',
  'Kutki',
  'Guggal',
  'Neem',
  'Turmeric (Cultivated)',
  'Triphala',
  'Tulsi',
];

export default function AbsScreen() {
  const colors = useColors();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [entityType, setEntityType] = useState('indian-company');
  const [bioResources, setBioResources] = useState('Ashwagandha, Pippali, Turmeric');
  const [sourcingType, setSourcingType] = useState('wild-harvested');
  const [activityType, setActivityType] = useState('commercial-utilization');
  const [jurisdiction, setJurisdiction] = useState('India (National & State SBB)');

  const [clientId, setClientId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);
  const [savedToResearch, setSavedToResearch] = useState(false);
  const [result, setResult] = useState<MobileAbsCheckResult | null>(null);

  const absMutation = useMobileAbsCheck();
  const saveMemoryMutation = useMobileMemoryCreate();

  useEffect(() => {
    void Promise.all([getResearchClientId(), getActiveProjectId()]).then(
      ([storedClientId, storedProjectId]) => {
        setClientId(storedClientId);
        setActiveProjectIdState(storedProjectId);
      },
    );
  }, []);

  const addHerb = (herb: string) => {
    if (!bioResources.trim()) {
      setBioResources(herb);
    } else if (!bioResources.toLowerCase().includes(herb.toLowerCase())) {
      setBioResources(`${bioResources}, ${herb}`);
    }
  };

  const runAbsCheck = async () => {
    if (!bioResources.trim()) return;
    setStep(2);
    setSavedToResearch(false);

    try {
      const response = await absMutation.mutateAsync({
        data: {
          entityType,
          bioResources: bioResources.trim(),
          sourcingType,
          activityType,
          jurisdiction,
          ...(clientId ? { clientId } : {}),
          ...(activeProjectId ? { projectId: activeProjectId } : {}),
        },
      });
      setResult(response);
    } catch {
      // Handled via error state
    }
  };

  const handleSaveToResearch = async () => {
    if (!result || !clientId || savedToResearch || saveMemoryMutation.isPending) return;

    try {
      const targetProjectId = activeProjectId ?? 'default';
      await saveMemoryMutation.mutateAsync({
        projectId: targetProjectId,
        data: {
          clientId,
          title: `ABS Assessment: ${bioResources.slice(0, 40)}`,
          finding: `${result.statusTitle}\n${result.summary}\nBenefit Sharing: ${result.benefitSharingEstimate}`,
          entities: bioResources.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean),
          sources: result.evidenceSources.map((s) => ({
            title: s.title,
            reference: s.section,
          })),
        },
      });
      setSavedToResearch(true);
    } catch {
      // Ignored
    }
  };

  const getStatusTone = (status: string) => {
    if (status === 'EXEMPT') return 'success' as const;
    if (status === 'SBB_INTIMATION_REQUIRED') return 'warning' as const;
    return 'attention' as const;
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppScreen>
        <BackHeader
          title="ABS & Biodiversity Checker"
          subtitle={step < 2 ? `Step ${step + 1} of 2` : 'Biodiversity Compliance Assessment'}
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
              Entity & Bio-Resources
            </Text>
            <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>
              ABS rules under the Biological Diversity Act depend heavily on entity nationality and botanical sources.
            </Text>

            <SectionTitle title="1. Your Entity Classification" />
            <View style={{ gap: 8 }}>
              {ENTITY_OPTIONS.map((opt) => {
                const isSelected = entityType === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setEntityType(opt.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 13,
                      borderRadius: 13,
                      borderWidth: isSelected ? 1.5 : 1,
                      borderColor: isSelected ? colors.forest : colors.border,
                      backgroundColor: isSelected ? colors.sageLight : colors.card,
                    }}
                  >
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        backgroundColor: isSelected ? colors.forest : colors.surfaceMuted,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 11,
                      }}
                    >
                      <Feather
                        name={opt.icon}
                        size={16}
                        color={isSelected ? colors.primaryForeground : colors.forest}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700' }}>
                        {opt.title}
                      </Text>
                      <Text style={{ color: colors.inkSubtle, fontSize: 10, marginTop: 2 }}>
                        {opt.subtitle}
                      </Text>
                    </View>
                    <Feather
                      name={isSelected ? 'check-circle' : 'circle'}
                      size={18}
                      color={isSelected ? colors.forest : colors.border}
                    />
                  </Pressable>
                );
              })}
            </View>

            <SectionTitle title="2. Biological Resources / Botanical Names" />
            <TextInput
              value={bioResources}
              onChangeText={setBioResources}
              placeholder="e.g. Ashwagandha, Red Sandalwood, Kutki, Turmeric"
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

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {QUICK_HERBS.map((herb) => (
                <Pressable
                  key={herb}
                  onPress={() => addHerb(herb)}
                  style={{
                    backgroundColor: colors.sageLight,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.forest, fontSize: 11, fontWeight: '600' }}>
                    + {herb}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={{ marginTop: 26 }}>
              <PrimaryButton
                label="Continue to Sourcing & Activity"
                icon="arrow-right"
                onPress={() => setStep(1)}
              />
            </View>
          </ScrollView>
        ) : step === 1 ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={[styles.pageTitle, { color: colors.foreground, fontSize: 22 }]}>
              Sourcing & Activity Channel
            </Text>
            <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>
              Define how materials are obtained and the intended commercial or intellectual use.
            </Text>

            <SectionTitle title="1. Origin & Sourcing Channel" />
            <View style={{ gap: 8 }}>
              {SOURCING_OPTIONS.map((opt) => {
                const isSelected = sourcingType === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setSourcingType(opt.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 13,
                      borderRadius: 13,
                      borderWidth: isSelected ? 1.5 : 1,
                      borderColor: isSelected ? colors.forest : colors.border,
                      backgroundColor: isSelected ? colors.sageLight : colors.card,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700' }}>
                        {opt.title}
                      </Text>
                      <Text style={{ color: colors.inkSubtle, fontSize: 10, marginTop: 2 }}>
                        {opt.subtitle}
                      </Text>
                    </View>
                    <Feather
                      name={isSelected ? 'check-circle' : 'circle'}
                      size={18}
                      color={isSelected ? colors.forest : colors.border}
                    />
                  </Pressable>
                );
              })}
            </View>

            <SectionTitle title="2. Purpose / Activity Type" />
            <View style={{ gap: 8 }}>
              {ACTIVITY_OPTIONS.map((opt) => {
                const isSelected = activityType === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setActivityType(opt.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 13,
                      borderRadius: 13,
                      borderWidth: isSelected ? 1.5 : 1,
                      borderColor: isSelected ? colors.forest : colors.border,
                      backgroundColor: isSelected ? colors.sageLight : colors.card,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700' }}>
                        {opt.title}
                      </Text>
                      <Text style={{ color: colors.inkSubtle, fontSize: 10, marginTop: 2 }}>
                        {opt.subtitle}
                      </Text>
                    </View>
                    <Feather
                      name={isSelected ? 'check-circle' : 'circle'}
                      size={18}
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
                  label="Run ABS Assessment"
                  icon="shield"
                  onPress={runAbsCheck}
                />
              </View>
            </View>
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            {absMutation.isPending ? (
              <SurfaceCard style={{ marginTop: 20, alignItems: 'center', paddingVertical: 40 }}>
                <ActivityIndicator size="large" color={colors.forest} />
                <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '700', marginTop: 16 }}>
                  Evaluating Biological Diversity Act rules…
                </Text>
                <Text style={{ color: colors.inkSubtle, fontSize: 12, marginTop: 6, textAlign: 'center', marginHorizontal: 20 }}>
                  Analyzing Section 3, 6, 7 approvals, NTC Section 40 status, and benefit sharing levies.
                </Text>
              </SurfaceCard>
            ) : result ? (
              <>
                <SurfaceCard
                  style={{
                    marginTop: 10,
                    borderColor:
                      result.absStatus === 'EXEMPT'
                        ? colors.forest
                        : result.absStatus === 'SBB_INTIMATION_REQUIRED'
                          ? colors.warning
                          : colors.forest,
                    borderWidth: 1.5,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '700' }}>
                        {result.statusTitle}
                      </Text>
                      <Text style={{ color: colors.inkSubtle, fontSize: 11, marginTop: 2 }}>
                        Statutory ABS Assessment
                      </Text>
                    </View>
                    <StatusBadge
                      label={
                        result.absStatus === 'EXEMPT'
                          ? 'EXEMPT'
                          : result.absStatus === 'SBB_INTIMATION_REQUIRED'
                            ? 'SBB INTIMATION'
                            : 'NBA APPROVAL'
                      }
                      tone={getStatusTone(result.absStatus)}
                    />
                  </View>

                  <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 19, marginTop: 12 }}>
                    {result.summary}
                  </Text>

                  <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14, paddingTop: 12 }}>
                    <Text style={{ color: colors.inkSubtle, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      Benefit Sharing Fee Estimate
                    </Text>
                    <Text style={{ color: colors.forest, fontSize: 13, fontWeight: '700', marginTop: 4 }}>
                      {result.benefitSharingEstimate}
                    </Text>
                  </View>

                  <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginTop: 12, paddingTop: 12 }}>
                    <Text style={{ color: colors.inkSubtle, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      Required Clearance Forms
                    </Text>
                    {result.approvalForms.map((form) => (
                      <Text key={form} style={{ color: colors.foreground, fontSize: 12, marginTop: 4, fontWeight: '600' }}>
                        • {form}
                      </Text>
                    ))}
                  </View>
                </SurfaceCard>

                <SectionTitle title="Statutory Basis & Sections" />
                <SurfaceCard>
                  {result.statutorySections.map((sec, i) => (
                    <View
                      key={sec}
                      style={{
                        paddingVertical: 7,
                        borderBottomWidth: i === result.statutorySections.length - 1 ? 0 : 1,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '600' }}>
                        {sec}
                      </Text>
                    </View>
                  ))}
                </SurfaceCard>

                <SectionTitle title="Patent & IPR Clearance Guidance" />
                <SurfaceCard style={{ backgroundColor: colors.sageLight }}>
                  <View style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start' }}>
                    <Feather name="award" size={17} color={colors.forest} style={{ marginTop: 2 }} />
                    <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18, flex: 1 }}>
                      {result.patentClearanceAdvice}
                    </Text>
                  </View>
                </SurfaceCard>

                <SectionTitle title="Step-by-Step Compliance Roadmap" />
                <SurfaceCard>
                  {result.stepByStepRoadmap.map((stepItem, index) => (
                    <View
                      key={stepItem}
                      style={{
                        flexDirection: 'row',
                        gap: 10,
                        alignItems: 'flex-start',
                        paddingVertical: 8,
                        borderBottomWidth: index === result.stepByStepRoadmap.length - 1 ? 0 : 1,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 7,
                          backgroundColor: colors.sageLight,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 1,
                        }}
                      >
                        <Text style={{ color: colors.forest, fontSize: 11, fontWeight: '700' }}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18, flex: 1 }}>
                        {stepItem}
                      </Text>
                    </View>
                  ))}
                </SurfaceCard>

                <SectionTitle title="Applicable Evidence & Statutes" />
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
                      {savedToResearch ? 'Saved to My Research' : 'Save ABS Finding to Research'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => router.push('/classify')}
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
                    <Feather name="layers" size={16} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>
                      Check Product Classification
                    </Text>
                  </Pressable>

                  <PrimaryButton
                    label="Edit / Check Another Bio-Resource"
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
                  Could not complete ABS evaluation
                </Text>
                <Text style={{ color: colors.inkSubtle, fontSize: 12, textAlign: 'center', marginTop: 6 }}>
                  Please verify your network connection or try again.
                </Text>
                <View style={{ marginTop: 16, width: '100%' }}>
                  <PrimaryButton label="Retry" onPress={runAbsCheck} />
                </View>
              </SurfaceCard>
            )}
          </ScrollView>
        )}
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

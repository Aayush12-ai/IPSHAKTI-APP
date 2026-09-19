import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
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

type LeverOption = {
  id: string;
  label: string;
  desc: string;
};

const LEVER_BOTANICALS: LeverOption[] = [
  { id: 'mono', label: 'Mono-Herb (Ashwagandha)', desc: 'Withania somnifera single classical root extract' },
  { id: 'synergy', label: 'Polyherbal Synergy (+ Pippali)', desc: 'Withania + Piper longum 10:1 bio-enhancer' },
  { id: 'triherbal', label: 'Tri-Herbal Rasayana (+ Brahmi)', desc: 'Withania + Bacopa monnieri + Shankhpushpi' },
  { id: 'purified', label: 'Phytochemical Fraction (95%)', desc: 'Purified Withanolide A & B isolated crystal' },
];

const LEVER_EXTRACTION: LeverOption[] = [
  { id: 'classical', label: 'Classical Kwatha/Swarasa', desc: 'Water decoction as per Charaka Samhita' },
  { id: 'standardized', label: 'Standardized Hydro-Alcoholic', desc: '5% Withanolides HPLC verified extract' },
  { id: 'sustained', label: 'Sustained-Release Matrix', desc: 'Lipid-coated multi-particulate pellet' },
  { id: 'liposomal', label: 'Liposomal Nano-Emulsion', desc: 'Self-emulsifying phospholipid nano-carrier' },
];

const LEVER_CLAIMS: LeverOption[] = [
  { id: 'wellness', label: 'Classical Rasayana / Vitality', desc: 'General stress relief and Balya (traditional claim)' },
  { id: 'therapeutic', label: 'Therapeutic Disease Treatment', desc: 'Clinical anti-arthritic & neuro-restorative' },
  { id: 'aahar', label: 'FSSAI Ayurveda Aahar Dietary', desc: 'Food supplement under FSSAI 2022 norms' },
  { id: 'phytopharm', label: 'Phytopharmaceutical Drug', desc: 'Allopathic herbal drug under Rule 122E' },
];

const LEVER_SOURCING: LeverOption[] = [
  { id: 'wild_in', label: 'India Wild-Harvested', desc: 'Forest sourced raw botanicals via local traders' },
  { id: 'cultivated_in', label: 'India Cultivated (NTC)', desc: 'Certified farmed botanicals under Section 40' },
  { id: 'usa_export', label: 'USA Export (FDA NDI)', desc: 'Dietary Supplement Health and Education Act' },
  { id: 'eu_export', label: 'EU Export (THMPD)', desc: 'Traditional Herbal Medicinal Products Directive' },
];

export default function SimulatorScreen() {
  const colors = useColors();
  const router = useRouter();

  const [botanical, setBotanical] = useState<string>('synergy');
  const [extraction, setExtraction] = useState<string>('standardized');
  const [claim, setClaim] = useState<string>('wellness');
  const [sourcing, setSourcing] = useState<string>('wild_in');

  const [savedToWorkspace, setSavedToWorkspace] = useState(false);
  const saveMemoryMutation = useMobileMemoryCreate();

  // Dynamic simulation calculations
  const simulation = useMemo(() => {
    // Patentability logic
    let ipRisk = 'High Sec 3(p) Risk';
    let ipTone: 'pink' | 'warning' | 'lavender' | 'success' = 'pink';
    let ipVerdict = 'Composition barred under Section 3(p) as traditional knowledge aggregation.';
    let ipAction = 'Pursue Process Patent or demonstrate pharmacokinetic synergy.';

    if (extraction === 'liposomal' || extraction === 'sustained') {
      ipRisk = 'Strong Delivery IP';
      ipTone = 'success';
      ipVerdict = 'Novel drug delivery system patentable under Section 3(d) with enhanced bioavailability.';
      ipAction = 'File composition-of-matter patent for proprietary delivery vehicle.';
    } else if (botanical === 'synergy' || botanical === 'purified') {
      ipRisk = 'Moderate Synergy Path';
      ipTone = 'lavender';
      ipVerdict = 'Bio-enhancer synergy eligible under Section 3(d) with comparative PK data.';
      ipAction = 'File process patent and comparative synergy data.';
    }

    // Regulatory Pathway logic
    let regPathway = 'Form 25D ASU Classical';
    let regTone: 'lavender' | 'pink' | 'warning' | 'success' = 'lavender';
    let regDetails = 'State AYUSH licensing based on First Schedule classical texts.';

    if (claim === 'phytopharm' || botanical === 'purified') {
      regPathway = 'Rule 122E Phytopharmaceutical';
      regTone = 'pink';
      regDetails = 'CDSCO New Drug approval required with Phase I-III clinical trials.';
    } else if (claim === 'aahar') {
      regPathway = 'FSSAI Ayurveda Aahar';
      regTone = 'success';
      regDetails = 'Food safety registration without therapeutic disease claims.';
    } else if (extraction === 'standardized' || botanical === 'synergy' || claim === 'therapeutic') {
      regPathway = 'Form 25D ASU Proprietary (Rule 158B)';
      regTone = 'lavender';
      regDetails = 'Proprietary ASU license with textual safety data & pilot stability study.';
    }

    // ABS Biodiversity Duty logic
    let absStatus = 'Section 7 SBB Intimation (0.1%-0.3% Levy)';
    let absTone: 'warning' | 'success' | 'lavender' = 'warning';
    let absDetails = 'Mandatory prior intimation to State Biodiversity Board for wild bio-resources.';

    if (sourcing === 'cultivated_in') {
      absStatus = 'Section 40 NTC SBB Exemption';
      absTone = 'success';
      absDetails = 'Cultivated botanicals traded as commodities exempt from ABS levy.';
    } else if (sourcing === 'usa_export' || sourcing === 'eu_export') {
      absStatus = 'Section 3 / Section 6 NBA Clearance';
      absTone = 'warning';
      absDetails = 'Mandatory Form III approval from National Biodiversity Authority before foreign IP/export.';
    }

    // Clinical Burden logic
    let clinicalBurden = 'Exempt (Textual Safety)';
    let clinicalTone: 'success' | 'warning' | 'pink' = 'success';

    if (claim === 'phytopharm' || botanical === 'purified') {
      clinicalBurden = 'Full Phase I-III Clinical Trials';
      clinicalTone = 'pink';
    } else if (claim === 'therapeutic' || extraction === 'liposomal') {
      clinicalBurden = 'Pilot Efficacy Study (Rule 158B)';
      clinicalTone = 'warning';
    }

    return {
      ipRisk,
      ipTone,
      ipVerdict,
      ipAction,
      regPathway,
      regTone,
      regDetails,
      absStatus,
      absTone,
      absDetails,
      clinicalBurden,
      clinicalTone,
    };
  }, [botanical, extraction, claim, sourcing]);

  const handleSaveScenario = async () => {
    const [clientId, projectId] = await Promise.all([
      getResearchClientId(),
      getActiveProjectId(),
    ]);
    if (!clientId) return;

    await saveMemoryMutation.mutateAsync({
      projectId: projectId ?? 'default',
      data: {
        clientId,
        title: `What-If Simulation: ${LEVER_BOTANICALS.find((b) => b.id === botanical)?.label}`,
        finding: `Simulation Configuration: Botanical: ${botanical}, Extraction: ${extraction}, Claim: ${claim}, Sourcing: ${sourcing}.\nIP Outcome: ${simulation.ipRisk} — ${simulation.ipVerdict}\nRegulatory: ${simulation.regPathway}\nABS: ${simulation.absStatus}\nClinical: ${simulation.clinicalBurden}`,
        entities: ['What-If Simulator', botanical, extraction, claim],
        sources: [
          { title: 'Drugs & Cosmetics Rule 158B', reference: 'ASU Proprietary Framework' },
          { title: 'Patents Act 1970', reference: 'Section 3(p) and 3(d)' },
          { title: 'Biological Diversity Act 2002', reference: simulation.absStatus },
        ],
      },
    });

    setSavedToWorkspace(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <AppScreen>
      <BackHeader title="What-If Simulator" subtitle="Model formulation & regulatory changes" />

      <Text style={[styles.pageTitle, { color: colors.foreground }]}>
        Formulation What-If Simulator
      </Text>
      <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>
        Modify ingredients, extraction methods, label claims, and sourcing to see live statutory impacts across Indian IP and AYUSH regulations.
      </Text>

      {/* SECTION 1: BOTANICAL LEVER */}
      <View style={{ marginTop: 18 }}>
        <Text style={{ color: colors.lavenderDeep, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>
          1. Botanical Active Formulation
        </Text>
        <View style={{ gap: 7 }}>
          {LEVER_BOTANICALS.map((opt) => {
            const isSelected = botanical === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setBotanical(opt.id);
                  setSavedToWorkspace(false);
                }}
                style={({ pressed }) => [
                  {
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: isSelected ? 1.5 : 1,
                    borderColor: isSelected ? colors.lavenderDeep : colors.border,
                    backgroundColor: isSelected ? colors.lavenderLight : colors.card,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.foreground, fontSize: 12.5, fontWeight: isSelected ? '800' : '600' }}>
                    {opt.label}
                  </Text>
                  {isSelected && <Feather name="check" size={14} color={colors.lavenderDeep} />}
                </View>
                <Text style={{ color: colors.inkSubtle, fontSize: 10.5, marginTop: 2 }}>
                  {opt.desc}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* SECTION 2: EXTRACTION LEVER */}
      <View style={{ marginTop: 18 }}>
        <Text style={{ color: colors.lavenderDeep, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>
          2. Extraction & Delivery Vehicle
        </Text>
        <View style={{ gap: 7 }}>
          {LEVER_EXTRACTION.map((opt) => {
            const isSelected = extraction === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setExtraction(opt.id);
                  setSavedToWorkspace(false);
                }}
                style={({ pressed }) => [
                  {
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: isSelected ? 1.5 : 1,
                    borderColor: isSelected ? colors.lavenderDeep : colors.border,
                    backgroundColor: isSelected ? colors.lavenderLight : colors.card,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.foreground, fontSize: 12.5, fontWeight: isSelected ? '800' : '600' }}>
                    {opt.label}
                  </Text>
                  {isSelected && <Feather name="check" size={14} color={colors.lavenderDeep} />}
                </View>
                <Text style={{ color: colors.inkSubtle, fontSize: 10.5, marginTop: 2 }}>
                  {opt.desc}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* SECTION 3: CLAIMS LEVER */}
      <View style={{ marginTop: 18 }}>
        <Text style={{ color: colors.lavenderDeep, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>
          3. Therapeutic Claim & Product Positioning
        </Text>
        <View style={{ gap: 7 }}>
          {LEVER_CLAIMS.map((opt) => {
            const isSelected = claim === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setClaim(opt.id);
                  setSavedToWorkspace(false);
                }}
                style={({ pressed }) => [
                  {
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: isSelected ? 1.5 : 1,
                    borderColor: isSelected ? colors.lavenderDeep : colors.border,
                    backgroundColor: isSelected ? colors.lavenderLight : colors.card,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.foreground, fontSize: 12.5, fontWeight: isSelected ? '800' : '600' }}>
                    {opt.label}
                  </Text>
                  {isSelected && <Feather name="check" size={14} color={colors.lavenderDeep} />}
                </View>
                <Text style={{ color: colors.inkSubtle, fontSize: 10.5, marginTop: 2 }}>
                  {opt.desc}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* SECTION 4: SOURCING & JURISDICTION */}
      <View style={{ marginTop: 18 }}>
        <Text style={{ color: colors.lavenderDeep, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>
          4. Sourcing & Target Jurisdiction
        </Text>
        <View style={{ gap: 7 }}>
          {LEVER_SOURCING.map((opt) => {
            const isSelected = sourcing === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSourcing(opt.id);
                  setSavedToWorkspace(false);
                }}
                style={({ pressed }) => [
                  {
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: isSelected ? 1.5 : 1,
                    borderColor: isSelected ? colors.lavenderDeep : colors.border,
                    backgroundColor: isSelected ? colors.lavenderLight : colors.card,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.foreground, fontSize: 12.5, fontWeight: isSelected ? '800' : '600' }}>
                    {opt.label}
                  </Text>
                  {isSelected && <Feather name="check" size={14} color={colors.lavenderDeep} />}
                </View>
                <Text style={{ color: colors.inkSubtle, fontSize: 10.5, marginTop: 2 }}>
                  {opt.desc}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* LIVE SIMULATION OUTPUT CARD */}
      <View style={{ marginTop: 24 }}>
        <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '800', marginBottom: 8 }}>
          Simulated Statutory Impact
        </Text>

        <SurfaceCard style={{ borderColor: colors.lavenderDeep, borderWidth: 1.5, backgroundColor: colors.card, padding: 16 }}>
          {/* Patentability */}
          <View style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ color: colors.lavenderDeep, fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                PATENTABILITY & SECTION 3(p)
              </Text>
              <StatusBadge label={simulation.ipRisk} tone={simulation.ipTone} />
            </View>
            <Text style={{ color: colors.foreground, fontSize: 12.5, lineHeight: 17, fontWeight: '600' }}>
              {simulation.ipVerdict}
            </Text>
            <Text style={{ color: colors.inkSubtle, fontSize: 11, marginTop: 2 }}>
              Strategic Recommendation: {simulation.ipAction}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />

          {/* Regulatory Pathway */}
          <View style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ color: colors.lavenderDeep, fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                REGULATORY LICENSING PATHWAY
              </Text>
              <StatusBadge label={simulation.regPathway} tone={simulation.regTone} />
            </View>
            <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 17 }}>
              {simulation.regDetails}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />

          {/* ABS & Biodiversity */}
          <View style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ color: colors.lavenderDeep, fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                BIODIVERSITY ACT & ABS DUTY
              </Text>
              <StatusBadge label={simulation.absStatus} tone={simulation.absTone} />
            </View>
            <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 17 }}>
              {simulation.absDetails}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />

          {/* Clinical Burden */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ color: colors.lavenderDeep, fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                CLINICAL TRIAL REQUIREMENT
              </Text>
              <StatusBadge label={simulation.clinicalBurden} tone={simulation.clinicalTone} />
            </View>
          </View>
        </SurfaceCard>
      </View>

      {/* ACTIONS */}
      <View style={{ marginTop: 18, gap: 10, marginBottom: 16 }}>
        <PrimaryButton
          label="Trace in 5-Stage Evidence Chain"
          icon="git-commit"
          variant="noir"
          onPress={() =>
            router.push({
              pathname: '/evidence',
              params: {
                query: `${LEVER_BOTANICALS.find((b) => b.id === botanical)?.label} (${LEVER_EXTRACTION.find((e) => e.id === extraction)?.label})`,
              },
            })
          }
        />

        <Pressable
          onPress={() => void handleSaveScenario()}
          disabled={savedToWorkspace || saveMemoryMutation.isPending}
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
              backgroundColor: savedToWorkspace ? colors.lavenderLight : colors.card,
              opacity: pressed || saveMemoryMutation.isPending ? 0.7 : 1,
            },
          ]}
        >
          <Feather
            name={savedToWorkspace ? 'check-circle' : 'bookmark'}
            size={16}
            color={savedToWorkspace ? colors.success : colors.lavenderDeep}
          />
          <Text style={{ color: savedToWorkspace ? colors.success : colors.lavenderDeep, fontSize: 13, fontWeight: '700' }}>
            {savedToWorkspace ? 'Scenario Saved to Research Workspace' : 'Save Simulated Scenario'}
          </Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}
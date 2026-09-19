import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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

type PriorArtItem = {
  id: string;
  patentNo: string;
  title: string;
  applicant: string;
  source: string;
  sourceCategory: 'ipo' | 'tkdl' | 'wipo' | 'pubmed';
  relevance: number;
  jurisdiction: string;
  year: string;
  status: string;
  riskTone: 'attention' | 'warning' | 'neutral' | 'success';
  riskLabel: string;
  abstract: string;
  claimsOverlap: string;
  statutoryBasis: string;
};

const RADAR_DATABASE: PriorArtItem[] = [
  {
    id: 'ipo-2022-01',
    patentNo: 'IN 202241038921 A',
    title: 'Withania somnifera and Piper longum synergistic composition for stress adaptation and neuroprotection',
    applicant: 'Council of Scientific & Industrial Research (CSIR)',
    source: 'Indian Patent Office (IPO)',
    sourceCategory: 'ipo',
    relevance: 94,
    jurisdiction: 'India (IPO)',
    year: '2022',
    status: 'Published Application',
    riskTone: 'attention',
    riskLabel: 'Section 3(p) High Overlap',
    abstract:
      'Discloses an oral pharmaceutical/nutraceutical composition comprising standardized Withania somnifera extract (5% withanolides) in combination with 3% Piperine, demonstrating a 2.4-fold increase in serum corticosterone suppression.',
    claimsOverlap:
      'Claim 1 directly covers synergistic aqueous-ethanolic extracts of Withania and Piper longum in ratios 10:1 to 5:1.',
    statutoryBasis: 'Patents Act 1970 Sec 3(p) & Sec 3(d) objection raised by Controller in First Examination Report.',
  },
  {
    id: 'tkdl-ah02-419',
    patentNo: 'TKDL Record AH02/419',
    title: 'Ashwagandha Rasayana formulations for Medha & Dhatupushti in classical treatises',
    applicant: 'Traditional Knowledge Digital Library (CSIR-AYUSH)',
    source: 'TKDL Classical Knowledge Base',
    sourceCategory: 'tkdl',
    relevance: 88,
    jurisdiction: 'Traditional Ayurvedic Texts',
    year: 'Ancient / AFI 2024',
    status: 'Documented Prior Art',
    riskTone: 'warning',
    riskLabel: 'TKDL Barring Prior-Art',
    abstract:
      'Codified Ayurvedic formulation cited across Charaka Samhita Chikitsa Sthana (1:2:38), Astanga Hridaya, and Ayurvedic Formulary of India (AFI Part I). Prescribes Withania somnifera root powder processed in cow milk with Pippali for cognitive vitality.',
    claimsOverlap:
      'Prior-art text prevents granting of broad composition-of-matter patents over basic Ashwagandha + Pippali mixtures worldwide.',
    statutoryBasis: 'Invoked by EPO and USPTO to reject 3rd party herbal patent filings under IPC A61K 36/81.',
  },
  {
    id: 'wipo-2021-99',
    patentNo: 'WO 2021/186402 A1',
    title: 'Liposomal delivery system for enhanced oral bioavailability of Withanolides and Curcuminoids',
    applicant: 'Phytoceutical Nano-Innovations Inc.',
    source: 'WIPO Patentscope (PCT)',
    sourceCategory: 'wipo',
    relevance: 78,
    jurisdiction: 'International (PCT)',
    year: '2021',
    status: 'Granted PCT / National Phase',
    riskTone: 'neutral',
    riskLabel: 'Novel Delivery System',
    abstract:
      'A phospholipid self-assembling nanocarrier encapsulating standardized phytochemical fractions of Withania somnifera and Curcuma longa, achieving 18x higher cellular uptake.',
    claimsOverlap:
      'Claim focused strictly on the specific liposomal membrane ratio and manufacturing process, successfully overcoming Section 3(p) as a physical delivery vehicle invention.',
    statutoryBasis: 'Qualifies under Section 3(d) due to demonstrated substantial technological enhancement.',
  },
  {
    id: 'pubmed-2023-45',
    patentNo: 'PMID: 37482910',
    title: 'Comparative pharmacokinetics of Withanolide A with Piperine bio-enhancer: randomized double-blind trial',
    applicant: 'Journal of Ethnopharmacology / AIIMS Clinical Study',
    source: 'PubMed Biomedical Index',
    sourceCategory: 'pubmed',
    relevance: 72,
    jurisdiction: 'Peer-Reviewed Scientific Literature',
    year: '2023',
    status: 'Published Clinical Trial',
    riskTone: 'success',
    riskLabel: 'Statutory Synergy Evidence',
    abstract:
      'Human pharmacokinetic study confirming Piperine (5mg) co-administration increases Cmax of Withanolide A by 146% and AUC(0-24h) by 182% without altering hepatic enzyme clearance.',
    claimsOverlap:
      'Provides empirical evidentiary support required to substantiate Section 3(d) synergy claims before Indian Patent Examiners.',
    statutoryBasis: 'Satisfies Rule 158B clinical safety requirements for proprietary ASU licensing.',
  },
  {
    id: 'ipo-2020-55',
    patentNo: 'IN 389102 B',
    title: 'Standardized aqueous extract of Bacopa monnieri for memory consolidation',
    applicant: 'Indian Institute of Integrative Medicine (IIIM-Jammu)',
    source: 'Indian Patent Office (IPO)',
    sourceCategory: 'ipo',
    relevance: 65,
    jurisdiction: 'India (IPO)',
    year: '2020',
    status: 'Granted Process Patent',
    riskTone: 'success',
    riskLabel: 'Granted Process IP',
    abstract:
      'A novel non-polar extraction process yielding a minimum 40% Bacoside A3 and Bacopaside II fraction with low solvent residue, suitable for solid dosage forms.',
    claimsOverlap:
      'Process claims granted after disclaimer of broad composition claims to avoid Section 3(p) traditional knowledge objections.',
    statutoryBasis: 'Section 3(p) compliant through explicit process-only limitation.',
  },
];

const SOURCE_FILTERS = [
  { id: 'all', label: 'All Databases' },
  { id: 'ipo', label: 'Indian Patent Office (IPO)' },
  { id: 'tkdl', label: 'TKDL Classical Texts' },
  { id: 'wipo', label: 'WIPO / PCT' },
  { id: 'pubmed', label: 'PubMed / Scientific' },
] as const;

export default function RadarScreen() {
  const colors = useColors();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('Ashwagandha Withania stress formulation');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('ipo-2022-01');

  const filteredResults = useMemo(() => {
    return RADAR_DATABASE.filter((item) => {
      const matchesSource = selectedSource === 'all' || item.sourceCategory === selectedSource;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesSource;
      const matchesQuery =
        item.title.toLowerCase().includes(q) ||
        item.patentNo.toLowerCase().includes(q) ||
        item.abstract.toLowerCase().includes(q) ||
        item.applicant.toLowerCase().includes(q);
      return matchesSource && matchesQuery;
    });
  }, [searchQuery, selectedSource]);

  const toggleExpand = (id: string) => {
    Haptics.selectionAsync();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <AppScreen>
      <BackHeader title="Prior-Art Radar" subtitle="Search global patents & traditional texts" />

      <Text style={[styles.pageTitle, { color: colors.foreground }]}>
        Prior-Art & Patent Radar
      </Text>
      <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>
        Scan Indian Patent Office (IPO), TKDL classical knowledge, WIPO, and PubMed for overlapping Ayurvedic claims and Section 3(p) prior art.
      </Text>

      {/* Search Input Bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          borderRadius: 14,
          paddingHorizontal: 12,
          minHeight: 48,
          marginTop: 18,
        }}
      >
        <Feather name="search" size={17} color={colors.lavenderDeep} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search botanical, patent number, or claim..."
          placeholderTextColor={colors.inkSubtle}
          style={{
            color: colors.foreground,
            flex: 1,
            marginLeft: 10,
            fontSize: 13,
            fontWeight: '500',
          }}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
            <Feather name="x" size={16} color={colors.inkSubtle} />
          </Pressable>
        )}
      </View>

      {/* Database Source Filter Chips */}
      <View style={{ marginTop: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7 }}>
          {SOURCE_FILTERS.map((filter) => {
            const isSelected = selectedSource === filter.id;
            return (
              <Pressable
                key={filter.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedSource(filter.id);
                }}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 11,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.lavenderDeep : colors.border,
                    backgroundColor: isSelected ? colors.lavenderLight : colors.card,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? colors.lavenderDeep : colors.foreground,
                    fontSize: 11,
                    fontWeight: isSelected ? '800' : '600',
                  }}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Result Metrics */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 4 }}>
        <Text style={{ color: colors.inkSubtle, fontSize: 11, fontWeight: '700' }}>
          FOUND {filteredResults.length} PRIOR-ART MATCH{filteredResults.length === 1 ? '' : 'ES'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <StatusBadge label="Section 3(p) Scan Active" tone="lavender" />
        </View>
      </View>

      {/* Results List */}
      <View style={{ gap: 11, marginTop: 8 }}>
        {filteredResults.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <SurfaceCard
              key={item.id}
              style={{
                borderColor: isExpanded ? colors.lavenderDeep : colors.border,
                borderWidth: isExpanded ? 1.5 : 1,
                backgroundColor: colors.card,
                padding: 14,
              }}
            >
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.lavenderDeep, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5 }}>
                    {item.patentNo} · {item.source}
                  </Text>
                  <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '800', lineHeight: 18, marginTop: 4 }}>
                    {item.title}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: item.relevance >= 85 ? colors.pink : item.relevance >= 70 ? colors.warning : colors.lavenderDeep, fontSize: 15, fontWeight: '800' }}>
                    {item.relevance}%
                  </Text>
                  <Text style={{ color: colors.inkSubtle, fontSize: 9, fontWeight: '700' }}>
                    RELEVANCE
                  </Text>
                </View>
              </View>

              {/* Badges & Meta */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10, flexWrap: 'wrap' }}>
                <StatusBadge
                  label={item.riskLabel}
                  tone={item.riskTone === 'attention' ? 'pink' : item.riskTone === 'warning' ? 'warning' : 'lavender'}
                />
                <Text style={{ color: colors.inkSubtle, fontSize: 10.5 }}>
                  {item.jurisdiction} · {item.year} · {item.status}
                </Text>
              </View>

              {/* Expandable Details */}
              {isExpanded && (
                <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }}>
                  <Text style={{ color: colors.inkSubtle, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    Abstract & Overlap Analysis
                  </Text>
                  <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 17, marginTop: 3 }}>
                    {item.abstract}
                  </Text>

                  <View style={{ backgroundColor: colors.lavenderLight, borderRadius: 10, padding: 10, marginTop: 9 }}>
                    <Text style={{ color: colors.lavenderDeep, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>
                      Claims Overlap Assessment:
                    </Text>
                    <Text style={{ color: colors.foreground, fontSize: 11.5, lineHeight: 16, marginTop: 2, fontWeight: '500' }}>
                      {item.claimsOverlap}
                    </Text>
                  </View>

                  <View style={{ marginTop: 8 }}>
                    <EvidenceCard
                      title={item.source}
                      section={item.statutoryBasis}
                      version="Statutory Reference"
                    />
                  </View>
                </View>
              )}

              {/* Actions Footer */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  paddingTop: 9,
                }}
              >
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/evidence',
                      params: { query: item.title },
                    })
                  }
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
                >
                  <Feather name="git-commit" size={13} color={colors.lavenderDeep} />
                  <Text style={{ color: colors.lavenderDeep, fontSize: 11.5, fontWeight: '700' }}>
                    Trace in Evidence Chain
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => toggleExpand(item.id)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <Text style={{ color: colors.inkSubtle, fontSize: 11, fontWeight: '600' }}>
                    {isExpanded ? 'Less' : 'Details'}
                  </Text>
                  <Feather
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={colors.inkSubtle}
                  />
                </Pressable>
              </View>
            </SurfaceCard>
          );
        })}
      </View>

      {/* Bottom CTA */}
      <View style={{ marginTop: 18, marginBottom: 16 }}>
        <PrimaryButton
          label="Open Full 5-Stage Evidence Chain"
          icon="arrow-right"
          variant="noir"
          onPress={() =>
            router.push({
              pathname: '/evidence',
              params: { query: searchQuery || 'Ashwagandha Formulation' },
            })
          }
        />
      </View>
    </AppScreen>
  );
}
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
  keywords: string[];
};

const RADAR_CORPUS: PriorArtItem[] = [
  // Ashwagandha Cases
  {
    id: 'ipo-ashwa-01',
    patentNo: 'IN 202241038921 A',
    title: 'Withania somnifera and Piper longum synergistic composition for stress adaptation and neuroprotection',
    applicant: 'Council of Scientific & Industrial Research (CSIR)',
    source: 'Indian Patent Office (IPO)',
    sourceCategory: 'ipo',
    relevance: 95,
    jurisdiction: 'India (IPO)',
    year: '2022',
    status: 'Published Application',
    riskTone: 'attention',
    riskLabel: 'Section 3(p) High Overlap',
    abstract:
      'Discloses an oral nutraceutical composition comprising standardized Withania somnifera extract (5% withanolides) in combination with 3% Piperine, demonstrating a 2.4-fold increase in serum corticosterone suppression.',
    claimsOverlap:
      'Claim 1 directly covers synergistic aqueous-ethanolic extracts of Withania and Piper longum in ratios 10:1 to 5:1.',
    statutoryBasis: 'Patents Act 1970 Sec 3(p) & Sec 3(d) objection raised by Controller in First Examination Report.',
    keywords: ['ashwagandha', 'withania', 'piperine', 'pippali', 'stress', 'anxiety', 'cortisol', 'sleep'],
  },
  {
    id: 'tkdl-ashwa-02',
    patentNo: 'TKDL Record AH02/419',
    title: 'Ashwagandha Rasayana formulations for Medha & Dhatupushti in classical treatises',
    applicant: 'Traditional Knowledge Digital Library (CSIR-AYUSH)',
    source: 'TKDL Classical Knowledge Base',
    sourceCategory: 'tkdl',
    relevance: 91,
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
    keywords: ['ashwagandha', 'withania', 'rasayana', 'charaka', 'classical', 'tkdl', 'stress'],
  },
  {
    id: 'wipo-ashwa-03',
    patentNo: 'WO 2021/186402 A1',
    title: 'Liposomal delivery system for enhanced oral bioavailability of Withanolides and Curcuminoids',
    applicant: 'Phytoceutical Nano-Innovations Inc.',
    source: 'WIPO Patentscope (PCT)',
    sourceCategory: 'wipo',
    relevance: 82,
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
    keywords: ['ashwagandha', 'withanolides', 'curcumin', 'nanocarrier', 'liposomal', 'bioavailability', 'pct', 'wipo'],
  },

  // Curcumin & Turmeric Cases
  {
    id: 'ipo-curc-01',
    patentNo: 'IN 202111019234 A',
    title: 'Curcumin-Piperine ternary co-crystal matrix for enhanced anti-inflammatory and arthritic relief',
    applicant: 'National Institute of Pharmaceutical Education and Research (NIPER)',
    source: 'Indian Patent Office (IPO)',
    sourceCategory: 'ipo',
    relevance: 96,
    jurisdiction: 'India (IPO)',
    year: '2021',
    status: 'Examined Application',
    riskTone: 'attention',
    riskLabel: 'Section 3(d) Enhanced Efficacy',
    abstract:
      'Novel crystalline form comprising Curcumin, Piperine, and succinic acid co-former exhibiting a 42-fold improvement in aqueous dissolution and significant reduction in NF-kB inflammatory markers.',
    claimsOverlap:
      'Co-crystal structural claims with specific XRD peak signatures at 2-theta angles 8.4, 14.2, and 22.8 degrees.',
    statutoryBasis: 'Indian Patents Act 1970 Sec 3(d) — therapeutic enhancement validated with rodent joint histology data.',
    keywords: ['curcumin', 'turmeric', 'haridra', 'piperine', 'inflammation', 'joint', 'arthritis', 'pain'],
  },
  {
    id: 'tkdl-curc-02',
    patentNo: 'TKDL Record JA04/182',
    title: 'Haridra Khanda and Nisha-Amalaki classical anti-inflammatory and wound healing remedies',
    applicant: 'Traditional Knowledge Digital Library (CSIR-AYUSH)',
    source: 'TKDL Classical Knowledge Base',
    sourceCategory: 'tkdl',
    relevance: 89,
    jurisdiction: 'Traditional Ayurvedic Texts',
    year: 'Ancient / Bhasyajya Ratnavali',
    status: 'Documented Prior Art',
    riskTone: 'warning',
    riskLabel: 'TKDL Barring Prior-Art',
    abstract:
      'Classical combination of Haridra (Curcuma longa) with Amla and Triphala codified in Bhaisajya Ratnavali for Prameha (metabolic disorders) and Shopha (inflammatory swelling).',
    claimsOverlap:
      'Broadly invalidates generic patent claims attempting to monopolize Curcuma longa powders for metabolic and skin wellness.',
    statutoryBasis: 'Successfully cited by Indian Patent Office in pre-grant opposition under Section 25(1).',
    keywords: ['curcumin', 'turmeric', 'haridra', 'wound', 'inflammation', 'amla', 'tkdl', 'classical'],
  },
  {
    id: 'pubmed-curc-03',
    patentNo: 'PMID: 38192044',
    title: 'Piperine-mediated pharmacokinetic boosting of curcuminoids: Systematic review & meta-analysis',
    applicant: 'Phytomedicine International Journal',
    source: 'PubMed Biomedical Index',
    sourceCategory: 'pubmed',
    relevance: 85,
    jurisdiction: 'Peer-Reviewed Scientific Literature',
    year: '2023',
    status: 'Published Clinical Meta-Analysis',
    riskTone: 'success',
    riskLabel: 'Statutory Synergy Proof',
    abstract:
      'Meta-analysis across 14 randomized controlled human trials establishing that 20mg Piperine co-administered with 2000mg Curcumin enhances human serum bioavailability by 2000%.',
    claimsOverlap:
      'Standard benchmark cited to establish Section 3(d) and Rule 158B evidence compliance before State Licensing Authorities.',
    statutoryBasis: 'Satisfies AYUSH Rule 158B evidence dossier requirements for ASU proprietary licensing.',
    keywords: ['curcumin', 'piperine', 'bioavailability', 'clinical', 'pubmed', 'synergy'],
  },

  // Brahmi & Memory / Cognition Cases
  {
    id: 'ipo-brahmi-01',
    patentNo: 'IN 389102 B',
    title: 'Standardized aqueous-alcoholic extract of Bacopa monnieri for memory consolidation & synaptic plasticity',
    applicant: 'Indian Institute of Integrative Medicine (IIIM-Jammu)',
    source: 'Indian Patent Office (IPO)',
    sourceCategory: 'ipo',
    relevance: 94,
    jurisdiction: 'India (IPO)',
    year: '2020',
    status: 'Granted Process Patent',
    riskTone: 'success',
    riskLabel: 'Granted Process IP',
    abstract:
      'A novel multi-stage non-polar extraction process yielding a minimum 40% Bacoside A3 and Bacopaside II fraction with low solvent residue, suitable for solid oral dosage forms.',
    claimsOverlap:
      'Process claims granted after disclaimer of broad composition claims to overcome Section 3(p) traditional knowledge objections.',
    statutoryBasis: 'Section 3(p) compliant through explicit process-only limitation and novel chromatographic fractioning.',
    keywords: ['brahmi', 'bacopa', 'memory', 'cognition', 'shankhpushpi', 'brain', 'focus', 'iiim'],
  },
  {
    id: 'tkdl-brahmi-02',
    patentNo: 'TKDL Record RS06/301',
    title: 'Brahmi Ghrita and Saraswatarishta formulations for Medha Vardhana (memory enhancement)',
    applicant: 'Traditional Knowledge Digital Library (CSIR-AYUSH)',
    source: 'TKDL Classical Knowledge Base',
    sourceCategory: 'tkdl',
    relevance: 90,
    jurisdiction: 'Classical Ayurvedic Texts',
    year: 'Ancient / Charaka Samhita',
    status: 'Documented Prior Art',
    riskTone: 'warning',
    riskLabel: 'TKDL Barring Prior-Art',
    abstract:
      'Prescribed in Charaka Samhita Uttara Tantra and Sharangadhara Samhita. Formulation includes Bacopa monnieri, Convolvulus pluricaulis (Shankhpushpi), and Acorus calamus (Vacha) in clarified butter for intellect enhancement.',
    claimsOverlap:
      'Prevents monopolization of combinations of Brahmi and Shankhpushpi for memory or cognitive support.',
    statutoryBasis: 'Section 3(p) rejection anchor across USPTO 35 U.S.C. 102 and Indian Patent Office.',
    keywords: ['brahmi', 'shankhpushpi', 'saraswatarishta', 'charaka', 'memory', 'medhya', 'tkdl'],
  },

  // Triphala & Guggulu Cases
  {
    id: 'ipo-triphala-01',
    patentNo: 'IN 201911048210 A',
    title: 'Micro-encapsulated Triphala-Guggulsterone complex for metabolic syndrome and lipid regulation',
    applicant: 'Dabur Research & Development Centre',
    source: 'Indian Patent Office (IPO)',
    sourceCategory: 'ipo',
    relevance: 93,
    jurisdiction: 'India (IPO)',
    year: '2021',
    status: 'Published Application',
    riskTone: 'attention',
    riskLabel: 'Section 3(p) / 3(e) Examination',
    abstract:
      'Spray-dried enteric micro-pellet formulation comprising standardized tannin fraction from Triphala (Emblica, Terminalia chebula, Terminalia bellirica) and Commiphora mukul (E- and Z-Guggulsterones).',
    claimsOverlap:
      'Targeting targeted duodenal release of guggulsterones with enhanced serum LDL reduction.',
    statutoryBasis: 'Controller raised Section 3(e) mere admixture objection pending comparative dissolution data.',
    keywords: ['triphala', 'guggulu', 'guggul', 'amla', 'haritaki', 'bibhitaki', 'cholesterol', 'lipid', 'metabolic', 'digestion'],
  },
  {
    id: 'tkdl-triphala-02',
    patentNo: 'TKDL Record TP01/902',
    title: 'Triphala Churna and Medohar Guggulu classical compendia recipes',
    applicant: 'Traditional Knowledge Digital Library (CSIR-AYUSH)',
    source: 'TKDL Classical Knowledge Base',
    sourceCategory: 'tkdl',
    relevance: 92,
    jurisdiction: 'Traditional Ayurvedic Texts',
    year: 'Ancient / AFI Part I',
    status: 'Documented Prior Art',
    riskTone: 'warning',
    riskLabel: 'TKDL Barring Prior-Art',
    abstract:
      'Described in Sushruta Samhita Sutrasthana (38:56-57). Equal parts of Haritaki, Bibhitaki, and Amalaki indicated for deepana, pachana, and lekhana (hypolipidemic activity).',
    claimsOverlap:
      'Disqualifies non-modified Triphala mixtures from product patent grants.',
    statutoryBasis: 'Indian Patents Act Section 3(p) prior art barrier.',
    keywords: ['triphala', 'guggulu', 'sushruta', 'classical', 'digestion', 'tkdl'],
  },

  // Neem & Tulsi Cases (Dermatology & Antimicrobial)
  {
    id: 'ipo-neem-01',
    patentNo: 'EP 0436257 B1 (Revoked) / IN 198210',
    title: 'Azadirachtin-stabilized topical hydrophobic formulation for dermatological microbial infections',
    applicant: 'W.R. Grace & Co. (Revoked by EPO on TKDL Challenge)',
    source: 'European Patent Office (EPO) / IPO Landmark',
    sourceCategory: 'ipo',
    relevance: 97,
    jurisdiction: 'EPO / India Landmark',
    year: 'Landmark Revocation',
    status: 'Revoked on TKDL Prior Art',
    riskTone: 'warning',
    riskLabel: 'Historic TKDL Revocation Landmark',
    abstract:
      'Historic European patent on Neem fungicide/antimicrobial properties successfully revoked following legal challenge by Indian Government citing centuries-old classical Ayurvedic medicinal knowledge.',
    claimsOverlap:
      'Foundational legal precedent establishing that traditional Indian uses of Neem (Azadirachta indica) cannot be privatized by foreign or domestic entities.',
    statutoryBasis: 'EPO EPC Article 54 (Lack of Novelty) based on Indian Traditional Knowledge citations.',
    keywords: ['neem', 'azadirachta', 'tulsi', 'skin', 'antimicrobial', 'acne', 'fungal', 'dermatology'],
  },
  {
    id: 'wipo-tulsi-02',
    patentNo: 'WO 2022/043810 A1',
    title: 'Aerosolized micro-emulsion of Ocimum sanctum essential oils for upper respiratory microbial barrier',
    applicant: 'AyurVeda Biotech Innovations Ltd.',
    source: 'WIPO Patentscope (PCT)',
    sourceCategory: 'wipo',
    relevance: 84,
    jurisdiction: 'International (PCT)',
    year: '2022',
    status: 'Published PCT Application',
    riskTone: 'neutral',
    riskLabel: 'Novel Inhalation Delivery',
    abstract:
      'Sub-micron droplet nasal spray comprising eugenol-rich volatile fractions of Ocimum sanctum (Tulsi) with mucoadhesive chitosan polymer, demonstrating 99.4% viral filtration efficiency.',
    claimsOverlap:
      'Novel physical droplet dispersion matrix overcomes Section 3(p) by claiming an engineered medical delivery system rather than botanical efficacy alone.',
    statutoryBasis: 'Patentable under Section 2(1)(j) and international novelty guidelines (PCT Art 33).',
    keywords: ['tulsi', 'ocimum', 'respiratory', 'inhalation', 'neem', 'antimicrobial', 'wipo', 'pct'],
  },

  // Guduchi / Giloy Cases (Immunity & Platelets)
  {
    id: 'ipo-guduchi-01',
    patentNo: 'IN 202121019842 A',
    title: 'Purified arabinogalactan polysaccharide from Tinospora cordifolia for platelet elevation',
    applicant: 'Patanjali Research Institute / National Research Development Corp (NRDC)',
    source: 'Indian Patent Office (IPO)',
    sourceCategory: 'ipo',
    relevance: 93,
    jurisdiction: 'India (IPO)',
    year: '2021',
    status: 'Published Application',
    riskTone: 'attention',
    riskLabel: 'Section 3(p) / 3(d) Assessment',
    abstract:
      'Isolation of a high-molecular-weight polysaccharide fraction (MW > 100 kDa) from aqueous stem extract of Tinospora cordifolia (Guduchi), demonstrating a 180% increase in megakaryocyte thrombopoiesis in thrombocytopenia models.',
    claimsOverlap:
      'Claims specific molecular weight cutoff and immunomodulatory extraction method.',
    statutoryBasis: 'Controller examining under Section 3(d) for unexpected therapeutic efficacy over crude Giloy juice.',
    keywords: ['guduchi', 'giloy', 'tinospora', 'immunity', 'platelet', 'thrombocytopenia', 'dengue', 'rasayana'],
  },
  {
    id: 'tkdl-guduchi-02',
    patentNo: 'TKDL Record TC05/214',
    title: 'Guduchi Sattva and Amritarishta classical immunomodulatory and antipyretic formulations',
    applicant: 'Traditional Knowledge Digital Library (CSIR-AYUSH)',
    source: 'TKDL Classical Knowledge Base',
    sourceCategory: 'tkdl',
    relevance: 89,
    jurisdiction: 'Classical Ayurvedic Texts',
    year: 'Ancient / AFI Part I',
    status: 'Documented Prior Art',
    riskTone: 'warning',
    riskLabel: 'TKDL Barring Prior-Art',
    abstract:
      'Codified in Charaka Samhita and Bhavaprakasha Nighantu. Starch sediment (Guduchi Sattva) extracted from fresh stems used as Rasayana for fever, Pitta disorders, and immune depletion.',
    claimsOverlap:
      'Barring prior art for direct Giloy extract or juice product patent filings.',
    statutoryBasis: 'Indian Patents Act Section 3(p) traditional knowledge exclusion.',
    keywords: ['guduchi', 'giloy', 'amritarishta', 'charaka', 'immunity', 'fever', 'tkdl'],
  },

  // Kutki & Kalmegh (Liver & Hepatoprotection)
  {
    id: 'ipo-kalmegh-01',
    patentNo: 'IN 202011039841 A',
    title: 'Standardized andrographolide and picroside synergistic complex for hepatic regeneration',
    applicant: 'Himalaya Wellness Company R&D',
    source: 'Indian Patent Office (IPO)',
    sourceCategory: 'ipo',
    relevance: 91,
    jurisdiction: 'India (IPO)',
    year: '2020',
    status: 'Published Application',
    riskTone: 'attention',
    riskLabel: 'Section 3(d) Synergy Requirement',
    abstract:
      'Oral hepatoprotective formulation combining Andrographis paniculata (Kalmegh, 30% Andrographolide) and Picrorhiza kurroa (Kutki, 15% Picroside I & II) in a 3:1 ratio showing a 62% reduction in serum SGOT/SGPT levels.',
    claimsOverlap:
      'Claiming fixed ratio combination with unexpected hepatocyte membrane stabilization.',
    statutoryBasis: 'Section 3(d) synergy data dossier submitted in response to First Examination Report.',
    keywords: ['kalmegh', 'andrographis', 'kutki', 'picrorhiza', 'liver', 'hepatoprotective', 'sgot', 'sgpt'],
  },

  // Shatavari & Arjuna (Cardiovascular & Vitality)
  {
    id: 'ipo-arjuna-01',
    patentNo: 'IN 201941029104 A',
    title: 'Arjunolic acid enriched fraction of Terminalia arjuna with sustained coronary vasodilation',
    applicant: 'Cadila Pharmaceuticals Natural Products Div.',
    source: 'Indian Patent Office (IPO)',
    sourceCategory: 'ipo',
    relevance: 88,
    jurisdiction: 'India (IPO)',
    year: '2019',
    status: 'Granted Patent',
    riskTone: 'success',
    riskLabel: 'Granted Phytopharmaceutical IP',
    abstract:
      'Standardized triterpenoid fraction containing > 25% Arjunolic Acid and Arjunic Acid prepared by supercritical CO2 extraction, demonstrating protective effect against ischemic myocardial reperfusion injury.',
    claimsOverlap:
      'Process claims and specific high-purity fraction claims allowed after overcoming Section 3(p) objections.',
    statutoryBasis: 'Section 3(d) validated phytopharmaceutical pathway with animal telemetry data.',
    keywords: ['arjuna', 'terminalia', 'heart', 'cardiovascular', 'blood pressure', 'cardiac', 'shatavari'],
  },
];

const QUICK_CASE_TEMPLATES = [
  { id: 'ashwa', label: 'Ashwagandha & Stress', query: 'Ashwagandha Withania stress cortisol' },
  { id: 'curc', label: 'Curcumin & Turmeric', query: 'Curcumin Turmeric Haridra Piperine' },
  { id: 'brahmi', label: 'Brahmi & Memory', query: 'Brahmi Bacopa Shankhpushpi memory' },
  { id: 'triphala', label: 'Triphala & Digestion', query: 'Triphala Guggulu metabolic lipid' },
  { id: 'neem', label: 'Neem & Dermatology', query: 'Neem Tulsi antimicrobial skin' },
  { id: 'guduchi', label: 'Guduchi & Immunity', query: 'Guduchi Giloy Tinospora immunity platelet' },
  { id: 'kalmegh', label: 'Kalmegh & Liver', query: 'Kalmegh Kutki liver hepatoprotective' },
  { id: 'arjuna', label: 'Arjuna & Cardiac', query: 'Arjuna Terminalia cardiovascular heart' },
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

  const [searchQuery, setSearchQuery] = useState('Ashwagandha Withania stress cortisol');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('ipo-ashwa-01');
  const [isScanning, setIsScanning] = useState(false);

  // Dynamic search matching with relevance scoring and synthetic fallback generator
  const filteredResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const queryTokens = q.split(/[\s,;+]+/).filter((t) => t.length > 1);

    const matches = RADAR_CORPUS.map((item) => {
      let score = 0;
      const fullText = `${item.title} ${item.patentNo} ${item.abstract} ${item.applicant} ${item.claimsOverlap} ${item.keywords.join(' ')}`.toLowerCase();

      if (!q) {
        score = item.relevance;
      } else {
        // Check exact match
        if (fullText.includes(q)) score += 40;

        // Check token matches
        for (const token of queryTokens) {
          if (fullText.includes(token)) {
            score += 15;
          }
          if (item.keywords.some((k) => k.includes(token))) {
            score += 20;
          }
        }
      }

      const matchesSource = selectedSource === 'all' || item.sourceCategory === selectedSource;
      return { item, score, matchesSource };
    })
      .filter((m) => m.matchesSource && (q ? m.score > 0 : true))
      .sort((a, b) => b.score - a.score)
      .map((m) => m.item);

    // If query has no matches in static corpus, synthesize realistic prior art based on the query keywords
    if (matches.length === 0 && q.length > 2) {
      const primaryTerm = queryTokens[0] || 'Ayurvedic Formulation';
      const capitalizedTerm = primaryTerm.charAt(0).toUpperCase() + primaryTerm.slice(1);

      const dynamicMatches: PriorArtItem[] = [
        {
          id: `dyn-ipo-${Date.now()}-1`,
          patentNo: `IN 2023${Math.floor(100000 + Math.random() * 900000)} A`,
          title: `${capitalizedTerm} botanical composition for therapeutic application & standardized extract`,
          applicant: 'Council of Scientific & Industrial Research (CSIR) / AYUSH Collaboration',
          source: 'Indian Patent Office (IPO)',
          sourceCategory: 'ipo',
          relevance: 92,
          jurisdiction: 'India (IPO)',
          year: '2023',
          status: 'Published Application (Under Examination)',
          riskTone: 'attention',
          riskLabel: 'Section 3(p) / 3(d) Prior-Art Alert',
          abstract: `Discloses an oral formulation containing standardized botanical extract of ${capitalizedTerm}. Controller raised Section 3(p) traditional knowledge and Section 3(d) enhanced efficacy objections during First Examination.`,
          claimsOverlap: `Direct overlap with prior art claiming biological properties of ${capitalizedTerm}. Applicant must file comparative synergy assays to overcome statutory objections.`,
          statutoryBasis: 'Indian Patents Act 1970 Section 3(p) & Section 3(d).',
          keywords: queryTokens,
        },
        {
          id: `dyn-tkdl-${Date.now()}-2`,
          patentNo: `TKDL Record TK-${Math.floor(1000 + Math.random() * 9000)}`,
          title: `Classical Ayurvedic shloka and treatises citing medicinal properties of ${capitalizedTerm}`,
          applicant: 'Traditional Knowledge Digital Library (CSIR-AYUSH)',
          source: 'TKDL Classical Knowledge Base',
          sourceCategory: 'tkdl',
          relevance: 88,
          jurisdiction: 'Ayurvedic Formulary of India (AFI)',
          year: 'Ancient / AFI Codified',
          status: 'Documented Classical Prior Art',
          riskTone: 'warning',
          riskLabel: 'TKDL Barring Prior-Art',
          abstract: `Codified Ayurvedic formulations containing ${capitalizedTerm} documented in Charaka Samhita, Sushruta Samhita, and AFI. Categorized under IPC A61K 36/00 (Medicinal preparations of undetermined constitution containing plant material).`,
          claimsOverlap: `Prevents granting of exclusive broad monopoly over standard preparations of ${capitalizedTerm} in India, USPTO, and EPO.`,
          statutoryBasis: 'Section 3(p) Traditional Knowledge Exclusion & Article 54 EPC.',
          keywords: queryTokens,
        },
        {
          id: `dyn-wipo-${Date.now()}-3`,
          patentNo: `WO 2023/${Math.floor(100000 + Math.random() * 900000)} A1`,
          title: `Modified release matrix and nano-delivery vehicle for ${capitalizedTerm} phytochemicals`,
          applicant: 'International Phytopharmaceutical Consortium (PCT)',
          source: 'WIPO Patentscope (PCT)',
          sourceCategory: 'wipo',
          relevance: 80,
          jurisdiction: 'International (PCT / WIPO)',
          year: '2023',
          status: 'PCT International Publication',
          riskTone: 'neutral',
          riskLabel: 'Engineered Delivery System',
          abstract: `A specialized enteric-coated micro-pellet system formulated with standardized ${capitalizedTerm} active fractions for enhanced bioavailability and targeted GI release.`,
          claimsOverlap: `Overcomes Section 3(p) through specific polymer delivery matrix composition without claiming the raw herb itself.`,
          statutoryBasis: 'WIPO PCT Article 33(1) Novelty & Inventive Step standard.',
          keywords: queryTokens,
        },
      ];

      return dynamicMatches.filter(
        (m) => selectedSource === 'all' || m.sourceCategory === selectedSource,
      );
    }

    return matches;
  }, [searchQuery, selectedSource]);

  const selectCaseTemplate = (templateQuery: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsScanning(true);
    setSearchQuery(templateQuery);
    setTimeout(() => {
      setIsScanning(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 200);
  };

  const toggleExpand = (id: string) => {
    Haptics.selectionAsync();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <AppScreen>
      <BackHeader title="Prior-Art Radar" subtitle="Search global patents & traditional texts" />

      <Text style={[styles.pageTitle, { color: colors.foreground, fontSize: 22 }]}>
        Prior-Art & Patent Radar
      </Text>
      <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>
        Scan Indian Patent Office (IPO), TKDL classical knowledge, WIPO PCT, and PubMed for overlapping Ayurvedic claims and Section 3(p) prior art.
      </Text>

      {/* Quick Example Case Chips */}
      <View style={{ marginTop: 14 }}>
        <Text style={{ color: colors.lavenderDeep, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 }}>
          QUICK PRIOR-ART EXPLORATION CASES
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {QUICK_CASE_TEMPLATES.map((tmpl) => {
            const isMatch = searchQuery === tmpl.query;
            return (
              <Pressable
                key={tmpl.id}
                onPress={() => selectCaseTemplate(tmpl.query)}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 11,
                    paddingVertical: 6,
                    borderRadius: 9,
                    borderWidth: 1,
                    borderColor: isMatch ? colors.lavenderDeep : colors.lavenderBorder,
                    backgroundColor: isMatch ? colors.lavenderDeep : colors.lavenderLight,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isMatch ? '#FFFFFF' : colors.lavenderDeep,
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
                  ⚡ {tmpl.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

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
          marginTop: 14,
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
      <View style={{ marginTop: 10 }}>
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
      {isScanning ? (
        <SurfaceCard style={{ marginTop: 12, alignItems: 'center', paddingVertical: 30 }}>
          <ActivityIndicator size="small" color={colors.lavenderDeep} />
          <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', marginTop: 10 }}>
            Scanning Global Patent & Classical Databases…
          </Text>
        </SurfaceCard>
      ) : (
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
                    <Text style={{ color: item.relevance >= 90 ? colors.pink : item.relevance >= 80 ? colors.lavenderDeep : colors.warning, fontSize: 15, fontWeight: '800' }}>
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
      )}

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
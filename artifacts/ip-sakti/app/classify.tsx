import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppScreen, BackHeader, PrimaryButton, SurfaceCard, styles } from '@/components/ip-sakti';
import { useColors } from '@/hooks/useColors';

const fields = ['Product / formulation name', 'Ingredients', 'Preparation method', 'Intended use', 'Claims', 'Target market'];
const categories = ['Classical medicine', 'Proprietary medicine', 'New / non-classical', 'Phytopharmaceutical', 'Ayurveda-Aahar', 'Cosmetic'];

export default function ClassifyScreen() {
  const colors = useColors();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [value, setValue] = useState('Ashwagandha Calm Formula');
  const [selected, setSelected] = useState('Proprietary medicine');
  return (
    <AppScreen>
      <BackHeader title="Classify your product" subtitle={`Step ${step + 1} of 3`} />
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 25 }}>
        {[0, 1, 2].map((item) => <View key={item} style={{ flex: 1, height: 5, borderRadius: 4, backgroundColor: item <= step ? colors.forest : colors.border }} />)}
      </View>
      {step < 2 ? (
        <>
          <Text style={[styles.pageTitle, { color: colors.foreground, fontSize: 23 }]}>{step === 0 ? 'Tell us about your product' : 'What is the intended pathway?'}</Text>
          <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>{step === 0 ? 'Only the essentials. You can refine this later.' : 'Choose the category that feels closest. IP SAKTI will assess the rest.'}</Text>
          {step === 0 ? (
            <View style={{ marginTop: 24, gap: 17 }}>
              {fields.slice(0, 3).map((field, index) => (
                <View key={field}>
                  <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700', marginBottom: 7 }}>{field}</Text>
                  <TextInput value={index === 0 ? value : ''} onChangeText={index === 0 ? setValue : undefined} placeholder={index === 1 ? 'e.g. Ashwagandha, Brahmi, Jatamansi' : 'Describe briefly'} placeholderTextColor={colors.inkSubtle} style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 13, minHeight: 48, paddingHorizontal: 13, color: colors.foreground, fontSize: 13 }} />
                </View>
              ))}
            </View>
          ) : (
            <View style={{ marginTop: 24, gap: 9 }}>
              {categories.map((category, index) => (
                <Pressable key={category} onPress={() => setSelected(category)} style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: selected === category ? colors.forest : colors.border, backgroundColor: selected === category ? colors.sageLight : colors.card }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: selected === category ? colors.forest : colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 11 }}>{selected === category ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.forest }} /> : null}</View>
                  <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '600' }}>{category}</Text>
                  {index === 1 ? <Text style={{ color: colors.forest, fontSize: 10, fontWeight: '700', marginLeft: 'auto' }}>LIKELY</Text> : null}
                </Pressable>
              ))}
            </View>
          )}
          <View style={{ marginTop: 26 }}><PrimaryButton label={step === 0 ? 'Continue' : 'Review classification'} onPress={() => setStep(step + 1)} /></View>
        </>
      ) : (
        <>
          <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: colors.sageLight, alignItems: 'center', justifyContent: 'center', marginBottom: 17 }}><Feather name="check" size={27} color={colors.forest} /></View>
          <Text style={[styles.pageTitle, { color: colors.foreground, fontSize: 23 }]}>Your probable category</Text>
          <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>Based on the information provided, IP SAKTI suggests:</Text>
          <SurfaceCard style={{ marginTop: 24, borderColor: colors.forest, borderWidth: 1.5 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '700' }}>Proprietary medicine</Text><Text style={{ color: colors.forest, fontSize: 11, fontWeight: '700' }}>HIGH CONFIDENCE</Text></View>
            <Text style={{ color: colors.inkSubtle, fontSize: 12, lineHeight: 18, marginTop: 10 }}>A formulation with a distinct composition or process that is not described in a classical Ayurvedic text.</Text>
          </SurfaceCard>
          <View style={{ marginTop: 18, gap: 8 }}>{['Ingredients and claims need a prior-art search', 'Regulatory evidence should be verified before filing'].map((item) => <View key={item} style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start' }}><Feather name="info" size={15} color={colors.warning} /><Text style={{ color: colors.inkSubtle, fontSize: 12, lineHeight: 18, flex: 1 }}>{item}</Text></View>)}</View>
          <View style={{ marginTop: 28 }}><PrimaryButton label="Continue to IP analysis" icon="arrow-right" onPress={() => router.replace('/passport')} /></View>
        </>
      )}
    </AppScreen>
  );
}
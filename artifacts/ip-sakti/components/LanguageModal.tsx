import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { LanguageCode, useLanguage } from '@/hooks/useLanguage';

export function LanguageModal() {
  const colors = useColors();
  const {
    language,
    setLanguage,
    availableLanguages,
    isLanguageModalOpen,
    closeLanguageModal,
  } = useLanguage();

  const handleSelect = (langCode: LanguageCode) => {
    Haptics.selectionAsync();
    setLanguage(langCode);
    closeLanguageModal();
  };

  return (
    <Modal
      visible={isLanguageModalOpen}
      transparent
      animationType="fade"
      onRequestClose={closeLanguageModal}
    >
      <Pressable style={styles.backdrop} onPress={closeLanguageModal}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              borderColor: colors.lavenderBorder,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: colors.lavenderLight },
                ]}
              >
                <Ionicons
                  name="language"
                  size={18}
                  color={colors.lavenderDeep}
                />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  Select Language (भाषा)
                </Text>
                <Text style={[styles.subtitle, { color: colors.inkSubtle }]}>
                  Ayurvedic legal intelligence in your preferred tongue
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                closeLanguageModal();
              }}
              style={[
                styles.closeButton,
                { backgroundColor: colors.surfaceMuted },
              ]}
            >
              <Feather name="x" size={16} color={colors.inkSubtle} />
            </Pressable>
          </View>

          {/* Language Options List */}
          <ScrollView
            style={{ maxHeight: 420 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ gap: 8, paddingVertical: 6 }}>
              {availableLanguages.map((item) => {
                const isSelected = language === item.code;
                return (
                  <Pressable
                    key={item.code}
                    onPress={() => handleSelect(item.code)}
                    style={({ pressed }) => [
                      styles.langCard,
                      {
                        backgroundColor: isSelected
                          ? colors.lavenderLight
                          : colors.surfaceMuted,
                        borderColor: isSelected
                          ? colors.lavenderDeep
                          : colors.border,
                        borderWidth: isSelected ? 1.5 : 1,
                        opacity: pressed ? 0.78 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.badgeBox,
                        {
                          backgroundColor: isSelected
                            ? colors.lavenderDeep
                            : colors.card,
                          borderColor: isSelected
                            ? colors.lavenderDeep
                            : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.lavenderDeep,
                          },
                        ]}
                      >
                        {item.badge}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'baseline',
                          gap: 7,
                        }}
                      >
                        <Text
                          style={[
                            styles.nativeName,
                            { color: colors.foreground },
                          ]}
                        >
                          {item.nativeName}
                        </Text>
                        <Text
                          style={[styles.englishName, { color: colors.inkSubtle }]}
                        >
                          ({item.name})
                        </Text>
                      </View>
                      <Text
                        style={[styles.regionText, { color: colors.inkSubtle }]}
                      >
                        {item.ayurvedicTradition} · {item.region}
                      </Text>
                    </View>

                    {isSelected ? (
                      <View
                        style={[
                          styles.checkCircle,
                          { backgroundColor: colors.lavenderDeep },
                        ]}
                      >
                        <Feather name="check" size={13} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.uncheckCircle,
                          { borderColor: colors.border },
                        ]}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 10.5,
    marginTop: 2,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 14,
  },
  badgeBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  nativeName: {
    fontSize: 14,
    fontWeight: '800',
  },
  englishName: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  regionText: {
    fontSize: 10,
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
});

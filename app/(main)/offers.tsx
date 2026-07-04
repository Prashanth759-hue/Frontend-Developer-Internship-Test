import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ImageBackground, Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Tag, Copy, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { MOCK_PROMOS } from '../../constants/mockData';
import HOME_BG from '../../assets/bg/homeBg';

export default function OffersScreen() {
  const { colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState('');

  const handleCopy = (id: string, code: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    Alert.alert('Code Copied!', `Promo code "${code}" copied. Apply it at checkout.`);
  };

  const handleApply = () => {
    const match = MOCK_PROMOS.find((p) => p.code === promoInput.trim().toUpperCase());
    if (match) {
      Alert.alert('🎉 Promo Applied!', `${match.title}\nDiscount: ${match.discount}`);
    } else {
      Alert.alert('Invalid Code', 'This promo code is not valid or has expired.');
    }
  };

  return (
    <ImageBackground
      source={HOME_BG}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        {/* Hero */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{t('offersTitle')}</Text>
              <Text style={styles.heroSubtitle}>{MOCK_PROMOS.length} offers available for you</Text>
            </View>
          </View>

          {/* Manual code entry */}
          <View style={styles.promoInputRow}>
            <Tag size={16} color={Colors.primary} />
            <TextInput
              style={[styles.promoInput, { color: colors.textPrimary }]}
              value={promoInput}
              onChangeText={(t) => setPromoInput(t.toUpperCase())}
              placeholder={t('enterPromoCode')}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              maxLength={12}
            />
            <TouchableOpacity
              style={[styles.applyBtn, !promoInput && styles.applyBtnDisabled]}
              onPress={handleApply}
              disabled={!promoInput}
            >
              <Text style={styles.applyBtnText}>{t('applyCode')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={MOCK_PROMOS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.promoCard, { borderLeftColor: item.color }]}>
              <View style={styles.promoTop}>
                <View style={[styles.discountBadge, { backgroundColor: item.color }]}>
                  <Text style={styles.discountText}>{item.discount}</Text>
                </View>
                <View style={styles.promoInfo}>
                  <Text style={[styles.promoTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.promoSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                </View>
              </View>

              <View style={styles.promoDivider} />

              <View style={styles.promoDetails}>
                <View style={styles.promoDetailRow}>
                  <Text style={styles.promoDetailLabel}>Valid till</Text>
                  <Text style={styles.promoDetailValue}>{item.validTill}</Text>
                </View>
                <View style={styles.promoDetailRow}>
                  <Text style={styles.promoDetailLabel}>Min order</Text>
                  <Text style={styles.promoDetailValue}>{item.minOrder}</Text>
                </View>
                <View style={styles.promoDetailRow}>
                  <Text style={styles.promoDetailLabel}>Applicable on</Text>
                  <Text style={styles.promoDetailValue}>{item.applicable}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => handleCopy(item.id, item.code)}
                activeOpacity={0.8}
              >
                <Text style={styles.codeText}>{item.code}</Text>
                {copiedId === item.id ? (
                  <Check size={16} color={Colors.primary} />
                ) : (
                  <Copy size={16} color={Colors.primary} />
                )}
                <Text style={styles.copyText}>
                  {copiedId === item.id ? t('done') : t('close')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  safe: { flex: 1, backgroundColor: 'transparent' },

  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: colors.surfaceElevated, marginBottom: 16, gap: 14,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },

  promoInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, borderRadius: 18, padding: 12,
    borderWidth: 1, borderColor: colors.iconBorder,
  },
  promoInput: { flex: 1, fontSize: 14, fontWeight: '600', letterSpacing: 1 },
  applyBtn: {
    backgroundColor: '#FF6B00', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 12,
  },
  applyBtnDisabled: { backgroundColor: colors.iconBorder },
  applyBtnText: { color: colors.surface, fontWeight: '700', fontSize: 13 },

  list: { paddingHorizontal: 16, paddingBottom: 32 },

  promoCard: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: colors.cardBorder, borderLeftWidth: 5,
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, elevation: 6, gap: 14,
  },
  promoTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  discountBadge: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
    minWidth: 70, alignItems: 'center',
  },
  discountText: { color: colors.surface, fontWeight: '800', fontSize: 15 },
  promoInfo: { flex: 1, gap: 4 },
  promoTitle: { fontSize: 16, fontWeight: '800' },
  promoSubtitle: { fontSize: 13, lineHeight: 18 },
  promoDivider: { height: 1, backgroundColor: colors.cardBorder },
  promoDetails: { gap: 6 },
  promoDetailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  promoDetailLabel: { fontSize: 12, color: colors.placeholder },
  promoDetailValue: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },

  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.iconBg, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center',
  },
  codeText: { fontSize: 15, fontWeight: '800', color: '#FF6B00', letterSpacing: 1.5, flex: 1 },
  copyText: { fontSize: 13, fontWeight: '700', color: '#FF6B00' },
})
;
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  User,
  Phone,
  Weight,
  MessageSquare,
  AlertCircle,
  Package,
  Check,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useBookingStore } from '../../store/bookingStore';
import { Button } from '../../components/common/Button';
import { useSenderReceiver } from '../../hooks/useSenderReceiver';
import {
  validateName,
  validateWeight,
} from '../../utils/validators';
import HOME_BG from '../../assets/bg/homeBg';

const GOODS_CATEGORIES = ['Electronics', 'Furniture', 'Machinery', 'Raw Material', 'Household', 'Other'];

export default function GoodsDetailsScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const { setGoodsDetails, tripMode } = useBookingStore();

  // Sender auto-filled from profile + Receiver with "Use my details" toggle
  const {
    senderName, senderPhone, senderNameError, senderPhoneError,
    receiverName, receiverPhone, receiverNameError, receiverPhoneError,
    sameAsSender, toggleSameAsSender,
    onSenderNameChange: handleSenderNameChange,
    onSenderPhoneChange: handleSenderPhoneChange,
    onReceiverNameChange: handleReceiverNameChange,
    onReceiverPhoneChange: handleReceiverPhoneChange,
    isSenderValid, isReceiverValid,
    validateSenderReceiver,
  } = useSenderReceiver();

  // Goods
  const [category, setCategory] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [weightError, setWeightError] = useState('');

  const [formError, setFormError] = useState('');

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleWeightChange = (text: string) => {
    setWeight(text.slice(0, 30));
    if (weightError) setWeightError('');
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const isValid =
    isSenderValid &&
    isReceiverValid &&
    category.trim().length > 0 &&
    validateWeight(weight).valid;

  const handleContinue = () => {
    let hasError = false;
    setFormError('');

    if (!validateSenderReceiver()) hasError = true;

    const wRes = validateWeight(weight);
    if (!wRes.valid) { setWeightError(wRes.error ?? 'Invalid weight'); hasError = true; }

    if (!category) {
      setCategoryError('Please select a goods category.');
      hasError = true;
    }

    if (hasError) return;

    setGoodsDetails({
      senderName,
      senderPhone,
      receiverName,
      receiverPhone,
      category,
      weight,
      description,
    });

    router.push('/(booking)/truck-vehicle');
  };

  return (
    <ImageBackground source={HOME_BG} style={styles.backgroundImage} resizeMode="cover">
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        {/* ── Hero Header ── */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Goods Details</Text>
              <Text style={styles.heroSubtitle}>
                {tripMode === 'inter_cities' ? 'Intercity · Sender, receiver & goods info' : 'Sender, receiver & goods info'}
              </Text>
            </View>
          </View>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipText}>🚚 Doorstep loading</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>📍 Live tracking</Text></View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* ── Sender Details ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>👤 SENDER DETAILS</Text>

            <View style={styles.logisticsRow}>
              <View style={styles.iconWrap}><User size={16} color={Colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }, senderNameError ? styles.inputError : null]}
                  value={senderName}
                  onChangeText={handleSenderNameChange}
                  placeholder="Sender's name"
                  placeholderTextColor={colors.placeholder}
                  maxLength={60}
                />
                {senderNameError ? <Text style={styles.errorText}>{senderNameError}</Text> : null}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.logisticsRow}>
              <View style={styles.iconWrap}><Phone size={16} color={Colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }, senderPhoneError ? styles.inputError : null]}
                  value={senderPhone}
                  onChangeText={handleSenderPhoneChange}
                  placeholder="Sender's phone number"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {senderPhoneError ? <Text style={styles.errorText}>{senderPhoneError}</Text> : null}
              </View>
            </View>
          </View>

          {/* ── Receiver Details ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📥 RECEIVER DETAILS</Text>

            <TouchableOpacity
              style={styles.sameAsSenderRow}
              onPress={toggleSameAsSender}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: sameAsSender }}
            >
              <View style={[styles.checkbox, sameAsSender && styles.checkboxActive]}>
                {sameAsSender ? <Check size={12} color="#fff" /> : null}
              </View>
              <Text style={styles.sameAsSenderText}>Use my details (same as sender)</Text>
            </TouchableOpacity>

            <View style={styles.logisticsRow}>
              <View style={styles.iconWrap}><User size={16} color={Colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[
                    styles.input,
                    { color: colors.textPrimary },
                    receiverNameError ? styles.inputError : null,
                    sameAsSender ? styles.inputDisabled : null,
                  ]}
                  value={receiverName}
                  onChangeText={handleReceiverNameChange}
                  placeholder="Receiver's name"
                  placeholderTextColor={colors.placeholder}
                  maxLength={60}
                  editable={!sameAsSender}
                />
                {receiverNameError ? <Text style={styles.errorText}>{receiverNameError}</Text> : null}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.logisticsRow}>
              <View style={styles.iconWrap}><Phone size={16} color={Colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[
                    styles.input,
                    { color: colors.textPrimary },
                    receiverPhoneError ? styles.inputError : null,
                    sameAsSender ? styles.inputDisabled : null,
                  ]}
                  value={receiverPhone}
                  onChangeText={handleReceiverPhoneChange}
                  placeholder="Receiver's phone number"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!sameAsSender}
                />
                {receiverPhoneError ? <Text style={styles.errorText}>{receiverPhoneError}</Text> : null}
              </View>
            </View>
          </View>

          {/* ── Goods Details ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📦 GOODS DETAILS</Text>

            <View style={styles.categoryGrid}>
              {GOODS_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                  onPress={() => { setCategory(cat); if (categoryError) setCategoryError(''); }}
                >
                  <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {categoryError ? <Text style={styles.errorText}>{categoryError}</Text> : null}

            <View style={styles.divider} />

            <View style={styles.logisticsRow}>
              <View style={styles.iconWrap}><Weight size={16} color={Colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }, weightError ? styles.inputError : null]}
                  value={weight}
                  onChangeText={handleWeightChange}
                  placeholder="Approx. weight (e.g. 500 kg)"
                  placeholderTextColor={colors.placeholder}
                  maxLength={30}
                />
                {weightError ? <Text style={styles.errorText}>{weightError}</Text> : null}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.logisticsRow}>
              <View style={styles.iconWrap}><MessageSquare size={16} color={Colors.primary} /></View>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, flex: 1 }]}
                value={description}
                onChangeText={(t) => setDescription(t.slice(0, 300))}
                placeholder="Describe your goods (optional)"
                placeholderTextColor={colors.placeholder}
                multiline
                maxLength={300}
              />
            </View>
          </View>

          <View style={styles.infoBanner}>
            <Text style={styles.infoEmoji}>🚚</Text>
            <Text style={styles.infoText}>
              Our driver will arrive with the selected truck for doorstep loading & delivery
            </Text>
          </View>

          {formError ? (
            <View style={styles.formErrorBanner}>
              <AlertCircle size={15} color={Colors.danger} />
              <Text style={styles.formErrorText}>{formError}</Text>
            </View>
          ) : null}

          <Button
            label="Continue · Select Vehicle"
            onPress={handleContinue}
            style={{ ...styles.continueBtn, ...(!isValid ? styles.continueBtnDisabled : {}) }}
            textStyle={!isValid ? styles.continueBtnTextDisabled : undefined}
          />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },

  heroHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.iconBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },

  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, paddingTop: 4 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#FF6B00',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    gap: 8,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.placeholder,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginLeft: 34 },

  logisticsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.iconBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  input: {
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 4,
    minHeight: 44,
  },
  inputError: {
    borderBottomWidth: 1,
    borderBottomColor: '#EF4444',
  },
  errorText: { fontSize: 12, color: Colors.danger, marginTop: 2, marginLeft: 4 },

  sameAsSenderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 8 },
  checkbox: {
    width: 18, height: 18, borderRadius: 5,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sameAsSenderText: { fontSize: 12.5, fontWeight: '600', color: colors.textSecondary },
  inputDisabled: { opacity: 0.55 },

  categoryGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: { backgroundColor: colors.iconBg, borderColor: Colors.primary },
  categoryChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  categoryChipTextActive: { color: Colors.primary },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 20,
    backgroundColor: colors.iconBg,
    borderWidth: 1,
    borderColor: colors.iconBorder,
  },
  infoEmoji: { fontSize: 16 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 19, color: '#F59E0B' },

  formErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  formErrorText: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.danger },

  continueBtn: { width: '100%' },
  continueBtnDisabled: { backgroundColor: colors.border, opacity: 0.8 },
  continueBtnTextDisabled: { color: colors.placeholder },
});
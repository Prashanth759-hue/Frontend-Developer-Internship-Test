import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, User, Phone, Package, AlertCircle, Check } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/common/Button';
import { useBookingStore } from '../../store/bookingStore';
import { useSenderReceiver } from '../../hooks/useSenderReceiver';
import HOME_BG from '../../assets/bg/homeBg';

// ── Goods catalogue ──────────────────────────────────────────────────────────
const GOODS_CATEGORIES = [
  { id: 'documents',   emoji: '📄', label: 'Documents' },
  { id: 'clothes',     emoji: '👕', label: 'Clothes' },
  { id: 'electronics', emoji: '📱', label: 'Electronics' },
  { id: 'food',        emoji: '🍱', label: 'Food / Grocery' },
  { id: 'medicine',    emoji: '💊', label: 'Medicine' },
  { id: 'fragile',     emoji: '🪴', label: 'Fragile Items' },
  { id: 'boxes',       emoji: '📦', label: 'Boxes' },
  { id: 'furniture',   emoji: '🪑', label: 'Furniture' },
  { id: 'other',       emoji: '🛍️', label: 'Other' },
];

const WEIGHT_RANGES = [
  { id: 'under_5',  label: 'Under 5 kg',   hint: 'small parcels, letters' },
  { id: '5_to_15',  label: '5 – 15 kg',    hint: 'medium boxes' },
  { id: '15_to_50', label: '15 – 50 kg',   hint: 'large boxes, appliances' },
  { id: '50_plus',  label: '50+ kg',        hint: 'heavy / bulk goods' },
];

const QTY_OPTIONS = [
  { id: '1_3',    label: '1 – 3 items' },
  { id: '4_10',   label: '4 – 10 items' },
  { id: '11_plus', label: '11+ items' },
];

export default function ParcelDetailsScreen() {
  const { colors, isDark } = useTheme();
  const s = makeStyles(colors);
  const { setGoodsDetails } = useBookingStore();

  // Sender auto-filled from profile + Receiver with "Use my details" toggle
  const {
    senderName, senderPhone,
    senderNameError: senderNameErr, senderPhoneError: senderPhoneErr,
    receiverName, receiverPhone,
    receiverNameError: receiverNameErr, receiverPhoneError: receiverPhoneErr,
    sameAsSender, toggleSameAsSender,
    onSenderNameChange: onSenderName,
    onSenderPhoneChange: onSenderPhone,
    onReceiverNameChange: onReceiverName,
    onReceiverPhoneChange: onReceiverPhone,
    isSenderValid, isReceiverValid,
    validateSenderReceiver,
  } = useSenderReceiver();

  // Goods
  const [goodsCat,     setGoodsCat]     = useState('');
  const [weightRange,  setWeightRange]  = useState('');
  const [qty,          setQty]          = useState('');
  const [description,  setDescription]  = useState('');
  const [goodsCatErr,  setGoodsCatErr]  = useState('');
  const [weightErr,    setWeightErr]    = useState('');
  const [formError,    setFormError]    = useState('');

  // ── Validation ─────────────────────────────────────────────────────────────
  const handleContinue = () => {
    let err = false;
    setFormError('');
    if (!validateSenderReceiver()) err = true;
    if (!goodsCat)   { setGoodsCatErr('Please select what you are sending.'); err = true; }
    if (!weightRange){ setWeightErr('Please select an estimated weight.'); err = true; }
    if (err) { setFormError('Please fill all required fields.'); return; }

    setGoodsDetails({
      senderName, senderPhone,
      receiverName, receiverPhone,
      category: goodsCat,
      weight: weightRange,
      qty: qty || '1_3',
      description,
    });
    router.push('/(booking)/parcel-vehicle');
  };

  const canContinue =
    isSenderValid && isReceiverValid &&
    !!goodsCat && !!weightRange;

  return (
    <ImageBackground source={HOME_BG} style={s.bg} resizeMode="cover">
      <SafeAreaView style={[s.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        <View style={s.hero}>
          <View style={s.heroRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.heroTitle}>Parcel Details</Text>
              <Text style={s.heroSub}>Sender, receiver & what you're sending</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── Sender ── */}
          <View style={s.card}>
            <Text style={s.cardLabel}>📤 SENDER DETAILS</Text>

            <View style={s.inputRow}>
              <View style={s.iconWrap}><User size={16} color={Colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[s.input, { color: colors.textPrimary }, senderNameErr ? s.inputErr : null]}
                  value={senderName} onChangeText={onSenderName}
                  placeholder="Sender's name" placeholderTextColor={colors.placeholder} maxLength={60}
                />
                {!!senderNameErr && <Text style={s.errText}>{senderNameErr}</Text>}
              </View>
            </View>
            <View style={s.divider} />
            <View style={s.inputRow}>
              <View style={s.iconWrap}><Phone size={16} color={Colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[s.input, { color: colors.textPrimary }, senderPhoneErr ? s.inputErr : null]}
                  value={senderPhone} onChangeText={onSenderPhone}
                  placeholder="Sender's phone" placeholderTextColor={colors.placeholder}
                  keyboardType="phone-pad" maxLength={10}
                />
                {!!senderPhoneErr && <Text style={s.errText}>{senderPhoneErr}</Text>}
              </View>
            </View>
          </View>

          {/* ── Receiver ── */}
          <View style={s.card}>
            <Text style={s.cardLabel}>👤 RECEIVER DETAILS</Text>

            <TouchableOpacity
              style={s.sameAsSenderRow}
              onPress={toggleSameAsSender}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: sameAsSender }}
            >
              <View style={[s.checkbox, sameAsSender && s.checkboxActive]}>
                {sameAsSender ? <Check size={12} color="#fff" /> : null}
              </View>
              <Text style={s.sameAsSenderText}>Use my details (same as sender)</Text>
            </TouchableOpacity>

            <View style={s.inputRow}>
              <View style={s.iconWrap}><User size={16} color={Colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[s.input, { color: colors.textPrimary }, receiverNameErr ? s.inputErr : null, sameAsSender ? s.inputDisabled : null]}
                  value={receiverName} onChangeText={onReceiverName}
                  placeholder="Receiver's name" placeholderTextColor={colors.placeholder} maxLength={60}
                  editable={!sameAsSender}
                />
                {!!receiverNameErr && <Text style={s.errText}>{receiverNameErr}</Text>}
              </View>
            </View>
            <View style={s.divider} />
            <View style={s.inputRow}>
              <View style={s.iconWrap}><Phone size={16} color={Colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[s.input, { color: colors.textPrimary }, receiverPhoneErr ? s.inputErr : null, sameAsSender ? s.inputDisabled : null]}
                  value={receiverPhone} onChangeText={onReceiverPhone}
                  placeholder="Receiver's phone" placeholderTextColor={colors.placeholder}
                  keyboardType="phone-pad" maxLength={10}
                  editable={!sameAsSender}
                />
                {!!receiverPhoneErr && <Text style={s.errText}>{receiverPhoneErr}</Text>}
              </View>
            </View>
          </View>

          {/* ── Goods category ── */}
          <View style={s.card}>
            <Text style={s.cardLabel}>📦 WHAT ARE YOU SENDING?</Text>
            <View style={s.chipGrid}>
              {GOODS_CATEGORIES.map((g) => {
                const active = goodsCat === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    style={[s.goodsChip, active && s.goodsChipActive]}
                    onPress={() => { setGoodsCat(g.id); setGoodsCatErr(''); }}
                    activeOpacity={0.8}
                  >
                    <Text style={s.goodsEmoji}>{g.emoji}</Text>
                    <Text style={[s.goodsLabel, { color: active ? Colors.primary : colors.textPrimary }]}>
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {!!goodsCatErr && <Text style={s.errText}>{goodsCatErr}</Text>}
          </View>

          {/* ── Weight range ── */}
          <View style={s.card}>
            <Text style={s.cardLabel}>⚖️ ESTIMATED WEIGHT</Text>
            <View style={s.weightGrid}>
              {WEIGHT_RANGES.map((w) => {
                const active = weightRange === w.id;
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={[s.weightChip, active && s.weightChipActive]}
                    onPress={() => { setWeightRange(w.id); setWeightErr(''); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.weightLabel, active && s.weightLabelActive]}>{w.label}</Text>
                    <Text style={[s.weightHint, active && s.weightHintActive]}>{w.hint}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {!!weightErr && <Text style={s.errText}>{weightErr}</Text>}
          </View>

          {/* ── Qty (optional) ── */}
          <View style={s.card}>
            <Text style={s.cardLabel}>🔢 NUMBER OF ITEMS / BOXES  <Text style={s.optLabel}>(optional)</Text></Text>
            <View style={s.qtyRow}>
              {QTY_OPTIONS.map((q) => {
                const active = qty === q.id;
                return (
                  <TouchableOpacity
                    key={q.id}
                    style={[s.qtyChip, active && s.qtyChipActive]}
                    onPress={() => setQty(active ? '' : q.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.qtyLabel, active && s.qtyLabelActive]}>{q.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Description ── */}
          <View style={s.card}>
            <Text style={s.cardLabel}>📝 DESCRIPTION <Text style={s.optLabel}>(optional)</Text></Text>
            <View style={s.inputRow}>
              <View style={s.iconWrap}><Package size={16} color={Colors.primary} /></View>
              <TextInput
                style={[s.input, { color: colors.textPrimary, flex: 1 }]}
                value={description} onChangeText={(t) => setDescription(t.slice(0, 300))}
                placeholder="Describe the parcel (optional)"
                placeholderTextColor={colors.placeholder}
                multiline maxLength={300}
              />
            </View>
          </View>

          {!!formError && (
            <View style={s.formErrBanner}>
              <AlertCircle size={15} color={Colors.danger} />
              <Text style={s.formErrText}>{formError}</Text>
            </View>
          )}

          <View style={s.infoBanner}>
            <Text style={s.infoText}>
              ℹ️  Vehicle options on the next screen will be tailored to your goods weight and type.
            </Text>
          </View>

          <Button
            label="Continue · Choose Vehicle"
            onPress={handleContinue}
            style={{ width: '100%', ...(!canContinue ? s.btnDisabled : {}) }}
            textStyle={!canContinue ? s.btnDisabledText : undefined}
          />
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  hero: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 22,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    backgroundColor: colors.surfaceElevated, marginBottom: 16,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSub: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  content: { paddingHorizontal: 16, paddingBottom: 16, gap: 14, paddingTop: 4 },
  card: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, elevation: 6, gap: 10,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: colors.placeholder, letterSpacing: 1.2 },
  optLabel: { fontSize: 9, fontWeight: '500', color: colors.placeholder, letterSpacing: 0 },
  divider: { height: 1, backgroundColor: colors.cardBorder },
  inputRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  iconWrap: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.iconBg,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  input: { fontSize: 15, paddingVertical: 10, paddingHorizontal: 4, minHeight: 44 },
  inputErr: { borderBottomWidth: 1, borderBottomColor: '#EF4444' },
  errText: { fontSize: 12, color: Colors.danger, marginTop: 2, marginLeft: 4 },

  sameAsSenderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 18, height: 18, borderRadius: 5,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sameAsSenderText: { fontSize: 12.5, fontWeight: '600', color: colors.textSecondary },
  inputDisabled: { opacity: 0.55 },

  // goods chips grid
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goodsChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20,
    backgroundColor: colors.inputBackground, borderWidth: 1.5, borderColor: colors.cardBorder,
  },
  goodsChipActive: { borderColor: Colors.primary, backgroundColor: colors.iconBg },
  goodsEmoji: { fontSize: 15 },
  goodsLabel: { fontSize: 13, fontWeight: '600' },

  // weight chips
  weightGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  weightChip: {
    flex: 1, minWidth: '45%', paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 16, backgroundColor: colors.inputBackground,
    borderWidth: 1.5, borderColor: colors.cardBorder, gap: 2,
  },
  weightChipActive: { borderColor: Colors.primary, backgroundColor: colors.iconBg },
  weightLabel: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  weightLabelActive: { color: Colors.primary },
  weightHint: { fontSize: 10, color: colors.textSecondary },
  weightHintActive: { color: Colors.primary, opacity: 0.7 },

  // qty chips
  qtyRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  qtyChip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    backgroundColor: colors.inputBackground, borderWidth: 1.5, borderColor: colors.cardBorder,
  },
  qtyChipActive: { borderColor: Colors.primary, backgroundColor: colors.iconBg },
  qtyLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  qtyLabelActive: { color: Colors.primary },

  formErrBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderRadius: 12, borderLeftWidth: 3,
    borderLeftColor: Colors.danger, paddingHorizontal: 12, paddingVertical: 10,
  },
  formErrText: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.danger },
  infoBanner: {
    padding: 14, borderRadius: 18, backgroundColor: colors.iconBg,
    borderWidth: 1, borderColor: colors.iconBorder,
  },
  infoText: { fontSize: 12, lineHeight: 18, color: '#F59E0B' },
  btnDisabled: { backgroundColor: colors.border, opacity: 0.8 },
  btnDisabledText: { color: colors.placeholder },
});
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  X,
  CreditCard,
  Smartphone,
  Wallet,
  Star,
  Shield,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/common/Button';
import {
  validateUpiId,
  validateCardNumber,
  validateCardName,
  validateCardExpiry,
} from '../../utils/validators';

type MethodType = 'upi' | 'card' | 'wallet';

interface PaymentMethod {
  id: string;
  type: MethodType;
  label: string;
  detail: string;
  isDefault: boolean;
}

const INITIAL_METHODS: PaymentMethod[] = [
  { id: 'pm-1', type: 'wallet', label: 'Vahan Pay', detail: '₹0 balance', isDefault: true },
  { id: 'pm-2', type: 'upi', label: 'Google Pay', detail: 'user@okicici', isDefault: false },
];

const UPI_APPS = [
  { id: 'gpay', label: 'Google Pay', emoji: '🟢' },
  { id: 'phonepe', label: 'PhonePe', emoji: '🟣' },
  { id: 'paytm', label: 'Paytm', emoji: '🔵' },
  { id: 'bhim', label: 'BHIM UPI', emoji: '🇮🇳' },
  { id: 'other', label: 'Other UPI', emoji: '📲' },
];

function MethodIcon({ type, size = 20 }: { type: MethodType; size?: number }) {
  if (type === 'upi') return <Smartphone size={size} color={Colors.primary} />;
  if (type === 'card') return <CreditCard size={size} color={Colors.primary} />;
  return <Wallet size={size} color={Colors.primary} />;
}

type AddStep = 'choose_type' | 'upi_details' | 'card_details';

export default function PaymentMethodsScreen() {
  const { colors } = useTheme();

  const [methods, setMethods] = useState<PaymentMethod[]>(INITIAL_METHODS);
  const [showModal, setShowModal] = useState(false);
  const [addStep, setAddStep] = useState<AddStep>('choose_type');

  // UPI form
  const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [upiIdError, setUpiIdError] = useState('');

  // Card form
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardNumberError, setCardNumberError] = useState('');
  const [cardNameError, setCardNameError] = useState('');
  const [cardExpiryError, setCardExpiryError] = useState('');

  const openAdd = () => {
    setAddStep('choose_type');
    setSelectedUpiApp(null);
    setUpiId(''); setUpiIdError('');
    setCardNumber(''); setCardName(''); setCardExpiry('');
    setCardNumberError(''); setCardNameError(''); setCardExpiryError('');
    setShowModal(true);
  };

  const setDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  const handleDelete = (id: string, label: string) => {
    const method = methods.find((m) => m.id === id);
    if (method?.isDefault) {
      Alert.alert('Cannot Remove', 'Set another payment method as default before removing this one.');
      return;
    }
    Alert.alert('Remove Payment Method', `Remove "${label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setMethods((prev) => prev.filter((m) => m.id !== id)),
      },
    ]);
  };

  const handleAddUpi = () => {
    const res = validateUpiId(upiId);
    if (!res.valid) { setUpiIdError(res.error ?? 'Invalid UPI ID'); return; }
    const app = UPI_APPS.find((a) => a.id === selectedUpiApp);
    const newMethod: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type: 'upi',
      label: app?.label ?? 'UPI',
      detail: upiId.trim(),
      isDefault: false,
    };
    setMethods((prev) => [...prev, newMethod]);
    setShowModal(false);
  };

  const handleAddCard = () => {
    let hasError = false;
    const numRes = validateCardNumber(cardNumber);
    if (!numRes.valid) { setCardNumberError(numRes.error ?? 'Invalid card number'); hasError = true; }
    const nameRes = validateCardName(cardName);
    if (!nameRes.valid) { setCardNameError(nameRes.error ?? 'Invalid name'); hasError = true; }
    const expRes = validateCardExpiry(cardExpiry);
    if (!expRes.valid) { setCardExpiryError(expRes.error ?? 'Invalid expiry'); hasError = true; }
    if (hasError) return;

    const digits = cardNumber.replace(/\s/g, '');
    const masked = `•••• •••• •••• ${digits.slice(-4)}`;
    const newMethod: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type: 'card',
      label: cardName.trim(),
      detail: masked,
      isDefault: false,
    };
    setMethods((prev) => [...prev, newMethod]);
    setShowModal(false);
  };

  const formatCardNumber = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const canAddUpi = validateUpiId(upiId).valid;
  const canAddCard =
    validateCardNumber(cardNumber).valid &&
    validateCardName(cardName).valid &&
    validateCardExpiry(cardExpiry).valid;

  return (
    <ImageBackground
      source={require('../../assets/images/home-bg.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {/* Hero Header */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Payment Methods</Text>
              <Text style={styles.heroSubtitle}>Manage how you pay for rides</Text>
            </View>
            <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
              <Plus size={18} color="#FF6B00" />
            </TouchableOpacity>
          </View>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipText}>🔒 Secure payments</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>⚡ Instant pay</Text></View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Vahan Pay wallet highlight */}
          <View style={styles.walletBanner}>
            <View style={styles.walletLeft}>
              <Wallet size={28} color="#FF6B00" />
              <View>
                <Text style={styles.walletTitle}>Vahan Pay</Text>
                <Text style={styles.walletBalance}>₹0 balance</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.topUpBtn} onPress={() => router.push('/(main)/wallet')}>
              <Plus size={14} color="#FF6B00" />
              <Text style={styles.topUpText}>Top Up</Text>
            </TouchableOpacity>
          </View>

          {/* Methods list */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SAVED METHODS</Text>

          {methods.map((method) => (
            <View key={method.id} style={[styles.methodCard, method.isDefault && styles.methodCardDefault]}>
              <View style={styles.methodIconWrap}>
                <MethodIcon type={method.type} size={20} />
              </View>

              <View style={styles.methodInfo}>
                <View style={styles.methodTitleRow}>
                  <Text style={[styles.methodLabel, { color: colors.textPrimary }]}>
                    {method.label}
                  </Text>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Star size={9} color="#FF6B00" fill="#FF6B00" />
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.methodDetail, { color: colors.textSecondary }]}>
                  {method.detail}
                </Text>
              </View>

              <View style={styles.methodActions}>
                {!method.isDefault && (
                  <TouchableOpacity
                    onPress={() => setDefault(method.id)}
                    style={styles.setDefaultBtn}
                    accessibilityLabel={`Set ${method.label} as default`}
                  >
                    <Text style={styles.setDefaultText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                {method.type !== 'wallet' && (
                  <TouchableOpacity
                    onPress={() => handleDelete(method.id, method.label)}
                    style={styles.deleteBtn}
                    accessibilityLabel={`Remove ${method.label}`}
                  >
                    <Trash2 size={15} color={Colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {/* Add more */}
          <TouchableOpacity style={styles.addMoreBtn} onPress={openAdd}>
            <View style={styles.addMoreIcon}>
              <Plus size={16} color={Colors.primary} />
            </View>
            <Text style={styles.addMoreText}>Add Payment Method</Text>
          </TouchableOpacity>

          {/* Security note */}
          <View style={styles.secureCard}>
            <Shield size={16} color="#16A34A" />
            <Text style={styles.secureText}>
              Your payment information is encrypted and secured. We never store full card numbers.
            </Text>
          </View>
        </ScrollView>

        {/* Add Modal */}
        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
              <View style={styles.sheetHandle} />

              <View style={styles.sheetHeaderRow}>
                <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
                  {addStep === 'choose_type'
                    ? 'Add Payment Method'
                    : addStep === 'upi_details'
                    ? 'Add UPI'
                    : 'Add Debit / Credit Card'}
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeBtn}>
                  <X size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Step 1: choose type */}
              {addStep === 'choose_type' && (
                <>
                  <TouchableOpacity
                    style={styles.typeOption}
                    onPress={() => setAddStep('upi_details')}
                  >
                    <View style={styles.typeIconWrap}>
                      <Smartphone size={22} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.typeLabel, { color: colors.textPrimary }]}>UPI</Text>
                      <Text style={[styles.typeSub, { color: colors.textSecondary }]}>
                        Google Pay, PhonePe, Paytm & more
                      </Text>
                    </View>
                    <Text style={styles.typeArrow}>›</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.typeOption}
                    onPress={() => setAddStep('card_details')}
                  >
                    <View style={styles.typeIconWrap}>
                      <CreditCard size={22} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.typeLabel, { color: colors.textPrimary }]}>
                        Debit / Credit Card
                      </Text>
                      <Text style={[styles.typeSub, { color: colors.textSecondary }]}>
                        Visa, Mastercard, RuPay
                      </Text>
                    </View>
                    <Text style={styles.typeArrow}>›</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Step 2a: UPI */}
              {addStep === 'upi_details' && (
                <>
                  <TouchableOpacity
                    style={styles.backRow}
                    onPress={() => setAddStep('choose_type')}
                  >
                    <ArrowLeft size={14} color={Colors.primary} />
                    <Text style={styles.backRowText}>Back</Text>
                  </TouchableOpacity>

                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    SELECT APP
                  </Text>
                  <View style={styles.upiAppsRow}>
                    {UPI_APPS.map((app) => {
                      const active = selectedUpiApp === app.id;
                      return (
                        <TouchableOpacity
                          key={app.id}
                          style={[styles.upiAppCard, active && styles.upiAppCardActive]}
                          onPress={() => setSelectedUpiApp(app.id)}
                        >
                          <Text style={styles.upiAppEmoji}>{app.emoji}</Text>
                          <Text style={[styles.upiAppLabel, active && styles.upiAppLabelActive]}>
                            {app.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>UPI ID</Text>
                  <View style={[styles.inputBox, { borderColor: upiIdError ? Colors.danger : upiId ? Colors.primary : colors.border }]}>
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder="yourname@upi (min 5 chars)"
                      placeholderTextColor={colors.placeholder}
                      value={upiId}
                      onChangeText={(t) => { setUpiId(t.slice(0, 50)); if (upiIdError) setUpiIdError(''); }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      maxLength={50}
                    />
                  </View>
                  {upiIdError ? <Text style={styles.errorText}>{upiIdError}</Text> : null}

                  <Button
                    label="Add UPI"
                    onPress={handleAddUpi}
                    disabled={!canAddUpi}
                    style={{ marginTop: 4 }}
                  />
                </>
              )}

              {/* Step 2b: Card */}
              {addStep === 'card_details' && (
                <>
                  <TouchableOpacity
                    style={styles.backRow}
                    onPress={() => setAddStep('choose_type')}
                  >
                    <ArrowLeft size={14} color={Colors.primary} />
                    <Text style={styles.backRowText}>Back</Text>
                  </TouchableOpacity>

                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>CARD NUMBER</Text>
                  <View style={[styles.inputBox, { borderColor: cardNumberError ? Colors.danger : cardNumber ? Colors.primary : colors.border }]}>
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor={colors.placeholder}
                      value={cardNumber}
                      onChangeText={(t) => { setCardNumber(formatCardNumber(t)); if (cardNumberError) setCardNumberError(''); }}
                      keyboardType="numeric"
                      maxLength={19}
                    />
                  </View>
                  {cardNumberError ? <Text style={styles.errorText}>{cardNumberError}</Text> : null}

                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>NAME ON CARD</Text>
                  <View style={[styles.inputBox, { borderColor: cardNameError ? Colors.danger : cardName ? Colors.primary : colors.border }]}>
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder="As printed on card (letters only)"
                      placeholderTextColor={colors.placeholder}
                      value={cardName}
                      onChangeText={(t) => {
                        // Only letters and spaces
                        const cleaned = t.replace(/[^A-Za-z\s]/g, '').slice(0, 60);
                        setCardName(cleaned);
                        if (cardNameError) setCardNameError('');
                      }}
                      autoCapitalize="words"
                      maxLength={60}
                    />
                  </View>
                  {cardNameError ? <Text style={styles.errorText}>{cardNameError}</Text> : null}

                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>EXPIRY DATE</Text>
                  <View style={[styles.inputBox, { borderColor: cardExpiryError ? Colors.danger : cardExpiry ? Colors.primary : colors.border }]}>
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder="MM/YY"
                      placeholderTextColor={colors.placeholder}
                      value={cardExpiry}
                      onChangeText={(t) => { setCardExpiry(formatExpiry(t)); if (cardExpiryError) setCardExpiryError(''); }}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  {cardExpiryError ? <Text style={styles.errorText}>{cardExpiryError}</Text> : null}

                  <View style={styles.cvvNote}>
                    <Shield size={13} color="#16A34A" />
                    <Text style={styles.cvvNoteText}>CVV is never stored and asked only at checkout</Text>
                  </View>

                  <Button
                    label="Add Card"
                    onPress={handleAddCard}
                    disabled={!canAddCard}
                    style={{ marginTop: 4 }}
                  />
                </>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 16,
    gap: 12,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#FFD6B3', justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: '#666', fontWeight: '500', marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#FFD6B3', justifyContent: 'center', alignItems: 'center',
  },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },

  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },

  walletBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF7F2', borderRadius: 20, padding: 18,
    borderWidth: 1.5, borderColor: '#FFD6B3',
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  walletTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  walletBalance: { fontSize: 13, color: '#666', marginTop: 2 },
  topUpBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#FFD6B3',
  },
  topUpText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  sectionTitle: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginTop: 4, marginBottom: -4,
  },

  methodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    borderWidth: 1.5, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  methodCardDefault: { borderColor: Colors.primary, backgroundColor: '#FFFAF7' },
  methodIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#FFD6B3',
  },
  methodInfo: { flex: 1, gap: 3 },
  methodTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  methodLabel: { fontSize: 15, fontWeight: '700' },
  methodDetail: { fontSize: 12 },
  defaultBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FFF0E6', paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 10, borderWidth: 1, borderColor: '#FFD6B3',
  },
  defaultText: { fontSize: 10, fontWeight: '700', color: '#FF6B00' },
  methodActions: { flexDirection: 'column', alignItems: 'flex-end', gap: 6 },
  setDefaultBtn: {
    backgroundColor: '#FFF0E6', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1, borderColor: '#FFD6B3',
  },
  setDefaultText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#FFCDD2',
  },

  addMoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    borderWidth: 1.5, borderColor: '#FFE8D6', borderStyle: 'dashed',
  },
  addMoreIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center',
  },
  addMoreText: { fontSize: 14, fontWeight: '600', color: Colors.primary },

  secureCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#F0FDF4', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  secureText: { flex: 1, fontSize: 12, lineHeight: 18, color: '#166534' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 48, gap: 12,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB',
    alignSelf: 'center', marginBottom: 8,
  },
  sheetHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },

  typeOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 18, borderWidth: 1.5, borderColor: '#FFE8D6',
    backgroundColor: '#FAFAFA',
  },
  typeIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center',
  },
  typeLabel: { fontSize: 15, fontWeight: '700' },
  typeSub: { fontSize: 12, marginTop: 2 },
  typeArrow: { fontSize: 22, color: '#9CA3AF', fontWeight: '300' },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: -4 },
  backRowText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  fieldLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: -4 },

  upiAppsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  upiAppCard: {
    alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 14, borderWidth: 1.5, borderColor: '#FFE8D6', backgroundColor: '#FAFAFA',
    minWidth: 64,
  },
  upiAppCardActive: { borderColor: Colors.primary, backgroundColor: '#FFF7F2' },
  upiAppEmoji: { fontSize: 20 },
  upiAppLabel: { fontSize: 10, fontWeight: '600', color: '#9CA3AF', textAlign: 'center' },
  upiAppLabelActive: { color: Colors.primary },

  inputBox: {
    borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 4,
    backgroundColor: '#FAFAFA',
  },
  input: { fontSize: 15, paddingVertical: 10 },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: -6, marginLeft: 4 },

  cvvNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F0FDF4', borderRadius: 12, padding: 10,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  cvvNoteText: { flex: 1, fontSize: 12, color: '#166534', fontWeight: '500' },
});
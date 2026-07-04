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
  Landmark,
  Banknote,
  Star,
  Shield,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { Button } from '../../components/common/Button';
import { useComingSoon } from '../../components/common/ComingSoonModal';
import {
  validateUpiId,
  validateCardNumber,
  validateCardName,
  validateCardExpiry,
} from '../../utils/validators';
import HOME_BG from '../../assets/bg/homeBg';

type MethodType = 'upi' | 'card';

interface PaymentMethod {
  id: string;
  type: MethodType;
  label: string;
  detail: string;
  isDefault: boolean;
}

const INITIAL_METHODS: PaymentMethod[] = [
  { id: 'pm-1', type: 'upi', label: 'Google Pay', detail: 'user@okicici', isDefault: true },
];

const UPI_APPS = [
  { id: 'gpay', label: 'Google Pay', emoji: '🟢' },
  { id: 'phonepe', label: 'PhonePe', emoji: '🟣' },
  { id: 'supermoney', label: 'super.money', emoji: '🔷' },
  { id: 'paytm', label: 'Paytm', emoji: '🔵' },
  { id: 'bhim', label: 'BHIM UPI', emoji: '🇮🇳' },
  { id: 'other', label: 'Other UPI', emoji: '📲' },
];

const BANKS = [
  { id: 'sbi', label: 'State Bank of India' },
  { id: 'hdfc', label: 'HDFC Bank' },
  { id: 'icici', label: 'ICICI Bank' },
  { id: 'axis', label: 'Axis Bank' },
  { id: 'kotak', label: 'Kotak Mahindra Bank' },
];

function MethodIcon({ type, size = 20 }: { type: MethodType; size?: number }) {
  if (type === 'upi') return <Smartphone size={size} color={Colors.primary} />;
  return <CreditCard size={size} color={Colors.primary} />;
}

type AddStep = 'choose_type' | 'upi_details' | 'card_details';
type SectionKey = 'upi' | 'cards' | 'netbanking' | 'others';

export default function PaymentMethodsScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const { show: showComingSoon, modal: comingSoonModal } = useComingSoon();

  const [methods, setMethods] = useState<PaymentMethod[]>(INITIAL_METHODS);
  const [showModal, setShowModal] = useState(false);
  const [addStep, setAddStep] = useState<AddStep>('choose_type');

  // Which "All Payment Options" section is expanded
  const [openSection, setOpenSection] = useState<SectionKey | null>('upi');

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

  const walletBalance = 0;
  const upiMethods = methods.filter((m) => m.type === 'upi');
  const cardMethods = methods.filter((m) => m.type === 'card');

  const toggleSection = (key: SectionKey) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const openAdd = (step: AddStep = 'choose_type', upiAppId?: string) => {
    setAddStep(step);
    setSelectedUpiApp(upiAppId ?? null);
    setUpiId(''); setUpiIdError('');
    setCardNumber(''); setCardName(''); setCardExpiry('');
    setCardNumberError(''); setCardNameError(''); setCardExpiryError('');
    setShowModal(true);
  };

  // Tapping a "Pay by any UPI app" row: if already saved, make it default;
  // otherwise jump straight into the UPI-ID entry step for that app.
  const handleQuickUpiTap = (appId: string) => {
    const app = UPI_APPS.find((a) => a.id === appId);
    const existing = methods.find((m) => m.type === 'upi' && m.label === app?.label);
    if (existing) {
      setDefault(existing.id);
      return;
    }
    openAdd('upi_details', appId);
  };

  const handleBankTap = (bankLabel: string) => {
    // No live netbanking gateway is wired up yet — tell the user honestly
    // instead of leaving the row silently doing nothing.
    showComingSoon(`Netbanking with ${bankLabel}`);
  };

  const setDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  const handleDelete = (id: string, label: string) => {
    const method = methods.find((m) => m.id === id);
    if (method?.isDefault && methods.length > 1) {
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
      isDefault: methods.length === 0,
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
      isDefault: methods.length === 0,
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
    <ImageBackground source={HOME_BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        {comingSoonModal}

        {/* Hero Header */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{t('paymentMethodsTitle')}</Text>
              <Text style={styles.heroSubtitle}>Manage how you pay for rides</Text>
            </View>
            <TouchableOpacity onPress={() => openAdd('choose_type')} style={styles.addBtn} accessibilityLabel="Add payment method">
              <Plus size={18} color="#FF6B00" />
            </TouchableOpacity>
          </View>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipText}>🔒 Secure payments</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>⚡ Instant pay</Text></View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* ══ Wallets ══ */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>WALLETS</Text>
          <View style={styles.walletBanner}>
            <View style={styles.walletLeft}>
              <Wallet size={28} color="#FF6B00" />
              <View>
                <Text style={styles.walletTitle}>Vahan Pay</Text>
                <Text style={styles.walletBalance}>
                  {walletBalance > 0 ? `₹${walletBalance} balance` : 'Low balance: ₹0'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.topUpBtn} onPress={() => router.push('/add-money')} accessibilityLabel="Add money to Vahan Pay wallet">
              <Plus size={14} color="#FF6B00" />
              <Text style={styles.topUpText}>Add Money</Text>
            </TouchableOpacity>
          </View>

          {/* ══ Pay by any UPI app ══ */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 8 }]}>
            PAY BY ANY UPI APP
          </Text>
          <View style={styles.groupCard}>
            {UPI_APPS.slice(0, 4).map((app, idx) => {
              const saved = upiMethods.find((m) => m.label === app.label);
              return (
                <View key={app.id}>
                  <TouchableOpacity
                    style={styles.rowItem}
                    onPress={() => handleQuickUpiTap(app.id)}
                    accessibilityLabel={`${saved ? 'Set default' : 'Add'} ${app.label}`}
                  >
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowEmoji}>{app.emoji}</Text>
                      <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{app.label}</Text>
                    </View>
                    {saved ? (
                      saved.isDefault ? (
                        <View style={styles.defaultBadge}>
                          <Star size={9} color="#FF6B00" fill="#FF6B00" />
                          <Text style={styles.defaultText}>Default</Text>
                        </View>
                      ) : (
                        <Text style={styles.setDefaultInline}>Set Default</Text>
                      )
                    ) : (
                      <ChevronRight size={16} color={colors.placeholder} />
                    )}
                  </TouchableOpacity>
                  {idx < 3 && <View style={[styles.rowDivider, { backgroundColor: colors.cardBorder }]} />}
                </View>
              );
            })}
          </View>

          {/* ══ Saved UPI IDs (beyond the quick list, e.g. "Other UPI") ══ */}
          {upiMethods.filter((m) => !UPI_APPS.slice(0, 4).some((a) => a.label === m.label)).map((method) => (
            <View key={method.id} style={[styles.methodCard, method.isDefault && styles.methodCardDefault, { marginTop: 8 }]}>
              <View style={styles.methodIconWrap}><MethodIcon type="upi" size={20} /></View>
              <View style={styles.methodInfo}>
                <View style={styles.methodTitleRow}>
                  <Text style={[styles.methodLabel, { color: colors.textPrimary }]}>{method.label}</Text>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Star size={9} color="#FF6B00" fill="#FF6B00" />
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.methodDetail, { color: colors.textSecondary }]}>{method.detail}</Text>
              </View>
              <View style={styles.methodActions}>
                {!method.isDefault && (
                  <TouchableOpacity onPress={() => setDefault(method.id)} style={styles.setDefaultBtn}>
                    <Text style={styles.setDefaultText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDelete(method.id, method.label)} style={styles.deleteBtn}>
                  <Trash2 size={15} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* ══ Cards ══ */}
          <TouchableOpacity
            style={[styles.groupHeader, { marginTop: 20 }]}
            onPress={() => toggleSection('cards')}
            activeOpacity={0.8}
          >
            <View style={styles.groupHeaderLeft}>
              <CreditCard size={16} color={Colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 0, marginBottom: 0 }]}>CARDS</Text>
            </View>
            {openSection === 'cards' ? <ChevronUp size={16} color="#9CA3AF" /> : <ChevronDown size={16} color="#9CA3AF" />}
          </TouchableOpacity>

          {openSection === 'cards' && (
            <View style={styles.groupCard}>
              {cardMethods.length === 0 ? (
                <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                  No cards saved yet.
                </Text>
              ) : (
                cardMethods.map((method, idx) => (
                  <View key={method.id}>
                    <View style={styles.rowItem}>
                      <View style={styles.rowLeft}>
                        <CreditCard size={18} color={Colors.primary} />
                        <View>
                          <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{method.label}</Text>
                          <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{method.detail}</Text>
                        </View>
                      </View>
                      <View style={styles.methodActions}>
                        {method.isDefault ? (
                          <View style={styles.defaultBadge}>
                            <Star size={9} color="#FF6B00" fill="#FF6B00" />
                            <Text style={styles.defaultText}>Default</Text>
                          </View>
                        ) : (
                          <TouchableOpacity onPress={() => setDefault(method.id)} style={styles.setDefaultBtn}>
                            <Text style={styles.setDefaultText}>Set Default</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => handleDelete(method.id, method.label)} style={styles.deleteBtn}>
                          <Trash2 size={15} color={Colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={[styles.rowDivider, { backgroundColor: colors.cardBorder }]} />
                  </View>
                ))
              )}
              <TouchableOpacity style={styles.addRow} onPress={() => openAdd('card_details')}>
                <Plus size={15} color={Colors.primary} />
                <Text style={styles.addRowText}>Add Debit / Credit Card</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══ Netbanking ══ */}
          <TouchableOpacity
            style={[styles.groupHeader, { marginTop: 14 }]}
            onPress={() => toggleSection('netbanking')}
            activeOpacity={0.8}
          >
            <View style={styles.groupHeaderLeft}>
              <Landmark size={16} color={Colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 0, marginBottom: 0 }]}>NETBANKING</Text>
            </View>
            {openSection === 'netbanking' ? <ChevronUp size={16} color="#9CA3AF" /> : <ChevronDown size={16} color="#9CA3AF" />}
          </TouchableOpacity>

          {openSection === 'netbanking' && (
            <View style={styles.groupCard}>
              {BANKS.map((bank, idx) => (
                <View key={bank.id}>
                  <TouchableOpacity
                    style={styles.rowItem}
                    onPress={() => handleBankTap(bank.label)}
                    accessibilityLabel={`Pay via ${bank.label} netbanking`}
                  >
                    <View style={styles.rowLeft}>
                      <Landmark size={18} color={Colors.primary} />
                      <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{bank.label}</Text>
                    </View>
                    <ChevronRight size={16} color={colors.placeholder} />
                  </TouchableOpacity>
                  {idx < BANKS.length - 1 && <View style={[styles.rowDivider, { backgroundColor: colors.cardBorder }]} />}
                </View>
              ))}
            </View>
          )}

          {/* ══ Others ══ */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>OTHERS</Text>
          <View style={styles.groupCard}>
            <View style={styles.rowItem}>
              <View style={styles.rowLeft}>
                <Banknote size={18} color={Colors.primary} />
                <View>
                  <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Cash</Text>
                  <Text style={[styles.rowSub, { color: colors.textSecondary }]}>Always available · no setup needed</Text>
                </View>
              </View>
              <Check size={16} color={Colors.success} />
            </View>
            <View style={[styles.rowDivider, { backgroundColor: colors.cardBorder }]} />
            <TouchableOpacity
              style={styles.rowItem}
              onPress={() => router.push('/(main)/wallet')}
              accessibilityLabel="Show passbook"
            >
              <View style={styles.rowLeft}>
                <Wallet size={18} color={Colors.primary} />
                <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Show Passbook</Text>
              </View>
              <ChevronRight size={16} color={colors.placeholder} />
            </TouchableOpacity>
          </View>

          {/* Security note */}
          <View style={styles.secureCard}>
            <Shield size={16} color="#16A34A" />
            <Text style={styles.secureText}>{t('paymentSecurity')}</Text>
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
                  {t('addPaymentMethod')}
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeBtn}>
                  <X size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Step 1: choose type */}
              {addStep === 'choose_type' && (
                <>
                  <TouchableOpacity style={styles.typeOption} onPress={() => openAdd('upi_details')}>
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

                  <TouchableOpacity style={styles.typeOption} onPress={() => openAdd('card_details')}>
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
                  <TouchableOpacity style={styles.backRow} onPress={() => setAddStep('choose_type')}>
                    <ArrowLeft size={14} color={Colors.primary} />
                    <Text style={styles.backRowText}>Back</Text>
                  </TouchableOpacity>

                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>SELECT APP</Text>
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
                      onChangeText={(v) => { setUpiId(v.slice(0, 50)); if (upiIdError) setUpiIdError(''); }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      maxLength={50}
                    />
                  </View>
                  {upiIdError ? <Text style={styles.errorText}>{upiIdError}</Text> : null}

                  <Button
                    label={t('addPaymentMethod')}
                    onPress={handleAddUpi}
                    disabled={!canAddUpi}
                    style={{ marginTop: 4 }}
                  />
                </>
              )}

              {/* Step 2b: Card */}
              {addStep === 'card_details' && (
                <>
                  <TouchableOpacity style={styles.backRow} onPress={() => setAddStep('choose_type')}>
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
                      onChangeText={(v) => { setCardNumber(formatCardNumber(v)); if (cardNumberError) setCardNumberError(''); }}
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
                      onChangeText={(v) => {
                        const cleaned = v.replace(/[^A-Za-z\s]/g, '').slice(0, 60);
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
                      onChangeText={(v) => { setCardExpiry(formatExpiry(v)); if (cardExpiryError) setCardExpiryError(''); }}
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
                    label={t('addPaymentMethod')}
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

const makeStyles = (colors: any) => StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  safe: { flex: 1, backgroundColor: 'transparent' },

  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: colors.surfaceElevated, marginBottom: 16,
    gap: 12,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: {
    backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },

  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 8 },

  walletBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.subtleBg, borderRadius: 20, padding: 18,
    borderWidth: 1.5, borderColor: colors.iconBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  walletTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  walletBalance: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  topUpBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: colors.iconBorder,
  },
  topUpText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  sectionTitle: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginTop: 4, marginBottom: 8,
  },

  groupHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 4,
  },
  groupHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  groupCard: {
    backgroundColor: colors.surface, borderRadius: 20,
    borderWidth: 1.5, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, gap: 10,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowEmoji: { fontSize: 20, width: 24, textAlign: 'center' },
  rowLabel: { fontSize: 14, fontWeight: '700' },
  rowSub: { fontSize: 11, marginTop: 2 },
  rowDivider: { height: 1, marginLeft: 16 },
  setDefaultInline: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  emptyHint: { fontSize: 13, paddingHorizontal: 16, paddingVertical: 14 },
  addRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  addRowText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  methodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderRadius: 20, padding: 16,
    borderWidth: 1.5, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  methodCardDefault: { borderColor: Colors.primary, backgroundColor: colors.termsBg },
  methodIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.iconBg, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.iconBorder,
  },
  methodInfo: { flex: 1, gap: 3 },
  methodTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  methodLabel: { fontSize: 15, fontWeight: '700' },
  methodDetail: { fontSize: 12 },
  defaultBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.iconBg, paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 10, borderWidth: 1, borderColor: colors.iconBorder,
  },
  defaultText: { fontSize: 10, fontWeight: '700', color: '#FF6B00' },
  methodActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  setDefaultBtn: {
    backgroundColor: colors.iconBg, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1, borderColor: colors.iconBorder,
  },
  setDefaultText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#FFCDD2',
  },

  secureCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: colors.surfaceElevated, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#BBF7D0', marginTop: 16,
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
    width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: 8,
  },
  sheetHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.divider, justifyContent: 'center', alignItems: 'center',
  },

  typeOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 18, borderWidth: 1.5, borderColor: colors.cardBorder,
    backgroundColor: colors.inputBackground,
  },
  typeIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.iconBg, justifyContent: 'center', alignItems: 'center',
  },
  typeLabel: { fontSize: 15, fontWeight: '700' },
  typeSub: { fontSize: 12, marginTop: 2 },
  typeArrow: { fontSize: 22, color: colors.placeholder, fontWeight: '300' },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: -4 },
  backRowText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  fieldLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: -4 },

  upiAppsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  upiAppCard: {
    alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 14, borderWidth: 1.5, borderColor: colors.cardBorder, backgroundColor: colors.inputBackground,
    minWidth: 64,
  },
  upiAppCardActive: { borderColor: Colors.primary, backgroundColor: colors.subtleBg },
  upiAppEmoji: { fontSize: 20 },
  upiAppLabel: { fontSize: 10, fontWeight: '600', color: colors.placeholder, textAlign: 'center' },
  upiAppLabelActive: { color: Colors.primary },

  inputBox: {
    borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 4,
    backgroundColor: colors.inputBackground,
  },
  input: { fontSize: 15, paddingVertical: 10 },
  errorText: { fontSize: 12, color: Colors.danger, marginTop: -6, marginLeft: 4 },

  cvvNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: 10,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  cvvNoteText: { flex: 1, fontSize: 12, color: '#166534', fontWeight: '500' },
});
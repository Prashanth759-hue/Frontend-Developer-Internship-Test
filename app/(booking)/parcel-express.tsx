import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Circle,
  User,
  Phone,
  Package,
  Zap,
  Clock,
  Check,
  ChevronRight,
  MessageSquare,
  Shield,
  BookUser,
} from 'lucide-react-native';
import { Alert } from 'react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/common/Button';
import { useBookingStore } from '../../store/bookingStore';
import { useMapPickerStore } from '../../store/mapPickerStore';
import LocationSearchInput from '../../components/booking/LocationSearchInput';
import {
  EXPRESS_TIME_SLOTS,
  EXPRESS_PARCEL_SIZES,
  EXPRESS_PARCEL_CATEGORIES,
} from '../../constants/mockData';
import {
  validateName,
  validatePhone,
  sanitizePhone,
  sanitizeName,
} from '../../utils/validators';

type Step = 'address' | 'parcel' | 'confirm';

const STEP_LABELS: Record<Step, string> = {
  address: 'Locations',
  parcel: 'Parcel Details',
  confirm: 'Confirm',
};
const STEPS: Step[] = ['address', 'parcel', 'confirm'];

export default function ParcelExpressScreen() {
  const { colors } = useTheme();
  const { setPickup, setDrop, setEstimatedFare, setSelectedVehicle, setServiceType } =
    useBookingStore();
  const { result: mapResult, clearResult } = useMapPickerStore();

  const [step, setStep] = useState<Step>('address');

  // Step 1 — address
  const [pickupText, setPickupText] = useState('');
  const [dropText, setDropText] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      if (mapResult) {
        if (mapResult.fieldKey === 'pickup') setPickupText(mapResult.address);
        else if (mapResult.fieldKey === 'drop') setDropText(mapResult.address);
        clearResult();
      }
    }, [mapResult])
  );

  // Step 2 — parcel
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>(EXPRESS_TIME_SLOTS[0].id);
  const [parcelDesc, setParcelDesc] = useState('');

  // Errors
  const [receiverNameError, setReceiverNameError] = useState('');
  const [receiverPhoneError, setReceiverPhoneError] = useState('');
  const [sizeError, setSizeError] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const chosenSize = EXPRESS_PARCEL_SIZES.find((s) => s.id === selectedSize);
  const chosenSlot = EXPRESS_TIME_SLOTS.find((s) => s.id === selectedSlot);
  const expressCharge = chosenSlot?.surcharge ?? 0;
  const sizePrice = chosenSize?.price ?? 0;
  const platformFee = 10;
  const totalFare = sizePrice + expressCharge + platformFee;

  // Handlers
  const handleReceiverNameChange = (text: string) => {
    setReceiverName(sanitizeName(text));
    if (receiverNameError) setReceiverNameError('');
  };

  const handleReceiverPhoneChange = (text: string) => {
    setReceiverPhone(sanitizePhone(text));
    if (receiverPhoneError) setReceiverPhoneError('');
  };

  // Validation
  const canProceedAddress = pickupText.trim().length > 2 && dropText.trim().length > 2;

  const validateParcelStep = (): boolean => {
    let hasError = false;
    const nameRes = validateName(receiverName);
    if (!nameRes.valid) { setReceiverNameError(nameRes.error ?? 'Invalid name'); hasError = true; }
    const phoneRes = validatePhone(receiverPhone);
    if (!phoneRes.valid) { setReceiverPhoneError(phoneRes.error ?? 'Invalid phone'); hasError = true; }
    if (!selectedSize) { setSizeError('Please select a parcel size.'); hasError = true; }
    else setSizeError('');
    if (!selectedCategory) { setCategoryError('Please select what you are sending.'); hasError = true; }
    else setCategoryError('');
    return !hasError;
  };

  const handleContactPicker = () => {
    Alert.alert(
      'Contact Permission',
      'Allow Vahan360 to access your contacts to pick receiver details?',
      [
        { text: 'Deny', style: 'cancel' },
        {
          text: 'Allow',
          onPress: () => {
            // Simulated contact pick for demo
            setReceiverName('Ravi Kumar');
            setReceiverPhone('9876543210');
            setReceiverNameError('');
            setReceiverPhoneError('');
          },
        },
      ]
    );
  };

  const canProceedParcel =
    validateName(receiverName).valid &&
    validatePhone(receiverPhone).valid &&
    selectedSize !== null &&
    selectedCategory !== null;

  const goBack = () => {
    if (step === 'parcel') { setStep('address'); return; }
    if (step === 'confirm') { setStep('parcel'); return; }
    router.back();
  };

  const handleAddressNext = () => {
    setPickup({ label: 'Pickup', address: pickupText.trim() });
    setDrop({ label: 'Drop', address: dropText.trim() });
    setStep('parcel');
  };

  const handleParcelNext = () => {
    if (!validateParcelStep()) return;
    setStep('confirm');
  };

  const handleConfirm = () => {
    setServiceType('parcel');
    setSelectedVehicle('express_parcel');
    setEstimatedFare(totalFare);
    router.push('/(booking)/searching');
  };

  // ─── Step progress indicator ───────────────────────────────────────────────
  const StepProgress = () => (
    <View style={styles.stepProgress}>
      {STEPS.map((s, i) => {
        const done = STEPS.indexOf(step) > i;
        const active = step === s;
        return (
          <React.Fragment key={s}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  active && styles.stepDotActive,
                  done && styles.stepDotDone,
                ]}
              >
                {done ? (
                  <Check size={10} color="#FFFFFF" />
                ) : (
                  <Text style={[styles.stepNum, active && styles.stepNumActive]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
                {STEP_LABELS[s]}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, done && styles.stepLineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  // ─── Hero header (shared) ──────────────────────────────────────────────────
  const HeroHeader = () => (
    <View style={styles.heroHeader}>
      <View style={styles.heroTopRow}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} accessibilityLabel="Go back">
          <ArrowLeft size={20} color="#FF6B00" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={styles.expressTag}>
            <Zap size={11} color="#FF6B00" fill="#FF6B00" />
            <Text style={styles.expressTagText}>EXPRESS</Text>
          </View>
          <Text style={styles.heroTitle}>Express Delivery</Text>
          <Text style={styles.heroSubtitle}>Delivered in under 2 hours</Text>
        </View>
      </View>
      <View style={styles.chipsRow}>
        <View style={styles.chip}><Text style={styles.chipText}>⚡ Under 2 hrs</Text></View>
        <View style={styles.chip}><Text style={styles.chipText}>📍 Live tracking</Text></View>
        <View style={styles.chip}><Text style={styles.chipText}>🔒 Insured</Text></View>
      </View>
      <StepProgress />
    </View>
  );

  // ─── STEP 1: Address ───────────────────────────────────────────────────────
  if (step === 'address') {
    return (
      <ImageBackground
        source={require('../../assets/images/home-bg.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safe}>
          <HeroHeader />
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Locations card */}
            <View style={[styles.card, { zIndex: 20 }]}>
              <Text style={styles.cardLabel}>📍 PICKUP & DROP</Text>

              <LocationSearchInput
                value={pickupText}
                onChangeText={setPickupText}
                onSelect={setPickupText}
                placeholder="Pickup address"
                dotType="circle"
                dotColor={Colors.primary}
                fieldKey="pickup"
              />

              <View style={styles.locationDivider} />

              <LocationSearchInput
                value={dropText}
                onChangeText={setDropText}
                onSelect={setDropText}
                placeholder="Drop address"
                dotType="pin"
                dotColor={Colors.danger}
                fieldKey="drop"
              />
            </View>

            {/* Express time slots */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>⏰ DELIVERY TIME</Text>
              {EXPRESS_TIME_SLOTS.map((slot) => {
                const active = selectedSlot === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[styles.slotRow, active && styles.slotRowActive]}
                    onPress={() => setSelectedSlot(slot.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.slotLeft}>
                      <Text style={styles.slotEmoji}>{slot.emoji}</Text>
                      <View>
                        <Text style={[styles.slotTitle, active && styles.slotTitleActive]}>
                          {slot.label}
                        </Text>
                        <Text style={[styles.slotDesc, { color: colors.textSecondary }]}>
                          {slot.description}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.slotRight}>
                      {slot.surcharge > 0 ? (
                        <View style={styles.surchargeBadge}>
                          <Text style={styles.surchargeText}>+₹{slot.surcharge}</Text>
                        </View>
                      ) : (
                        <View style={styles.freeBadge}>
                          <Text style={styles.freeText}>Standard</Text>
                        </View>
                      )}
                      {active && (
                        <View style={styles.slotCheck}>
                          <Check size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Info */}
            <View style={styles.infoBanner}>
              <Zap size={16} color="#FF6B00" fill="#FF6B00" />
              <Text style={styles.infoBannerText}>
                Express deliveries are fulfilled by our nearest available riders within your city only.
              </Text>
            </View>

            <Button
              label="Continue to Parcel Details"
              onPress={handleAddressNext}
              disabled={!canProceedAddress}
              style={styles.ctaBtn}
            />
            <View style={{ height: 32 }} />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  // ─── STEP 2: Parcel Details ────────────────────────────────────────────────
  if (step === 'parcel') {
    return (
      <ImageBackground
        source={require('../../assets/images/home-bg.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safe}>
          <HeroHeader />
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Receiver details */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>👤 RECEIVER DETAILS</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputIconWrap}>
                  <User size={16} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[styles.inputField, { color: colors.textPrimary }, receiverNameError ? styles.inputError : null]}
                    placeholder="Receiver's name"
                    placeholderTextColor="#AAAAAA"
                    value={receiverName}
                    onChangeText={handleReceiverNameChange}
                    maxLength={60}
                  />
                  {receiverNameError ? <Text style={styles.errorText}>{receiverNameError}</Text> : null}
                </View>
              </View>

              <View style={styles.inputDivider} />

              <View style={styles.inputRow}>
                <View style={styles.inputIconWrap}>
                  <Phone size={16} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[styles.inputField, { color: colors.textPrimary }, receiverPhoneError ? styles.inputError : null]}
                    placeholder="Receiver's phone number"
                    placeholderTextColor="#AAAAAA"
                    value={receiverPhone}
                    onChangeText={handleReceiverPhoneChange}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                  {receiverPhoneError ? <Text style={styles.errorText}>{receiverPhoneError}</Text> : null}
                </View>
                <TouchableOpacity
                  style={styles.contactPickerBtn}
                  onPress={handleContactPicker}
                  accessibilityLabel="Pick from contacts"
                >
                  <BookUser size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Parcel size */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>📏 PARCEL SIZE</Text>
              {EXPRESS_PARCEL_SIZES.map((size) => {
                const active = selectedSize === size.id;
                return (
                  <TouchableOpacity
                    key={size.id}
                    style={[styles.sizeRow, active && styles.sizeRowActive]}
                    onPress={() => { setSelectedSize(size.id); setSizeError(''); }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.sizeEmoji}>{size.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sizeName, active && styles.sizeNameActive]}>
                        {size.label}
                      </Text>
                      <Text style={[styles.sizeDesc, { color: colors.textSecondary }]}>
                        {size.description}
                      </Text>
                    </View>
                    <Text style={[styles.sizePrice, active && styles.sizePriceActive]}>
                      ₹{size.price}
                    </Text>
                    {active && (
                      <View style={styles.checkCircle}>
                        <Check size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {sizeError ? (
                <Text style={[styles.errorText, { marginTop: 2, marginLeft: 0 }]}>{sizeError}</Text>
              ) : null}

            {/* What are you sending */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>📦 WHAT ARE YOU SENDING?</Text>
              <View style={styles.categoryGrid}>
                {EXPRESS_PARCEL_CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catCard, active && styles.catCardActive]}
                      onPress={() => { setSelectedCategory(cat.id); setCategoryError(''); }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.catEmoji}>{cat.emoji}</Text>
                      <Text style={[styles.catName, active && styles.catNameActive]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {categoryError ? (
                  <Text style={[styles.errorText, { marginTop: 2, marginLeft: 0 }]}>{categoryError}</Text>
                ) : null}

              <View style={styles.inputDivider} />

              <View style={styles.inputRow}>
                <View style={styles.inputIconWrap}>
                  <MessageSquare size={16} color={Colors.primary} />
                </View>
                <TextInput
                  style={[styles.inputField, { color: colors.textPrimary, flex: 1 }]}
                  placeholder="Add description (optional)"
                  placeholderTextColor="#AAAAAA"
                  value={parcelDesc}
                  onChangeText={(t) => setParcelDesc(t.slice(0, 300))}
                  multiline
                  maxLength={300}
                />
              </View>
            </View>

            <Button
              label="Review & Confirm"
              onPress={handleParcelNext}
              disabled={!canProceedParcel}
              style={styles.ctaBtn}
            />
            <View style={{ height: 32 }} />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  // ─── STEP 3: Confirm ──────────────────────────────────────────────────────
  return (
    <ImageBackground
      source={require('../../assets/images/home-bg.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <HeroHeader />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Route summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>📍 ROUTE</Text>
            <View style={styles.summaryLocationRow}>
              <Circle size={10} color={Colors.primary} fill={Colors.primary} />
              <Text style={[styles.summaryLocationText, { color: colors.textPrimary }]}>
                {pickupText}
              </Text>
            </View>
            <View style={styles.summaryLineDivider} />
            <View style={styles.summaryLocationRow}>
              <MapPin size={12} color={Colors.danger} fill={Colors.danger} />
              <Text style={[styles.summaryLocationText, { color: colors.textPrimary }]}>
                {dropText}
              </Text>
            </View>
          </View>

          {/* Delivery time summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>⏰ DELIVERY SLOT</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryEmoji}>{chosenSlot?.emoji}</Text>
              <View>
                <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
                  {chosenSlot?.label}
                </Text>
                <Text style={[styles.summarySubtitle, { color: colors.textSecondary }]}>
                  {chosenSlot?.description}
                </Text>
              </View>
            </View>
          </View>

          {/* Parcel & receiver */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>📦 PARCEL & RECEIVER</Text>
            <View style={styles.summaryItemRow}>
              <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Size</Text>
              <Text style={[styles.summaryItemValue, { color: colors.textPrimary }]}>
                {chosenSize?.label}
              </Text>
            </View>
            <View style={styles.summaryItemRow}>
              <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Category</Text>
              <Text style={[styles.summaryItemValue, { color: colors.textPrimary }]}>
                {EXPRESS_PARCEL_CATEGORIES.find((c) => c.id === selectedCategory)?.name}
              </Text>
            </View>
            <View style={styles.summaryItemRow}>
              <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Receiver</Text>
              <Text style={[styles.summaryItemValue, { color: colors.textPrimary }]}>
                {receiverName}
              </Text>
            </View>
            <View style={styles.summaryItemRow}>
              <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Phone</Text>
              <Text style={[styles.summaryItemValue, { color: colors.textPrimary }]}>
                +91 {receiverPhone}
              </Text>
            </View>
          </View>

          {/* Fare breakdown */}
          <View style={styles.fareCard}>
            <Text style={styles.cardLabel}>💳 FARE BREAKDOWN</Text>
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>
                Base fare ({chosenSize?.label})
              </Text>
              <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{sizePrice}</Text>
            </View>
            {expressCharge > 0 && (
              <View style={styles.fareRow}>
                <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>
                  Express surcharge
                </Text>
                <Text style={[styles.fareValue, { color: colors.textPrimary }]}>
                  +₹{expressCharge}
                </Text>
              </View>
            )}
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Platform fee</Text>
              <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{platformFee}</Text>
            </View>
            <View style={[styles.fareRow, styles.fareTotalRow]}>
              <Text style={styles.fareTotalLabel}>Total</Text>
              <Text style={styles.fareTotalValue}>₹{totalFare}</Text>
            </View>
          </View>

          {/* Insurance note */}
          <View style={styles.infoBanner}>
            <Shield size={16} color="#FF6B00" />
            <Text style={styles.infoBannerText}>
              Parcel insured up to ₹2,000. Our rider will pick up and deliver within 2 hours.
            </Text>
          </View>

          <Button
            label={`Book Express · ₹${totalFare}`}
            onPress={handleConfirm}
            style={styles.ctaBtn}
          />
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  heroHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 16,
    gap: 12,
  },

  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#FFD6B3', justifyContent: 'center', alignItems: 'center',
  },

  expressTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0E6', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10, borderWidth: 1, borderColor: '#FFD6B3', marginBottom: 4,
  },
  expressTagText: { fontSize: 10, fontWeight: '800', color: '#FF6B00', letterSpacing: 1 },

  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: '#666', fontWeight: '500', marginTop: 2 },

  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },

  stepProgress: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,107,0,0.3)',
  },
  stepDotActive: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' },
  stepDotDone: { backgroundColor: '#34D399', borderColor: '#34D399' },
  stepNum: { fontSize: 10, fontWeight: '800', color: '#FF6B00' },
  stepNumActive: { color: '#FFFFFF' },
  stepLabel: { fontSize: 9, fontWeight: '600', color: 'rgba(255,107,0,0.6)' },
  stepLabelActive: { color: '#FF6B00' },
  stepLine: { flex: 1, height: 2, backgroundColor: 'rgba(255,107,0,0.2)', marginHorizontal: 6, marginBottom: 14 },
  stepLineDone: { backgroundColor: '#34D399' },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 14 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, elevation: 6,
    gap: 4,
  },
  cardLabel: {
    fontSize: 10, fontWeight: '700', color: '#9CA3AF',
    letterSpacing: 1.2, marginBottom: 8,
  },

  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dotWrap: { width: 24, alignItems: 'center' },
  locationInput: { flex: 1, fontSize: 15, fontWeight: '500', paddingVertical: 10, minHeight: 44 },
  locationDivider: { height: 1, backgroundColor: '#FFE8D6', marginLeft: 34, marginVertical: 2 },

  slotRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: 18, borderWidth: 1.5, borderColor: '#FFE8D6',
    backgroundColor: '#FAFAFA', marginBottom: 8,
  },
  slotRowActive: { borderColor: Colors.primary, backgroundColor: '#FFF7F2' },
  slotLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  slotEmoji: { fontSize: 22 },
  slotTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  slotTitleActive: { color: Colors.primary },
  slotDesc: { fontSize: 12, marginTop: 2 },
  slotRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  surchargeBadge: {
    backgroundColor: '#FFF0E6', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1, borderColor: '#FFD6B3',
  },
  surchargeText: { fontSize: 11, fontWeight: '700', color: '#FF6B00' },
  freeBadge: {
    backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1, borderColor: '#BBF7D0',
  },
  freeText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
  slotCheck: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },

  inputRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
  inputIconWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center',
    marginTop: 6,
  },
  inputField: { fontSize: 15, paddingVertical: 10, paddingHorizontal: 4, minHeight: 44 },
  inputDivider: { height: 1, backgroundColor: '#FFE8D6', marginVertical: 6 },
  inputError: { borderBottomWidth: 1, borderBottomColor: '#EF4444' },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 2, marginLeft: 4 },

  sizeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 18, borderWidth: 1.5, borderColor: '#FFE8D6',
    backgroundColor: '#FAFAFA', marginBottom: 8,
  },
  sizeRowActive: { borderColor: Colors.primary, backgroundColor: '#FFF7F2' },
  sizeEmoji: { fontSize: 24 },
  sizeName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  sizeNameActive: { color: Colors.primary },
  sizeDesc: { fontSize: 12, marginTop: 2 },
  sizePrice: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  sizePriceActive: { color: Colors.primary },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  catCard: {
    minWidth: '29%', flex: 1, alignItems: 'center', gap: 4,
    backgroundColor: '#FAFAFA', borderRadius: 16, padding: 12,
    borderWidth: 1.5, borderColor: '#FFE8D6',
  },
  catCardActive: { borderColor: Colors.primary, backgroundColor: '#FFF7F2' },
  catEmoji: { fontSize: 22 },
  catName: { fontSize: 11, fontWeight: '700', color: '#6B7280', textAlign: 'center' },
  catNameActive: { color: Colors.primary },

  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: 14, borderRadius: 20, backgroundColor: '#FFF0E6',
    borderWidth: 1, borderColor: '#FFD6B3',
  },
  infoBannerText: { flex: 1, fontSize: 13, lineHeight: 19, color: '#7C4A00' },

  ctaBtn: { width: '100%', marginTop: 4 },
  contactPickerBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#FFD6B3',
  },

  summaryCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4, gap: 8,
  },
  summaryLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryLineDivider: { height: 1, backgroundColor: '#FFE8D6', marginLeft: 22, marginVertical: 4 },
  summaryLocationText: { flex: 1, fontSize: 14, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryEmoji: { fontSize: 28 },
  summaryTitle: { fontSize: 15, fontWeight: '700' },
  summarySubtitle: { fontSize: 12, marginTop: 2 },
  summaryItemRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: '#FFF3EC',
  },
  summaryItemLabel: { fontSize: 13 },
  summaryItemValue: { fontSize: 13, fontWeight: '600' },

  fareCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  fareRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 6,
  },
  fareLabel: { fontSize: 13 },
  fareValue: { fontSize: 13, fontWeight: '600' },
  fareTotalRow: {
    borderTopWidth: 1, borderTopColor: '#FFE8D6', marginTop: 4, paddingTop: 12,
  },
  fareTotalLabel: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },
  fareTotalValue: { fontSize: 20, fontWeight: '800', color: Colors.primary },
});
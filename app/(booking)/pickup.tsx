import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Circle, Plus, X, Package, User, Phone, Weight, MessageSquare, ArrowUpDown, AlertCircle, Check } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { AddressText } from '../../components/common/AddressText';
import { useBookingStore } from '../../store/bookingStore';
import { useMapPickerStore } from '../../store/mapPickerStore';
import { useSenderReceiver } from '../../hooks/useSenderReceiver';
import LocationSearchInput from '../../components/booking/LocationSearchInput';
import {
  validateWeight,
} from '../../utils/validators';
import HOME_BG from '../../assets/bg/homeBg';

const FLOOR_OPTIONS = ['Ground Floor', '1st–3rd (Lift)', '1st–3rd (No Lift)', '4th+ (No Lift)'];

export default function PickupScreen() {
  const { colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const { pickup, drop, stops, serviceType, tripMode, moversFlow, setPickup, setDrop, addStop, removeStop, setGoodsDetails } = useBookingStore();
  const { result: mapResult, clearResult } = useMapPickerStore();
  const [pickupText, setPickupText] = useState(pickup?.address ?? '');
  const [dropText, setDropText] = useState(drop?.address ?? '');

  // Read result from map-picker when screen regains focus
  useFocusEffect(
    React.useCallback(() => {
      if (mapResult) {
        if (mapResult.fieldKey === 'pickup') setPickupText(mapResult.address);
        else if (mapResult.fieldKey === 'drop') setDropText(mapResult.address);
        clearResult();
      }
    }, [mapResult])
  );
  const [stopTexts, setStopTexts] = useState<string[]>(stops.map((s) => s.address));

  const [parcelWeight, setParcelWeight] = useState('');
  const [parcelDesc, setParcelDesc] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [notes, setNotes] = useState('');

  // Sender auto-filled from profile + Receiver "Use my details" toggle
  // (Parcel section on this shared screen only — flow/fields for other
  // service types on this page are unchanged.)
  const parcelSR = useSenderReceiver();

  // Packers & Movers (Between Cities)
  const [moversGoodsCategory, setMoversGoodsCategory] = useState('');
  const [moversGoodsWeight, setMoversGoodsWeight] = useState('');
  const [moversGoodsDesc, setMoversGoodsDesc] = useState('');
  const [moversWeightError, setMoversWeightError] = useState('');
  const [moversGoodsCategoryError, setMoversGoodsCategoryError] = useState('');
  const [formError, setFormError] = useState('');

  const isParcelLike = serviceType === 'parcel' || serviceType === 'courier';
  const isHeavyCargo = serviceType === 'heavy_cargo';
  const isPackersMovers = serviceType === 'packers_movers';
  const isMoversBetweenCities = isPackersMovers && moversFlow === 'between_cities';
  const isMoversMiniTruck = isPackersMovers && moversFlow === 'mini_truck';
  const isMoversWithinCity = isPackersMovers && (moversFlow === 'within_city' || !moversFlow);
  // Within-city and between-cities now share the exact same flow: pickup/drop
  // here, then a dedicated "Add Items" screen — no floor/goods fields on this page.
  const isMoversStandard = isMoversWithinCity || isMoversBetweenCities;
  const showFloorSection = false;
  const needsReceiver = isParcelLike;
  const showAddStop = !isParcelLike && !isHeavyCargo && !isPackersMovers;
  // Every flow now collects locations on this screen, including Packers & Movers.
  const showLocationSection = true;

  const heroTitle = isParcelLike
    ? 'Delivery Details'
    : isHeavyCargo
    ? 'Set Locations'
    : isMoversMiniTruck
    ? 'Goods Details'
    : isPackersMovers
    ? 'Move Details'
    : 'Set Locations';

  const heroSubtitle = isParcelLike
    ? 'Fill pickup, drop & parcel info'
    : isHeavyCargo
    ? 'Enter pickup and drop locations'
    : isMoversMiniTruck
    ? "Tell us what you're moving"
    : isPackersMovers
    ? 'Tell us about your move'
    : 'Enter your pickup and drop points';

  const chip1Text = isParcelLike
    ? '📦 Same-day delivery'
    : isHeavyCargo
    ? '🚚 Doorstep loading'
    : isPackersMovers
    ? '🏠 Hassle-free shifting'
    : '🏍️ Fast pickup';

  const continueLabel = isParcelLike
    ? 'Continue · Choose Vehicle'
    : isHeavyCargo
    ? 'Continue · Goods Details'
    : isMoversMiniTruck
    ? 'Continue · Schedule Pickup'
    : isMoversStandard
    ? 'Continue · Add Items'
    : isPackersMovers
    ? 'Find Moving Partner'
    : 'Continue';

  const handleAddStop = () => {
    addStop({ label: `Stop ${stops.length + 1}`, address: '' });
    setStopTexts((prev) => [...prev, '']);
  };

  const handleRemoveStop = (i: number) => {
    removeStop(i);
    setStopTexts((prev) => prev.filter((_, idx) => idx !== i));
  };

  // UX-LOC-007: swap pickup and drop in one tap. Only swaps the two text
  // fields shown in the location card — intermediate stops are left in
  // place since "swap" conventionally refers to start/end only.
  const handleSwapLocations = () => {
    setPickupText(dropText);
    setDropText(pickupText);
  };

  const handleCargoReceiverNameChange = (text: string) => {};
  const handleCargoReceiverPhoneChange = (text: string) => {};
  const handleCargoWeightChange = (text: string) => {};

  const handleMoversWeightChange = (text: string) => {
    setMoversGoodsWeight(text.slice(0, 30));
    if (moversWeightError) setMoversWeightError('');
  };

  // ── Validation on continue ────────────────────────────────────────────────
  const validateAndContinue = (): boolean => {
    let hasError = false;
    setFormError('');

    if (showLocationSection && (pickupText.trim().length <= 2 || dropText.trim().length <= 2)) {
      setFormError('Please enter both pickup and drop locations.');
      hasError = true;
    }

    if (isParcelLike) {
      if (!parcelSR.validateSenderReceiver()) hasError = true;
    }

    if (isMoversMiniTruck) {
      const wRes = validateWeight(moversGoodsWeight);
      if (!wRes.valid) { setMoversWeightError(wRes.error ?? 'Invalid weight'); hasError = true; }
      if (!moversGoodsCategory) {
        setMoversGoodsCategoryError('Please select a goods category.');
        hasError = true;
      } else if (moversGoodsCategoryError) {
        setMoversGoodsCategoryError('');
      }
    }

    return !hasError;
  };

  const moversGoodsValid =
    moversGoodsCategory.trim().length > 0 && validateWeight(moversGoodsWeight).valid;

  const canContinue = isHeavyCargo
    ? pickupText.trim().length > 2 && dropText.trim().length > 2
    : isMoversMiniTruck
    ? pickupText.trim().length > 2 && dropText.trim().length > 2 && moversGoodsValid
    : pickupText.trim().length > 2 &&
      dropText.trim().length > 2 &&
      (!needsReceiver || (parcelSR.isSenderValid && parcelSR.isReceiverValid));

  const handleContinue = () => {
    if (!validateAndContinue()) return;

    if (showLocationSection) {
      setPickup({ label: 'Pickup', address: pickupText });
      setDrop({ label: 'Drop', address: dropText });
    }
    if (isHeavyCargo) {
      router.push('/(booking)/goods-details');
    } else if (isMoversMiniTruck) {
      setGoodsDetails({
        senderName: '',
        senderPhone: '',
        receiverName: '',
        receiverPhone: '',
        category: moversGoodsCategory,
        weight: moversGoodsWeight,
        description: moversGoodsDesc,
      });
      router.push('/(booking)/movers-schedule');
    } else if (isMoversStandard) {
      router.push('/(booking)/movers-items');
    } else if (isPackersMovers) {
      router.push('/(booking)/fare');
    } else if (isParcelLike) {
      setGoodsDetails({
        senderName: parcelSR.senderName,
        senderPhone: parcelSR.senderPhone,
        receiverName: parcelSR.receiverName,
        receiverPhone: parcelSR.receiverPhone,
        category: 'Parcel',
        weight: parcelWeight,
        description: parcelDesc,
      });
      router.push('/(booking)/parcel-vehicle');
    } else {
      router.push('/(booking)/vehicle');
    }
  };

  return (
    <ImageBackground
      source={HOME_BG}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        {/* ── Hero Header ── */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{heroTitle}</Text>
              <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
            </View>
          </View>

          {/* Quick info chips */}
          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{chip1Text}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>📍 Live tracking</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* ── Location Card ── */}
          {showLocationSection && (
          <View style={[styles.card, { zIndex: 20 }]}>
            <Text style={styles.cardLabel}>📍 LOCATIONS</Text>

            <View style={styles.locationFieldsWrap}>
              <LocationSearchInput
                value={pickupText}
                onChangeText={(t) => { setPickupText(t); if (formError) setFormError(''); }}
                onSelect={(t) => { setPickupText(t); if (formError) setFormError(''); }}
                placeholder="Pickup location"
                dotType="circle"
                dotColor={Colors.primary}
                fieldKey="pickup"
              />

              <View style={styles.divider} />

              {stopTexts.map((stopText, i) => (
                <React.Fragment key={i}>
                  <View style={styles.locationRow}>
                    <View style={styles.dotWrap}>
                      <Circle size={12} color={Colors.warning} fill={Colors.warning} />
                    </View>
                    <Input
                      value={stopText}
                      onChangeText={(t) => {
                        const updated = [...stopTexts];
                        updated[i] = t;
                        setStopTexts(updated);
                      }}
                      placeholder={`Stop ${i + 1}`}
                      containerStyle={{ flex: 1 }}
                      maxLength={300}
                    />
                    <TouchableOpacity onPress={() => handleRemoveStop(i)} style={styles.removeBtn}>
                      <X size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.divider} />
                </React.Fragment>
              ))}

              <LocationSearchInput
                value={dropText}
                onChangeText={(t) => { setDropText(t); if (formError) setFormError(''); }}
                onSelect={(t) => { setDropText(t); if (formError) setFormError(''); }}
                placeholder="Drop location"
                dotType="pin"
                dotColor={Colors.danger}
                fieldKey="drop"
              />

              {/* UX-LOC-007: swap pickup/drop — only offered when there are
                  no intermediate stops, since swapping start/end with stops
                  present would be ambiguous about stop ordering. */}
              {stopTexts.length === 0 && (
                <TouchableOpacity
                  style={styles.swapBtn}
                  onPress={handleSwapLocations}
                  accessibilityLabel="Swap pickup and drop locations"
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <ArrowUpDown size={16} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>

            {showAddStop && (
              <TouchableOpacity style={styles.addStopBtn} onPress={handleAddStop}>
                <View style={styles.addStopIcon}>
                  <Plus size={14} color={Colors.primary} />
                </View>
                <Text style={styles.addStopText}>Add Stop</Text>
              </TouchableOpacity>
            )}
          </View>
          )}


          {/* ── Parcel / Courier sections ── */}
          {isParcelLike && (
            <>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>📤 SENDER DETAILS</Text>

                <View style={styles.logisticsRow}>
                  <View style={styles.logisticsIconWrap}>
                    <User size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[styles.logisticsInput, { color: colors.textPrimary }, parcelSR.senderNameError ? styles.inputError : null]}
                      value={parcelSR.senderName}
                      onChangeText={parcelSR.onSenderNameChange}
                      placeholder="Sender's name"
                      placeholderTextColor={colors.placeholder}
                      maxLength={60}
                    />
                    {parcelSR.senderNameError ? <Text style={styles.errorText}>{parcelSR.senderNameError}</Text> : null}
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.logisticsRow}>
                  <View style={styles.logisticsIconWrap}>
                    <Phone size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[styles.logisticsInput, { color: colors.textPrimary }, parcelSR.senderPhoneError ? styles.inputError : null]}
                      value={parcelSR.senderPhone}
                      onChangeText={parcelSR.onSenderPhoneChange}
                      placeholder="Sender's phone number"
                      placeholderTextColor={colors.placeholder}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                    {parcelSR.senderPhoneError ? <Text style={styles.errorText}>{parcelSR.senderPhoneError}</Text> : null}
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>👤 RECEIVER DETAILS</Text>

                <TouchableOpacity
                  style={styles.sameAsSenderRow}
                  onPress={parcelSR.toggleSameAsSender}
                  activeOpacity={0.7}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: parcelSR.sameAsSender }}
                >
                  <View style={[styles.checkbox, parcelSR.sameAsSender && styles.checkboxActive]}>
                    {parcelSR.sameAsSender ? <Check size={12} color="#fff" /> : null}
                  </View>
                  <Text style={styles.sameAsSenderText}>Use my details (same as sender)</Text>
                </TouchableOpacity>

                <View style={styles.logisticsRow}>
                  <View style={styles.logisticsIconWrap}>
                    <User size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[
                        styles.logisticsInput,
                        { color: colors.textPrimary },
                        parcelSR.receiverNameError ? styles.inputError : null,
                        parcelSR.sameAsSender ? styles.inputDisabled : null,
                      ]}
                      value={parcelSR.receiverName}
                      onChangeText={parcelSR.onReceiverNameChange}
                      placeholder="Receiver's name"
                      placeholderTextColor={colors.placeholder}
                      maxLength={60}
                      editable={!parcelSR.sameAsSender}
                    />
                    {parcelSR.receiverNameError ? <Text style={styles.errorText}>{parcelSR.receiverNameError}</Text> : null}
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.logisticsRow}>
                  <View style={styles.logisticsIconWrap}>
                    <Phone size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[
                        styles.logisticsInput,
                        { color: colors.textPrimary },
                        parcelSR.receiverPhoneError ? styles.inputError : null,
                        parcelSR.sameAsSender ? styles.inputDisabled : null,
                      ]}
                      value={parcelSR.receiverPhone}
                      onChangeText={parcelSR.onReceiverPhoneChange}
                      placeholder="Receiver's phone number"
                      placeholderTextColor={colors.placeholder}
                      keyboardType="phone-pad"
                      maxLength={10}
                      editable={!parcelSR.sameAsSender}
                    />
                    {parcelSR.receiverPhoneError ? <Text style={styles.errorText}>{parcelSR.receiverPhoneError}</Text> : null}
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>📦 PARCEL DETAILS</Text>

                <View style={styles.weightChips}>
                  {['< 1 kg', '1–5 kg', '5–10 kg', '10+ kg'].map((w) => (
                    <TouchableOpacity
                      key={w}
                      style={[styles.weightChip, parcelWeight === w && styles.weightChipActive]}
                      onPress={() => setParcelWeight(w)}
                    >
                      <Text style={[styles.weightChipText, parcelWeight === w && styles.weightChipTextActive]}>
                        {w}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.divider} />

                <View style={styles.logisticsRow}>
                  <View style={styles.logisticsIconWrap}>
                    <Package size={16} color={Colors.primary} />
                  </View>
                  <TextInput
                    style={[styles.logisticsInput, { color: colors.textPrimary, flex: 1 }]}
                    value={parcelDesc}
                    onChangeText={(t) => setParcelDesc(t.slice(0, 300))}
                    placeholder="What are you sending? (optional)"
                    placeholderTextColor={colors.placeholder}
                    multiline
                    maxLength={300}
                  />
                </View>
              </View>

              <View style={styles.infoBanner}>
                <Text style={styles.infoEmoji}>ℹ️</Text>
                <Text style={styles.infoText}>
                  Our delivery partner will pick up and hand-deliver your parcel to the receiver
                </Text>
              </View>
            </>
          )}

          {/* Heavy cargo goods details are collected on the next screen (goods-details.tsx) */}

          {/* ── Packers & Movers: Goods Details (Mini Truck) ── */}
          {isMoversMiniTruck && (
            <>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>📦 GOODS DETAILS</Text>

                <View style={styles.weightChips}>
                  {['Household Items', 'Furniture', 'Electronics', 'Office Setup', 'Other'].map((w) => (
                    <TouchableOpacity
                      key={w}
                      style={[styles.weightChip, moversGoodsCategory === w && styles.weightChipActive]}
                      onPress={() => { setMoversGoodsCategory(w); if (moversGoodsCategoryError) setMoversGoodsCategoryError(''); }}
                    >
                      <Text style={[styles.weightChipText, moversGoodsCategory === w && styles.weightChipTextActive]}>
                        {w}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {moversGoodsCategoryError ? <Text style={styles.errorText}>{moversGoodsCategoryError}</Text> : null}

                <View style={styles.divider} />

                <View style={styles.logisticsRow}>
                  <View style={styles.logisticsIconWrap}>
                    <Weight size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[styles.logisticsInput, { color: colors.textPrimary }, moversWeightError ? styles.inputError : null]}
                      value={moversGoodsWeight}
                      onChangeText={handleMoversWeightChange}
                      placeholder="Approx. weight (e.g. 500 kg)"
                      placeholderTextColor={colors.placeholder}
                      maxLength={30}
                    />
                    {moversWeightError ? <Text style={styles.errorText}>{moversWeightError}</Text> : null}
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.logisticsRow}>
                  <View style={styles.logisticsIconWrap}>
                    <MessageSquare size={16} color={Colors.primary} />
                  </View>
                  <TextInput
                    style={[styles.logisticsInput, { color: colors.textPrimary, flex: 1 }]}
                    value={moversGoodsDesc}
                    onChangeText={(t) => setMoversGoodsDesc(t.slice(0, 300))}
                    placeholder="Describe your goods (optional)"
                    placeholderTextColor={colors.placeholder}
                    multiline
                    maxLength={300}
                  />
                </View>
              </View>

              <View style={styles.infoBanner}>
                <Text style={styles.infoEmoji}>🛡️</Text>
                <Text style={styles.infoText}>
                  Our trained moving team will handle your belongings with care
                </Text>
              </View>
            </>
          )}

          {/* ── Packers & Movers section ── */}
          {showFloorSection && (
            <>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>🏠 FLOOR DETAILS</Text>
                <Text style={[styles.floorHint, { color: colors.textSecondary }]}>Pickup floor</Text>
                <View style={styles.weightChips}>
                  {FLOOR_OPTIONS.map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.weightChip, selectedFloor === f && styles.weightChipActive]}
                      onPress={() => setSelectedFloor(f)}
                    >
                      <Text style={[styles.weightChipText, selectedFloor === f && styles.weightChipTextActive]}>
                        {f}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>📝 NOTES</Text>
                <View style={styles.logisticsRow}>
                  <View style={styles.logisticsIconWrap}>
                    <MessageSquare size={16} color={Colors.primary} />
                  </View>
                  <TextInput
                    style={[styles.logisticsInput, { color: colors.textPrimary, flex: 1 }]}
                    value={notes}
                    onChangeText={(t) => setNotes(t.slice(0, 300))}
                    placeholder="Any special instructions for the team? (optional)"
                    placeholderTextColor={colors.placeholder}
                    multiline
                    maxLength={300}
                  />
                </View>
              </View>

              <View style={styles.infoBanner}>
                <Text style={styles.infoEmoji}>🛡️</Text>
                <Text style={styles.infoText}>
                  Our trained moving team will handle your belongings with care
                </Text>
              </View>
            </>
          )}

          {formError ? (
            <View style={styles.formErrorBanner}>
              <AlertCircle size={15} color={Colors.danger} />
              <Text style={styles.formErrorText}>{formError}</Text>
            </View>
          ) : null}

          <Button
            label={continueLabel}
            onPress={handleContinue}
            style={{ ...styles.continueBtn, ...(!canContinue ? styles.continueBtnLooksDisabled : {}) }}
            textStyle={!canContinue ? styles.continueBtnTextLooksDisabled : undefined}
          />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { flex: 1 },
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
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF6B00',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 14,
    paddingTop: 4,
  },
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
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationRowWrap: { alignItems: 'flex-start', paddingVertical: 4 },
  routeSummaryText: { flex: 1, fontSize: 15, fontWeight: '600', lineHeight: 21 },
  dotWrap: { width: 24, alignItems: 'center' },
  dotWrapTop: { marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginLeft: 34 },
  locationFieldsWrap: { position: 'relative', paddingRight: 44 },
  swapBtn: {
  position: 'absolute',

  right: 0,
  top: 30,

  width: 36,
  height: 36,
  borderRadius: 18,

  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: colors.iconBg,
  borderWidth: 1.5,
  borderColor: colors.iconBorder,

  zIndex: 1000,
  elevation: 20,
},
  removeBtn: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  addStopBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 6, minHeight: 44 },
  addStopIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.iconBg, justifyContent: 'center', alignItems: 'center',
  },
  addStopText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  continueBtn: { width: '100%' },
  continueBtnLooksDisabled: { backgroundColor: colors.border, opacity: 0.8 },
  continueBtnTextLooksDisabled: { color: colors.placeholder },
  logisticsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
  logisticsIconWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.iconBg, justifyContent: 'center', alignItems: 'center',
    marginTop: 6,
  },
  logisticsInput: {
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 4,
    minHeight: 44,
  },
  inputError: {
    borderBottomWidth: 1,
    borderBottomColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 2,
    marginLeft: 4,
  },
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
  formErrorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.danger,
  },
  weightChips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  weightChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weightChipActive: { backgroundColor: colors.iconBg, borderColor: Colors.primary },
  weightChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  weightChipTextActive: { color: Colors.primary },
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
  floorHint: { fontSize: 12, fontWeight: '500', marginBottom: 4 },

  // ── Map placeholder ────────────────────────────────────────────────────
  mapPlaceholder: {
    height: 200,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 0,
  },
  mapPinCenter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.iconBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.iconBorder,
  },
  mapPlaceholderText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.placeholder,
    letterSpacing: 0.3,
  },
  mapPlaceholderSub: {
    fontSize: 12,
    color: colors.border,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
})
;
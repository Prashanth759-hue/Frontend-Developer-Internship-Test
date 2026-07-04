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
import { ArrowLeft, MapPin, Circle, Plus, X, Package, User, Phone, Weight, MessageSquare, ArrowUpDown } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { AddressText } from '../../components/common/AddressText';
import { useBookingStore } from '../../store/bookingStore';
import { useMapPickerStore } from '../../store/mapPickerStore';
import LocationSearchInput from '../../components/booking/LocationSearchInput';
import {
  validateName,
  validatePhone,
  validateAddress,
  validateDescription,
  validateWeight,
  sanitizePhone,
  sanitizeName,
} from '../../utils/validators';

const FLOOR_OPTIONS = ['Ground Floor', '1st–3rd (Lift)', '1st–3rd (No Lift)', '4th+ (No Lift)'];

export default function PickupScreen() {
  const { colors } = useTheme();
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

  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [parcelWeight, setParcelWeight] = useState('');
  const [parcelDesc, setParcelDesc] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [notes, setNotes] = useState('');
  // Errors — parcel
  const [receiverNameError, setReceiverNameError] = useState('');
  const [receiverPhoneError, setReceiverPhoneError] = useState('');

  // Packers & Movers (Between Cities)
  const [moversGoodsCategory, setMoversGoodsCategory] = useState('');
  const [moversGoodsWeight, setMoversGoodsWeight] = useState('');
  const [moversGoodsDesc, setMoversGoodsDesc] = useState('');
  const [moversWeightError, setMoversWeightError] = useState('');

  // Heavy cargo (Truck)
  const [cargoSenderName, setCargoSenderName] = useState('');
  const [cargoSenderPhone, setCargoSenderPhone] = useState('');
  const [cargoReceiverName, setCargoReceiverName] = useState('');
  const [cargoReceiverPhone, setCargoReceiverPhone] = useState('');
  const [cargoCategory, setCargoCategory] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [cargoDesc, setCargoDesc] = useState('');

  // Errors — cargo
  const [cargoSenderNameError, setCargoSenderNameError] = useState('');
  const [cargoSenderPhoneError, setCargoSenderPhoneError] = useState('');
  const [cargoReceiverNameError, setCargoReceiverNameError] = useState('');
  const [cargoReceiverPhoneError, setCargoReceiverPhoneError] = useState('');
  const [cargoWeightError, setCargoWeightError] = useState('');

  const isParcelLike = serviceType === 'parcel' || serviceType === 'courier';
  const isHeavyCargo = serviceType === 'heavy_cargo';
  const isPackersMovers = serviceType === 'packers_movers';
  const isMoversBetweenCities = isPackersMovers && moversFlow === 'between_cities';
  const isMoversMiniTruck = isPackersMovers && moversFlow === 'mini_truck';
  const isMoversWithinCity = isPackersMovers && (moversFlow === 'within_city' || !moversFlow);
  const showFloorSection = isPackersMovers && !isMoversBetweenCities;
  const needsReceiver = isParcelLike;
  const showAddStop = !isParcelLike && !isHeavyCargo && !isPackersMovers;
  const showLocationSection = !(isHeavyCargo && tripMode !== 'within_city') && !isMoversBetweenCities;

  const heroTitle = isParcelLike
    ? 'Delivery Details'
    : isHeavyCargo
    ? 'Goods Details'
    : isMoversBetweenCities
    ? 'Goods Details'
    : isPackersMovers
    ? 'Move Details'
    : 'Set Locations';

  const heroSubtitle = isParcelLike
    ? 'Fill pickup, drop & parcel info'
    : isHeavyCargo
    ? showLocationSection
      ? 'Fill pickup, drop & goods info'
      : 'Sender, receiver & goods info'
    : isMoversBetweenCities
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
    ? 'Find Delivery Partner'
    : isHeavyCargo
    ? tripMode === 'within_city'
      ? 'Continue · Choose Truck'
      : 'Continue'
    : isMoversBetweenCities
    ? 'Find Moving Partner'
    : isMoversWithinCity || isMoversMiniTruck
    ? 'Continue · Choose Vehicle'
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

  // ── Name handlers ─────────────────────────────────────────────────────────
  const handleReceiverNameChange = (text: string) => {
    const cleaned = sanitizeName(text);
    setReceiverName(cleaned);
    if (receiverNameError) setReceiverNameError('');
  };

  const handleCargoSenderNameChange = (text: string) => {
    const cleaned = sanitizeName(text);
    setCargoSenderName(cleaned);
    if (cargoSenderNameError) setCargoSenderNameError('');
  };

  const handleCargoReceiverNameChange = (text: string) => {
    const cleaned = sanitizeName(text);
    setCargoReceiverName(cleaned);
    if (cargoReceiverNameError) setCargoReceiverNameError('');
  };

  // ── Phone handlers ────────────────────────────────────────────────────────
  const handleReceiverPhoneChange = (text: string) => {
    const digits = sanitizePhone(text);
    setReceiverPhone(digits);
    if (receiverPhoneError) setReceiverPhoneError('');
  };

  const handleCargoSenderPhoneChange = (text: string) => {
    const digits = sanitizePhone(text);
    setCargoSenderPhone(digits);
    if (cargoSenderPhoneError) setCargoSenderPhoneError('');
  };

  const handleCargoReceiverPhoneChange = (text: string) => {
    const digits = sanitizePhone(text);
    setCargoReceiverPhone(digits);
    if (cargoReceiverPhoneError) setCargoReceiverPhoneError('');
  };

  // ── Weight handlers ───────────────────────────────────────────────────────
  const handleCargoWeightChange = (text: string) => {
    setCargoWeight(text.slice(0, 30));
    if (cargoWeightError) setCargoWeightError('');
  };

  const handleMoversWeightChange = (text: string) => {
    setMoversGoodsWeight(text.slice(0, 30));
    if (moversWeightError) setMoversWeightError('');
  };

  // ── Validation on continue ────────────────────────────────────────────────
  const validateAndContinue = (): boolean => {
    let hasError = false;

    if (isParcelLike) {
      const nameRes = validateName(receiverName);
      if (!nameRes.valid) { setReceiverNameError(nameRes.error ?? 'Invalid name'); hasError = true; }
      const phoneRes = validatePhone(receiverPhone);
      if (!phoneRes.valid) { setReceiverPhoneError(phoneRes.error ?? 'Invalid phone'); hasError = true; }
    }

    if (isHeavyCargo) {
      const snRes = validateName(cargoSenderName);
      if (!snRes.valid) { setCargoSenderNameError(snRes.error ?? 'Invalid name'); hasError = true; }
      const spRes = validatePhone(cargoSenderPhone);
      if (!spRes.valid) { setCargoSenderPhoneError(spRes.error ?? 'Invalid phone'); hasError = true; }
      const rnRes = validateName(cargoReceiverName);
      if (!rnRes.valid) { setCargoReceiverNameError(rnRes.error ?? 'Invalid name'); hasError = true; }
      const rpRes = validatePhone(cargoReceiverPhone);
      if (!rpRes.valid) { setCargoReceiverPhoneError(rpRes.error ?? 'Invalid phone'); hasError = true; }
      const wRes = validateWeight(cargoWeight);
      if (!wRes.valid) { setCargoWeightError(wRes.error ?? 'Invalid weight'); hasError = true; }
      if (!cargoCategory) { hasError = true; }
    }

    if (isMoversBetweenCities) {
      const wRes = validateWeight(moversGoodsWeight);
      if (!wRes.valid) { setMoversWeightError(wRes.error ?? 'Invalid weight'); hasError = true; }
      if (!moversGoodsCategory) { hasError = true; }
    }

    return !hasError;
  };

  const heavyCargoValid =
    validateName(cargoSenderName).valid &&
    validatePhone(cargoSenderPhone).valid &&
    validateName(cargoReceiverName).valid &&
    validatePhone(cargoReceiverPhone).valid &&
    cargoCategory.trim().length > 0 &&
    validateWeight(cargoWeight).valid;

  const moversGoodsValid =
    moversGoodsCategory.trim().length > 0 && validateWeight(moversGoodsWeight).valid;

  const canContinue = isHeavyCargo
    ? (!showLocationSection || (pickupText.trim().length > 2 && dropText.trim().length > 2)) &&
      heavyCargoValid
    : isMoversBetweenCities
    ? moversGoodsValid
    : pickupText.trim().length > 2 &&
      dropText.trim().length > 2 &&
      (!needsReceiver || (validateName(receiverName).valid && validatePhone(receiverPhone).valid));

  const handleContinue = () => {
    if (!validateAndContinue()) return;

    if (showLocationSection) {
      setPickup({ label: 'Pickup', address: pickupText });
      setDrop({ label: 'Drop', address: dropText });
    }
    if (isHeavyCargo) {
      setGoodsDetails({
        senderName: cargoSenderName,
        senderPhone: cargoSenderPhone,
        receiverName: cargoReceiverName,
        receiverPhone: cargoReceiverPhone,
        category: cargoCategory,
        weight: cargoWeight,
        description: cargoDesc,
      });
      if (tripMode === 'within_city') {
        router.push('/(booking)/truck-vehicle');
      } else {
        router.push('/(booking)/schedule');
      }
    } else if (isMoversBetweenCities) {
      setGoodsDetails({
        senderName: '',
        senderPhone: '',
        receiverName: '',
        receiverPhone: '',
        category: moversGoodsCategory,
        weight: moversGoodsWeight,
        description: moversGoodsDesc,
      });
      router.push('/(booking)/fare');
    } else if (isMoversMiniTruck) {
      router.push('/(booking)/movers-mini-truck-vehicle');
    } else if (isMoversWithinCity) {
      router.push('/(booking)/packers-movers-vehicle');
    } else if (isPackersMovers) {
      router.push('/(booking)/fare');
    } else if (isParcelLike) {
      router.push('/(booking)/fare');
    } else {
      router.push('/(booking)/vehicle');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/home-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
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
                onChangeText={setPickupText}
                onSelect={setPickupText}
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
                onChangeText={setDropText}
                onSelect={setDropText}
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



          {/* ── Route summary for truck flows that already collected the route ── */}
          {isHeavyCargo && !showLocationSection && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>📍 ROUTE</Text>
              <View style={[styles.locationRow, styles.locationRowWrap]}>
                <View style={[styles.dotWrap, styles.dotWrapTop]}>
                  <Circle size={12} color={Colors.primary} fill={Colors.primary} />
                </View>
                <AddressText style={[styles.routeSummaryText, { color: colors.textPrimary }]}>
                  {pickup?.address}
                </AddressText>
              </View>
              <View style={styles.divider} />
              <View style={[styles.locationRow, styles.locationRowWrap]}>
                <View style={[styles.dotWrap, styles.dotWrapTop]}>
                  <MapPin size={14} color={Colors.danger} fill={Colors.danger} />
                </View>
                <AddressText style={[styles.routeSummaryText, { color: colors.textPrimary }]}>
                  {drop?.address}
                </AddressText>
              </View>
            </View>
          )}

          {/* ── Parcel / Courier sections ── */}
          {isParcelLike && (
            <>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>👤 RECEIVER DETAILS</Text>

                <View style={styles.logisticsRow}>
                  <View style={styles.logisticsIconWrap}>
                    <User size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[styles.logisticsInput, { color: colors.textPrimary }, receiverNameError ? styles.inputError : null]}
                      value={receiverName}
                      onChangeText={handleReceiverNameChange}
                      placeholder="Receiver's name"
                      placeholderTextColor={colors.placeholder}
                      maxLength={60}
                    />
                    {receiverNameError ? <Text style={styles.errorText}>{receiverNameError}</Text> : null}
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.logisticsRow}>
                  <View style={styles.logisticsIconWrap}>
                    <Phone size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[styles.logisticsInput, { color: colors.textPrimary }, receiverPhoneError ? styles.inputError : null]}
                      value={receiverPhone}
                      onChangeText={handleReceiverPhoneChange}
                      placeholder="Receiver's phone number"
                      placeholderTextColor={colors.placeholder}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                    {receiverPhoneError ? <Text style={styles.errorText}>{receiverPhoneError}</Text> : null}
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

          {/* ── Truck / Heavy Cargo section ── */}
          {isHeavyCargo && (
            <>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>👤 SENDER DETAILS</Text>

                <View style={styles.logisticsRow}>
                  <View style={styles.logisticsIconWrap}>
                    <User size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[styles.logisticsInput, { color: colors.textPrimary }, cargoSenderNameError ? styles.inputError : null]}
                      value={cargoSenderName}
                      onChangeText={handleCargoSenderNameChange}
                      placeholder="Sender's name"
                      placeholderTextColor={colors.placeholder}
                      maxLength={60}
                    />
                    {cargoSenderNameError ? <Text style={styles.errorText}>{cargoSenderNameError}</Text> : null}
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.logisticsRow}>
                  <View style={styles.logisticsIconWrap}>
                    <Phone size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[styles.logisticsInput, { color: colors.textPrimary }, cargoSenderPhoneError ? styles.inputError : null]}
                      value={cargoSenderPhone}
                      onChangeText={handleCargoSenderPhoneChange}
                      placeholder="Sender's phone number"
                      placeholderTextColor={colors.placeholder}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                    {cargoSenderPhoneError ? <Text style={styles.errorText}>{cargoSenderPhoneError}</Text> : null}
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>📥 RECEIVER DETAILS</Text>

                <View style={styles.logisticsRow}>
                  <View style={styles.logisticsIconWrap}>
                    <User size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[styles.logisticsInput, { color: colors.textPrimary }, cargoReceiverNameError ? styles.inputError : null]}
                      value={cargoReceiverName}
                      onChangeText={handleCargoReceiverNameChange}
                      placeholder="Receiver's name"
                      placeholderTextColor={colors.placeholder}
                      maxLength={60}
                    />
                    {cargoReceiverNameError ? <Text style={styles.errorText}>{cargoReceiverNameError}</Text> : null}
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.logisticsRow}>
                  <View style={styles.logisticsIconWrap}>
                    <Phone size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[styles.logisticsInput, { color: colors.textPrimary }, cargoReceiverPhoneError ? styles.inputError : null]}
                      value={cargoReceiverPhone}
                      onChangeText={handleCargoReceiverPhoneChange}
                      placeholder="Receiver's phone number"
                      placeholderTextColor={colors.placeholder}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                    {cargoReceiverPhoneError ? <Text style={styles.errorText}>{cargoReceiverPhoneError}</Text> : null}
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>📦 GOODS DETAILS</Text>

                <View style={styles.weightChips}>
                  {['Electronics', 'Furniture', 'Machinery', 'Raw Material', 'Other'].map((w) => (
                    <TouchableOpacity
                      key={w}
                      style={[styles.weightChip, cargoCategory === w && styles.weightChipActive]}
                      onPress={() => setCargoCategory(w)}
                    >
                      <Text style={[styles.weightChipText, cargoCategory === w && styles.weightChipTextActive]}>
                        {w}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.divider} />

                <View style={styles.logisticsRow}>
                  <View style={styles.logisticsIconWrap}>
                    <Weight size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[styles.logisticsInput, { color: colors.textPrimary }, cargoWeightError ? styles.inputError : null]}
                      value={cargoWeight}
                      onChangeText={handleCargoWeightChange}
                      placeholder="Approx. weight (e.g. 500 kg)"
                      placeholderTextColor={colors.placeholder}
                      keyboardType="default"
                      maxLength={30}
                    />
                    {cargoWeightError ? <Text style={styles.errorText}>{cargoWeightError}</Text> : null}
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.logisticsRow}>
                  <View style={styles.logisticsIconWrap}>
                    <MessageSquare size={16} color={Colors.primary} />
                  </View>
                  <TextInput
                    style={[styles.logisticsInput, { color: colors.textPrimary, flex: 1 }]}
                    value={cargoDesc}
                    onChangeText={(t) => setCargoDesc(t.slice(0, 300))}
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
            </>
          )}

          {/* ── Packers & Movers: Goods Details (Between Cities) ── */}
          {isMoversBetweenCities && (
            <>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>📦 GOODS DETAILS</Text>

                <View style={styles.weightChips}>
                  {['Household Items', 'Furniture', 'Electronics', 'Office Setup', 'Other'].map((w) => (
                    <TouchableOpacity
                      key={w}
                      style={[styles.weightChip, moversGoodsCategory === w && styles.weightChipActive]}
                      onPress={() => setMoversGoodsCategory(w)}
                    >
                      <Text style={[styles.weightChipText, moversGoodsCategory === w && styles.weightChipTextActive]}>
                        {w}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

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

          <Button
            label={continueLabel}
            onPress={handleContinue}
            disabled={!canContinue}
            style={styles.continueBtn}
          />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { flex: 1 },
  heroHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.18)',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFD6B3',
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
    color: '#666',
    fontWeight: '500',
    marginTop: 2,
  },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FFE8D6',
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
    color: '#9CA3AF',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationRowWrap: { alignItems: 'flex-start', paddingVertical: 4 },
  routeSummaryText: { flex: 1, fontSize: 15, fontWeight: '600', lineHeight: 21 },
  dotWrap: { width: 24, alignItems: 'center' },
  dotWrapTop: { marginTop: 4 },
  divider: { height: 1, backgroundColor: '#FFE8D6', marginLeft: 34 },
  locationFieldsWrap: { position: 'relative' },
  swapBtn: {
    position: 'absolute',
    right: 2,
    top: '50%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0E6',
    borderWidth: 1.5,
    borderColor: '#FFD6B3',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -18 }],
    shadowColor: '#FF6B00',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  removeBtn: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  addStopBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 6, minHeight: 44 },
  addStopIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center',
  },
  addStopText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  continueBtn: { width: '100%' },
  logisticsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
  logisticsIconWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center',
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
    color: '#EF4444',
    marginTop: 2,
    marginLeft: 4,
  },
  weightChips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  weightChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  weightChipActive: { backgroundColor: '#FFF0E6', borderColor: Colors.primary },
  weightChipText: { fontSize: 12, fontWeight: '600', color: '#666' },
  weightChipTextActive: { color: Colors.primary },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 20,
    backgroundColor: '#FFF0E6',
    borderWidth: 1,
    borderColor: '#FFD6B3',
  },
  infoEmoji: { fontSize: 16 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 19, color: '#7C4A00' },
  floorHint: { fontSize: 12, fontWeight: '500', marginBottom: 4 },

  // ── Map placeholder ────────────────────────────────────────────────────
  mapPlaceholder: {
    height: 200,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#FFE8D6',
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
    backgroundColor: '#FFF0E6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD6B3',
  },
  mapPlaceholderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.3,
  },
  mapPlaceholderSub: {
    fontSize: 12,
    color: '#C4C4C4',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
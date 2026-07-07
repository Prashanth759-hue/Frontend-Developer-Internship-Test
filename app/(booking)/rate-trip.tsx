import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ImageBackground, TextInput, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Star, ThumbsUp, MapPin, Clock, CreditCard, CheckCircle,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { useBookingStore } from '../../store/bookingStore';
import { useAuthStore } from '../../store/authStore';
import {
  useTripHistoryStore,
  formatTripDate,
  formatTripTime,
  SERVICE_TYPE_TO_LABEL,
} from '../../store/tripHistoryStore';
import { Button } from '../../components/common/Button';
import { MOCK_DRIVERS } from '../../constants/mockData';
import HOME_BG from '../../assets/bg/homeBg';

const DRIVER = MOCK_DRIVERS[0];

const QUICK_TAGS = [
  'Clean vehicle', 'Polite driver', 'On time', 'Safe driving',
  'Friendly', 'Good route',
];

export default function RateTripScreen() {
  const { colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const {
    resetBooking, estimatedFare, paymentMode, pickup, drop, serviceType, activeBookingId,
  } = useBookingStore();
  const { user } = useAuthStore();
  const addTrip = useTripHistoryStore((s) => s.addTrip);
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fare = estimatedFare > 0 ? estimatedFare : 72;
  const paymentLabel = paymentMode === 'cash' ? 'Cash' : paymentMode === 'wallet' ? 'Vahan Pay' : 'UPI';

  // Estimate trip duration based on mock data
  const tripDuration = '18 mins';
  const tripDistance = '6.2 km';

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const saveTripRecord = (finalRating: number) => {
    if (!user) return;
    const now = new Date();
    addTrip(user.id, {
      id: activeBookingId ?? `TRIP-${now.getTime()}`,
      service: serviceType ? SERVICE_TYPE_TO_LABEL[serviceType] ?? 'Ride' : 'Ride',
      pickup: pickup?.address ?? pickup?.label ?? 'Pickup Location',
      drop: drop?.address ?? drop?.label ?? 'Drop Location',
      date: formatTripDate(now),
      time: formatTripTime(now),
      fare: `₹${fare}`,
      status: 'completed',
      driverName: DRIVER.name ?? null,
      driverPhone: DRIVER.phone ?? null,
      vehicleNumber: DRIVER.vehicleNumber ?? null,
      rating: finalRating > 0 ? finalRating : null,
      distance: tripDistance,
      duration: tripDuration,
    });
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Please rate your trip', 'Tap the stars to leave a rating.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      saveTripRecord(rating);
      resetBooking();
      router.replace('/(main)/home');
    }, 1000);
  };

  const handleSkip = () => {
    saveTripRecord(0);
    resetBooking();
    router.replace('/(main)/home');
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
          <View style={styles.successCircle}>
            <ThumbsUp size={32} color="#FFF" />
          </View>
          <Text style={styles.heroTitle}>Trip Completed!</Text>
          <Text style={styles.heroSubtitle}>Thank you for riding with Vahan360</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Trip Summary */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🧾 TRIP SUMMARY</Text>

            {/* Route */}
            <View style={styles.summaryRoute}>
              <View style={styles.routeRow}>
                <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.routePointLabel}>FROM</Text>
                  <Text style={styles.routeAddress} numberOfLines={1}>
                    {pickup?.address ?? pickup?.label ?? 'Pickup Location'}
                  </Text>
                </View>
              </View>
              <View style={styles.routeConnector} />
              <View style={styles.routeRow}>
                <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.routePointLabel}>TO</Text>
                  <Text style={styles.routeAddress} numberOfLines={1}>
                    {drop?.address ?? drop?.label ?? 'Drop Location'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Trip stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Clock size={14} color="#666" />
                <Text style={styles.statValue}>{tripDuration}</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MapPin size={14} color="#666" />
                <Text style={styles.statValue}>{tripDistance}</Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <CheckCircle size={14} color="#16A34A" />
                <Text style={[styles.statValue, { color: Colors.success }]}>Completed</Text>
                <Text style={styles.statLabel}>Status</Text>
              </View>
            </View>

            {/* Fare breakdown */}
            <View style={styles.fareBlock}>
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>Base Fare</Text>
                <Text style={styles.fareAmt}>₹{Math.round(fare * 0.75)}</Text>
              </View>
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>Distance Charge</Text>
                <Text style={styles.fareAmt}>₹{Math.round(fare * 0.2)}</Text>
              </View>
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>Platform Fee</Text>
                <Text style={styles.fareAmt}>₹{Math.round(fare * 0.05)}</Text>
              </View>
              <View style={styles.fareDivider} />
              <View style={styles.fareRow}>
                <Text style={styles.fareTotalLabel}>Total Paid</Text>
                <Text style={styles.fareTotalValue}>₹{fare}</Text>
              </View>
            </View>

            {/* Payment status */}
            <View style={styles.paymentRow}>
              <CreditCard size={15} color="#16A34A" />
              <Text style={styles.paymentText}>Paid via</Text>
              <View style={styles.payBadge}>
                <Text style={styles.payBadgeText}>{paymentLabel}</Text>
              </View>
              <View style={styles.paidBadge}>
                <CheckCircle size={12} color="#16A34A" />
                <Text style={styles.paidText}>Paid</Text>
              </View>
            </View>
          </View>

          {/* Driver Info */}
          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>{(DRIVER.name ?? 'D').charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>{DRIVER.name ?? 'Driver'}</Text>
              <Text style={styles.driverVehicle}>{DRIVER.vehicleNumber ?? 'KA 01 AB 1234'}</Text>
            </View>
          </View>

          {/* Stars */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>⭐ RATE YOUR TRIP</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                  <Star
                    size={44}
                    color={Colors.primary}
                    fill={star <= rating ? Colors.primary : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingLabel}>
              {rating === 0 ? 'Tap to rate' : rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
            </Text>
          </View>

          {/* Quick tags */}
          {rating >= 4 && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>👍 WHAT WENT WELL?</Text>
              <View style={styles.tagsWrap}>
                {QUICK_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Feedback */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>💬 ADDITIONAL FEEDBACK (OPTIONAL)</Text>
            <TextInput
              style={[styles.feedbackInput, { color: colors.textPrimary }]}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Tell us more about your experience..."
              placeholderTextColor={colors.placeholder ?? '#9CA3AF'}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>

          <Button
            label={t('confirm')}
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submitBtn}
          />

          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  backgroundImage: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  heroHeader: {
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    backgroundColor: colors.surfaceElevated, marginBottom: 16,
    alignItems: 'center', gap: 10,
  },
  successCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#FF6B00',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#FF6B00', shadowOpacity: 0.3, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 14, color: colors.textSecondary, fontWeight: '500', textAlign: 'center' },

  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 14 },

  card: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, elevation: 6, gap: 12,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: colors.placeholder, letterSpacing: 1.2 },

  // Summary route
  summaryRoute: { gap: 4 },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  routePointLabel: { fontSize: 9, fontWeight: '700', color: colors.placeholder, letterSpacing: 0.5 },
  routeAddress: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  routeConnector: { width: 2, height: 10, backgroundColor: colors.cardBorder, marginLeft: 4 },

  // Stats
  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: colors.surfaceElevated, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: colors.divider,
  },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  statLabel: { fontSize: 10, color: colors.placeholder, fontWeight: '500' },
  statDivider: { width: 1, height: 36, backgroundColor: colors.border },

  // Fare
  fareBlock: { gap: 8 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fareLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  fareAmt: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  fareDivider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: 4 },
  fareTotalLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  fareTotalValue: { fontSize: 20, fontWeight: '800', color: Colors.primary },

  // Payment
  paymentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.surfaceElevated, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  paymentText: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
  payBadge: {
    backgroundColor: colors.iconBg, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1, borderColor: colors.iconBorder,
  },
  payBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  paidText: { fontSize: 12, fontWeight: '700', color: Colors.success },

  // Driver card
  driverCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  driverAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  driverAvatarText: { fontSize: 20, fontWeight: '800', color: colors.surface },
  driverName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  driverVehicle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  // Rating
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  ratingLabel: { textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#FF6B00' },

  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.border,
  },
  tagActive: { backgroundColor: colors.iconBg, borderColor: Colors.primary },
  tagText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tagTextActive: { color: Colors.primary },

  feedbackInput: {
    borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 16,
    padding: 12, minHeight: 80, fontSize: 14, lineHeight: 20,
    textAlignVertical: 'top',
  },

  submitBtn: { width: '100%' },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipText: { fontSize: 14, fontWeight: '600', color: colors.placeholder },
})
;
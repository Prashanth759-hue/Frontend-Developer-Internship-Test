import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ImageBackground, TextInput, Alert, ScrollView, Modal, Platform,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Star, ThumbsUp, MapPin, Clock, CreditCard, CheckCircle,
  Download, Flag, LifeBuoy, X, Share2,
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
  type TripRecord,
} from '../../store/tripHistoryStore';
import { Button } from '../../components/common/Button';
import { MOCK_DRIVERS } from '../../constants/mockData';
import HOME_BG from '../../assets/bg/homeBg';

const DRIVER = MOCK_DRIVERS[0];

const QUICK_TAGS = [
  'Clean vehicle', 'Polite driver', 'On time', 'Safe driving',
  'Friendly', 'Good route',
];

// Quick issue chips for THIS specific trip — deliberately different from
// the general ISSUE_CATEGORIES list on the Help screen, since this is a
// fast "flag a problem with this ride" report, not a full support ticket.
const TRIP_ISSUE_TAGS = [
  'Overcharged', 'Rude behaviour', 'Unsafe driving',
  'Took wrong route', 'Vehicle condition', 'Left item behind',
];

export default function RateTripScreen() {
  const { colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const {
    resetBooking, estimatedFare, paymentMode, pickup, drop, serviceType, activeBookingId,
  } = useBookingStore();
  const { user } = useAuthStore();
  const upsertTrip = useTripHistoryStore((s) => s.upsertTrip);
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Quick trip-issue report (separate from the full support-ticket flow)
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

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
    // upsertTrip merges into the "Booked" record created back in
    // searching.tsx (same activeBookingId) rather than adding a second,
    // duplicate entry — so the order simply transitions to Completed.
    const record: TripRecord = {
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
    };
    upsertTrip(user.id, record);
  };

  const tripRefId = activeBookingId ?? `TRIP-${Date.now()}`;

  const buildReceiptHtml = () => `
      <html>
        <body style="font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px; color: #1F2937;">
          <h1 style="color: #FF6B00; margin-bottom: 0;">Vahan360</h1>
          <p style="margin-top: 4px; color: #6B7280;">Trip Receipt</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 16px 0;" />
          <p><strong>Trip ID:</strong> ${tripRefId}</p>
          <p><strong>From:</strong> ${pickup?.address ?? pickup?.label ?? 'Pickup Location'}</p>
          <p><strong>To:</strong> ${drop?.address ?? drop?.label ?? 'Drop Location'}</p>
          <p><strong>Distance:</strong> ${tripDistance} &nbsp;&nbsp; <strong>Duration:</strong> ${tripDuration}</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 16px 0;" />
          <table width="100%" style="font-size: 14px;">
            <tr><td>Base Fare</td><td align="right">₹${Math.round(fare * 0.75)}</td></tr>
            <tr><td>Distance Charge</td><td align="right">₹${Math.round(fare * 0.2)}</td></tr>
            <tr><td>Platform Fee</td><td align="right">₹${Math.round(fare * 0.05)}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 16px 0;" />
          <table width="100%" style="font-size: 18px; font-weight: bold;">
            <tr><td>Total Paid</td><td align="right" style="color: #FF6B00;">₹${fare}</td></tr>
          </table>
          <p style="margin-top: 8px; color: #6B7280;">Payment Mode: ${paymentLabel}</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 16px 0;" />
          <p style="color: #9CA3AF; font-size: 12px;">Thank you for riding with Vahan360!</p>
        </body>
      </html>
    `;

  // Renders the receipt to a temporary PDF file (in the app's cache) and
  // returns its local uri. Shared by both Download and Share below.
  const generateReceiptPdf = async () => {
    const { uri } = await Print.printToFileAsync({ html: buildReceiptHtml() });
    return uri;
  };

  // 1. Download Receipt — actually saves the PDF onto the device, no
  // share sheet. Android: user picks a folder (defaults to Downloads)
  // via the system file picker, and the PDF is written straight into it.
  // iOS sandboxes apps and has no app-writable "Downloads" folder, so the
  // OS's own Save-to-Files sheet is the closest equivalent — Files app
  // then shows it under "On My iPhone" / iCloud Drive.
  const handleDownloadReceipt = async () => {
    try {
      const pdfUri = await generateReceiptPdf();
      const fileName = `Vahan360-Receipt-${tripRefId}.pdf`;

      if (Platform.OS === 'android') {
        const perm = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission needed', 'Choose a folder to save the receipt into.');
          return;
        }
        const base64 = await FileSystem.readAsStringAsync(pdfUri, { encoding: FileSystem.EncodingType.Base64 });
        const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
          perm.directoryUri, fileName, 'application/pdf'
        );
        await FileSystem.writeAsStringAsync(destUri, base64, { encoding: FileSystem.EncodingType.Base64 });
        Alert.alert('Receipt downloaded', 'Saved to the folder you selected.');
      } else {
        // iOS: no silent-download API exists — route through the system
        // sheet's own "Save to Files" action.
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(pdfUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save Receipt',
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert('Receipt ready', `Saved to: ${pdfUri}`);
        }
      }
    } catch {
      Alert.alert('Could not download receipt', 'Please try again.');
    }
  };

  // 1b. Share Trip Details — always opens the native share sheet
  // (WhatsApp, email, etc.), separate from the on-device Download above.
  const handleShareTripDetails = async () => {
    try {
      const pdfUri = await generateReceiptPdf();
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Trip ${tripRefId}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      }
    } catch {
      Alert.alert('Could not share trip details', 'Please try again.');
    }
  };

  // 2. Report Issue — a fast, lightweight "flag a problem with THIS ride"
  // report, answered right here on the page (no navigation away).
  const handleReportIssue = () => {
    setShowReportModal(true);
  };

  const handleSubmitReport = () => {
    if (!reportCategory) {
      Alert.alert('Select an issue', 'Please choose what went wrong.');
      return;
    }
    setReportSubmitting(true);
    setTimeout(() => {
      setReportSubmitting(false);
      setReportSubmitted(true);
    }, 900);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportCategory('');
    setReportDescription('');
    setReportSubmitted(false);
  };

  // 3. Raise Ticket — the full multi-category support-ticket flow on the
  // Help screen, for anything beyond a quick trip-specific flag.
  const handleRaiseTicket = () => {
    router.push({ pathname: '/help', params: { openTicket: '1' } });
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
    <>
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

          {/* Trip Actions */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🎫 TRIP ACTIONS</Text>
            <View style={styles.tripActionsRow}>
              <TouchableOpacity style={styles.tripActionBtn} onPress={handleDownloadReceipt} activeOpacity={0.8}>
                <View style={styles.tripActionIconWrap}>
                  <Download size={18} color={Colors.primary} />
                </View>
                <Text style={styles.tripActionLabel}>Download{'\n'}Receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tripActionBtn} onPress={handleShareTripDetails} activeOpacity={0.8}>
                <View style={styles.tripActionIconWrap}>
                  <Share2 size={18} color={Colors.primary} />
                </View>
                <Text style={styles.tripActionLabel}>Share Trip{'\n'}Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tripActionBtn} onPress={handleReportIssue} activeOpacity={0.8}>
                <View style={styles.tripActionIconWrap}>
                  <Flag size={18} color={Colors.primary} />
                </View>
                <Text style={styles.tripActionLabel}>Report{'\n'}Issue</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tripActionBtn} onPress={handleRaiseTicket} activeOpacity={0.8}>
                <View style={styles.tripActionIconWrap}>
                  <LifeBuoy size={18} color={Colors.primary} />
                </View>
                <Text style={styles.tripActionLabel}>Raise{'\n'}Ticket</Text>
              </TouchableOpacity>
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

    {/* Quick Report Issue modal — trip-specific, separate from the full Raise Ticket flow */}
    <Modal visible={showReportModal} transparent animationType="slide" onRequestClose={closeReportModal}>
      <View style={styles.reportOverlay}>
        <TouchableOpacity style={styles.reportDismiss} onPress={closeReportModal} />
        <View style={styles.reportSheet}>
          {reportSubmitted ? (
            <View style={styles.reportSuccessWrap}>
              <View style={styles.reportSuccessCircle}>
                <CheckCircle size={32} color="#FFF" />
              </View>
              <Text style={styles.reportSuccessTitle}>Thanks, we've got it</Text>
              <Text style={styles.reportSuccessSubtitle}>
                We've logged this issue for trip {tripRefId}. Our team will review it shortly.
              </Text>
              <Button label="Done" onPress={closeReportModal} style={{ width: '100%', marginTop: 8 }} />
            </View>
          ) : (
            <>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>Report an issue</Text>
                <TouchableOpacity onPress={closeReportModal} style={styles.reportCloseBtn}>
                  <X size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.reportSubtitle}>Trip {tripRefId} · What went wrong?</Text>

              <View style={styles.tagsWrap}>
                {TRIP_ISSUE_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tag, reportCategory === tag && styles.tagActive]}
                    onPress={() => setReportCategory(tag)}
                  >
                    <Text style={[styles.tagText, reportCategory === tag && styles.tagTextActive]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={[styles.feedbackInput, { color: colors.textPrimary, marginTop: 14 }]}
                value={reportDescription}
                onChangeText={setReportDescription}
                placeholder="Add a few details (optional)..."
                placeholderTextColor={colors.placeholder ?? '#9CA3AF'}
                multiline
                numberOfLines={3}
                maxLength={200}
              />

              <Button
                label="Submit Report"
                onPress={handleSubmitReport}
                loading={reportSubmitting}
                style={{ width: '100%', marginTop: 14 }}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
    </>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
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

  // Trip actions (Download Receipt / Share / Report / Raise Ticket) — 2x2 grid
  tripActionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tripActionBtn: {
    flexBasis: '47%', flexGrow: 1, alignItems: 'center', gap: 6, paddingVertical: 12,
    borderRadius: 16, backgroundColor: colors.surfaceElevated,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  tripActionIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.iconBg, borderWidth: 1, borderColor: colors.iconBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  tripActionLabel: {
    fontSize: 11, fontWeight: '600', color: colors.textPrimary,
    textAlign: 'center', lineHeight: 14,
  },

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

  // Quick Report Issue modal
  reportOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  reportDismiss: { ...StyleSheet.absoluteFillObject },
  reportSheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, paddingBottom: 32,
  },
  reportHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reportTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  reportCloseBtn: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.cardBorder,
  },
  reportSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4, marginBottom: 16 },
  reportSuccessWrap: { alignItems: 'center', paddingVertical: 12, gap: 8 },
  reportSuccessCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#16A34A',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  reportSuccessTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  reportSuccessSubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 19 },
})
;
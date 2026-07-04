import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ImageBackground, Linking, Alert, Modal, TextInput, Platform,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Phone, Star, Clock, MessageCircle, HelpCircle, FileText, AlertTriangle, Download, Share2, X, CheckCircle } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useComingSoon } from '../components/common/ComingSoonModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { MOCK_ORDERS } from '../constants/mockData';
import { useAuthStore } from '../store/authStore';
import { useTripHistoryStore, getUserTrips } from '../store/tripHistoryStore';
import { Button } from '../components/common/Button';
import HOME_BG from '../assets/bg/homeBg';

// Quick issue chips for a fast "flag a problem with this order" report —
// separate from the full multi-category ticket form on the Help screen.
const TRIP_ISSUE_TAGS = [
  'Overcharged', 'Rude behaviour', 'Unsafe driving',
  'Took wrong route', 'Vehicle condition', 'Left item behind',
];

export default function OrderDetailScreen() {
  const { colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const { show: showComingSoon, modal } = useComingSoon();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Orders can come from the seeded demo data OR from the user's own real
  // trip history (booked / ongoing / completed / cancelled), so look across
  // both — otherwise a real trip's "View Details" would silently 404 into
  // the wrong order.
  const { user } = useAuthStore();
  const realTrips = useTripHistoryStore((s) => getUserTrips(s, user?.id));
  const allOrders = useMemo(() => [...realTrips, ...MOCK_ORDERS], [realTrips]);
  const order = allOrders.find((o) => o.id === id) ?? allOrders[0];

  // Quick trip-issue report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleCallSupport = () => {
    const phone = 'tel:+918001234567';
    Linking.canOpenURL(phone).then((supported) => {
      if (supported) {
        Linking.openURL(phone);
      } else {
        Alert.alert(
          'Call Support',
          'Our support team is available 24/7.\n\nPhone: +91 800 123 4567\n\nYou can also raise a ticket or use Live Chat for instant help.',
          [
            { text: 'Raise a Ticket', onPress: () => router.push({ pathname: '/help', params: { openTicket: '1', orderId: order.id } }) },
            { text: 'OK', style: 'cancel' },
          ]
        );
      }
    });
  };

  const buildReceiptHtml = () => {
    const total = parseInt(order.fare.replace('₹', ''), 10) || 0;
    return `
      <html>
        <body style="font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px; color: #1F2937;">
          <h1 style="color: #FF6B00; margin-bottom: 0;">Vahan360</h1>
          <p style="margin-top: 4px; color: #6B7280;">Trip Receipt</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 16px 0;" />
          <p><strong>Trip Reference:</strong> ${order.id}</p>
          <p><strong>Date:</strong> ${order.date} · ${order.time}</p>
          <p><strong>Service:</strong> ${order.service} &nbsp;&nbsp; <strong>Status:</strong> ${order.status.toUpperCase()}</p>
          <p><strong>Pickup:</strong> ${order.pickup}</p>
          <p><strong>Drop:</strong> ${order.drop}</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 16px 0;" />
          <table width="100%" style="font-size: 14px;">
            <tr><td>Base Fare</td><td align="right">₹${Math.round(total * 0.65)}</td></tr>
            <tr><td>Distance Charge</td><td align="right">₹${Math.round(total * 0.22)}</td></tr>
            <tr><td>Platform Fee</td><td align="right">₹${Math.round(total * 0.05)}</td></tr>
            <tr><td>GST (5%)</td><td align="right">₹${Math.round(total * 0.05)}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 16px 0;" />
          <table width="100%" style="font-size: 18px; font-weight: bold;">
            <tr><td>Total Charged</td><td align="right" style="color: #FF6B00;">${order.fare}</td></tr>
          </table>
          <p style="margin-top: 8px; color: #6B7280;">Payment Method: Cash</p>
          ${order.driverName ? `<p style="color: #6B7280;">Driver: ${order.driverName} &nbsp; Vehicle: ${order.vehicleNumber ?? '—'}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 16px 0;" />
          <p style="color: #9CA3AF; font-size: 12px;">Thank you for riding with Vahan360!</p>
        </body>
      </html>
    `;
  };

  // Renders the receipt to a temporary PDF file and returns its local uri.
  const generateReceiptPdf = async () => {
    const { uri } = await Print.printToFileAsync({ html: buildReceiptHtml() });
    return uri;
  };

  // Download Receipt — actually saves the PDF onto the device (Android:
  // via the system folder picker; iOS: via the OS's own Save-to-Files
  // sheet, since iOS has no app-writable "Downloads" folder).
  const handleDownloadReceipt = async () => {
    try {
      const pdfUri = await generateReceiptPdf();
      const fileName = `Vahan360-Receipt-${order.id}.pdf`;

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
    } catch (e) {
      Alert.alert('Could not download receipt', 'Please try again.');
    }
  };

  // Share Trip Details — always opens the native share sheet, separate
  // from the on-device Download above.
  const handleShareTripDetails = async () => {
    try {
      const pdfUri = await generateReceiptPdf();
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Trip ${order.id}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      }
    } catch (e) {
      Alert.alert('Could not share trip details', 'Please try again.');
    }
  };

  // Report Issue — fast, lightweight modal answered right here on the
  // page, separate from the full Raise a Support Ticket flow below.
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


  return (
    <>
    <ImageBackground
      source={HOME_BG}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        {modal}

        {/* Hero */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Order Details</Text>
              <Text style={styles.heroSubtitle}>{order.id}</Text>
            </View>
            <StatusBadge status={order.status as any} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Route Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📍 ROUTE</Text>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeAddrLabel}>Pickup</Text>
                <Text style={[styles.routeAddr, { color: colors.textPrimary }]}>{order.pickup}</Text>
              </View>
            </View>
            <View style={styles.routeVline} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeAddrLabel}>Drop</Text>
                <Text style={[styles.routeAddr, { color: colors.textPrimary }]}>{order.drop}</Text>
              </View>
            </View>
          </View>

          {/* Trip Summary */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🧾 TRIP SUMMARY</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{order.fare}</Text>
                <Text style={styles.summaryKey}>Total Fare</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{order.distance ?? '—'}</Text>
                <Text style={styles.summaryKey}>Distance</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{order.duration ?? '—'}</Text>
                <Text style={styles.summaryKey}>Duration</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{order.service}</Text>
                <Text style={styles.summaryKey}>Service</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Fare Breakup */}
            <View style={styles.fareBreakup}>
              <View style={styles.fareLineRow}>
                <Text style={styles.fareLineKey}>Base Fare</Text>
                <Text style={styles.fareLineVal}>₹{Math.round(parseInt(order.fare.replace('₹',''), 10) * 0.65)}</Text>
              </View>
              <View style={styles.fareLineRow}>
                <Text style={styles.fareLineKey}>Distance Charge</Text>
                <Text style={styles.fareLineVal}>₹{Math.round(parseInt(order.fare.replace('₹',''), 10) * 0.22)}</Text>
              </View>
              <View style={styles.fareLineRow}>
                <Text style={styles.fareLineKey}>Platform Fee</Text>
                <Text style={styles.fareLineVal}>₹{Math.round(parseInt(order.fare.replace('₹',''), 10) * 0.05)}</Text>
              </View>
              <View style={styles.fareLineRow}>
                <Text style={styles.fareLineKey}>GST (5%)</Text>
                <Text style={styles.fareLineVal}>₹{Math.round(parseInt(order.fare.replace('₹',''), 10) * 0.05)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.fareLineRow}>
                <Text style={styles.fareTotalKey}>Total Charged</Text>
                <Text style={styles.fareTotalVal}>{order.fare}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Trip Reference & Date */}
            <View style={styles.receiptMeta}>
              <View style={styles.receiptMetaRow}>
                <Text style={styles.receiptMetaKey}>Trip Reference</Text>
                <Text style={styles.receiptMetaVal}>{order.id}</Text>
              </View>
              <View style={styles.receiptMetaRow}>
                <Clock size={13} color="#9CA3AF" />
                <Text style={styles.receiptMetaVal}>{order.date} · {order.time}</Text>
              </View>
              <View style={styles.receiptMetaRow}>
                <Text style={styles.receiptMetaKey}>Payment</Text>
                <Text style={styles.receiptMetaVal}>Cash</Text>
              </View>
            </View>
          </View>

          {/* Driver Card (if assigned) */}
          {order.driverName ? (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>👤 DRIVER</Text>
              <View style={styles.driverRow}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarText}>{order.driverName.charAt(0)}</Text>
                </View>
                <View style={styles.driverInfo}>
                  <Text style={[styles.driverName, { color: colors.textPrimary }]}>{order.driverName}</Text>
                  <Text style={styles.vehicleNum}>{order.vehicleNumber ?? '—'}</Text>
                  {order.rating != null && (
                    <View style={styles.ratingRow}>
                      {[1,2,3,4,5].map((s) => (
                        <Star
                          key={s} size={14}
                          color={Colors.primary}
                          fill={s <= order.rating! ? Colors.primary : 'transparent'}
                        />
                      ))}
                      <Text style={styles.ratingNum}>You rated {order.rating}/5</Text>
                    </View>
                  )}
                </View>
                {order.driverPhone && (
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => showComingSoon('Call Driver')}
                  >
                    <Phone size={18} color={Colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : null}

          {/* Help & Support */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🛟 NEED HELP WITH THIS ORDER?</Text>
            <View style={styles.supportGrid}>
              <TouchableOpacity
                style={styles.supportItem}
                onPress={() => showComingSoon('Live Chat')}
                activeOpacity={0.8}
              >
                <View style={styles.supportIconWrap}>
                  <MessageCircle size={22} color={Colors.primary} />
                </View>
                <Text style={styles.supportItemLabel}>Live Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.supportItem}
                onPress={handleCallSupport}
                activeOpacity={0.8}
              >
                <View style={styles.supportIconWrap}>
                  <Phone size={22} color={Colors.primary} />
                </View>
                <Text style={styles.supportItemLabel}>Call Us</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.supportItem}
                onPress={handleReportIssue}
                activeOpacity={0.8}
              >
                <View style={styles.supportIconWrap}>
                  <AlertTriangle size={22} color={Colors.primary} />
                </View>
                <Text style={styles.supportItemLabel}>Report Issue</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.raiseTicketBtn}
              onPress={() => router.push({ pathname: '/help', params: { openTicket: '1', orderId: order.id } })}
              activeOpacity={0.85}
            >
              <FileText size={16} color="#FFFFFF" />
              <Text style={styles.raiseTicketBtnText}>Raise a Support Ticket</Text>
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View style={styles.actionsCol}>
            <Button
              label="Download Receipt"
              onPress={handleDownloadReceipt}
              variant="outline"
              style={styles.actionBtn}
            />

            <Button
              label="Share Trip Details"
              onPress={handleShareTripDetails}
              variant="outline"
              style={styles.actionBtn}
            />

            {order.status === 'completed' && (
              <Button
                label="Book Again"
                onPress={() => {
                  router.push('/(booking)/pickup');
                }}
                style={styles.actionBtn}
              />
            )}

            {order.status === 'cancelled' && (
              <Button
                label="View Refund Status"
                onPress={() =>
                  router.push({
                    pathname: '/refund-status',
                    params: {
                      orderId: order.id,
                      amount: order.fare.replace('₹', ''),
                      status: 'processing',
                      method: 'Original Payment Method',
                    },
                  })
                }
                style={styles.actionBtn}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>

    {/* Quick Report Issue modal — separate from the full Raise a Ticket flow */}
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
                We've logged this issue for order {order.id}. Our team will review it shortly.
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
              <Text style={styles.reportSubtitle}>Order {order.id} · What went wrong?</Text>

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
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: colors.surfaceElevated, marginBottom: 16,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },

  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 14 },

  card: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, elevation: 6, gap: 12,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: colors.placeholder, letterSpacing: 1.2 },

  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  routeDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  routeVline: { width: 2, height: 20, backgroundColor: colors.cardBorder, marginLeft: 5, marginVertical: 2 },
  routeInfo: { flex: 1, gap: 2 },
  routeAddrLabel: { fontSize: 10, color: colors.placeholder, fontWeight: '600', letterSpacing: 0.5 },
  routeAddr: { fontSize: 14, fontWeight: '600', lineHeight: 20 },

  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  summaryItem: {
    width: '47%', backgroundColor: colors.surfaceElevated, borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: colors.cardBorder, alignItems: 'center',
  },
  summaryValue: { fontSize: 18, fontWeight: '800', color: '#FF6B00' },
  summaryKey: { fontSize: 11, color: colors.placeholder, fontWeight: '500', marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.cardBorder },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 13, color: colors.textSecondary },

  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  driverAvatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#FF6B00',
    justifyContent: 'center', alignItems: 'center',
  },
  driverAvatarText: { fontSize: 20, fontWeight: '800', color: colors.surface },
  driverInfo: { flex: 1, gap: 4 },
  driverName: { fontSize: 16, fontWeight: '700' },
  vehicleNum: { fontSize: 12, color: colors.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  ratingNum: { fontSize: 12, color: colors.textSecondary, marginLeft: 4 },
  callBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.iconBg,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.iconBorder,
  },

  actionsCol: { gap: 10 },
  actionBtn: { width: '100%' },

  supportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  supportItem: {
    width: '47%', alignItems: 'center', padding: 14,
    backgroundColor: colors.surfaceElevated, borderRadius: 16,
    borderWidth: 1, borderColor: colors.cardBorder, gap: 8,
  },
  supportIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.iconBg, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.iconBorder,
  },
  supportItemLabel: { fontSize: 12, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  raiseTicketBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FF6B00', borderRadius: 16, paddingVertical: 14,
    marginTop: 4,
  },
  raiseTicketBtnText: { fontSize: 14, fontWeight: '700', color: colors.surface },

  fareBreakup: { gap: 10 },
  fareLineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fareLineKey: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  fareLineVal: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  fareTotalKey: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  fareTotalVal: { fontSize: 16, fontWeight: '800', color: '#FF6B00' },

  receiptMeta: { gap: 8 },
  receiptMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  receiptMetaKey: { fontSize: 13, color: colors.placeholder, fontWeight: '500', minWidth: 100 },
  receiptMetaVal: { fontSize: 13, color: colors.textPrimary, fontWeight: '600', flex: 1 },

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
})
;
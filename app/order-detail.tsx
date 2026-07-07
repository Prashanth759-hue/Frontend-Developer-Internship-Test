import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ImageBackground, Linking, Alert, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Phone, Star, Clock, MessageCircle, HelpCircle, FileText, AlertTriangle, Download } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useComingSoon } from '../components/common/ComingSoonModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { MOCK_ORDERS } from '../constants/mockData';
import { useAuthStore } from '../store/authStore';
import { useTripHistoryStore, getUserTrips } from '../store/tripHistoryStore';
import { Button } from '../components/common/Button';
import HOME_BG from '../assets/bg/homeBg';

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

  const handleDownloadReceipt = async () => {
    const total = parseInt(order.fare.replace('₹', ''), 10) || 0;
    const receiptText =
      `VAHAN360 — TRIP RECEIPT\n` +
      `------------------------------\n` +
      `Trip Reference: ${order.id}\n` +
      `Date: ${order.date} · ${order.time}\n` +
      `Service: ${order.service}\n` +
      `Status: ${order.status.toUpperCase()}\n\n` +
      `Pickup: ${order.pickup}\n` +
      `Drop: ${order.drop}\n\n` +
      `Base Fare: ₹${Math.round(total * 0.65)}\n` +
      `Distance Charge: ₹${Math.round(total * 0.22)}\n` +
      `Platform Fee: ₹${Math.round(total * 0.05)}\n` +
      `GST (5%): ₹${Math.round(total * 0.05)}\n` +
      `------------------------------\n` +
      `Total Charged: ${order.fare}\n\n` +
      `Payment Method: Cash\n` +
      (order.driverName ? `Driver: ${order.driverName}\nVehicle: ${order.vehicleNumber ?? '—'}\n\n` : '\n') +
      `Thank you for riding with Vahan360!`;

    try {
      await Share.share({
        title: `Receipt - ${order.id}`,
        message: receiptText,
      });
    } catch (e) {
      Alert.alert('Could not share receipt', 'Please try again.');
    }
  };

  return (
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
                onPress={() => router.push({ pathname: '/help', params: { openTicket: '1', orderId: order.id } })}
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
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  backgroundImage: { flex: 1 },
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
})
;
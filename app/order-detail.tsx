import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Phone, Star, Clock, MessageCircle, HelpCircle, FileText, AlertTriangle } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useComingSoon } from '../components/common/ComingSoonModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { MOCK_ORDERS } from '../constants/mockData';
import { Button } from '../components/common/Button';

export default function OrderDetailScreen() {
  const { colors } = useTheme();
  const { show: showComingSoon, modal } = useComingSoon();
  const { id } = useLocalSearchParams<{ id: string }>();

  const order = MOCK_ORDERS.find((o) => o.id === id) ?? MOCK_ORDERS[0];

  return (
    <ImageBackground
      source={require('../assets/images/home-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
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

          {/* Support Options */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🎧 SUPPORT & HELP</Text>
            <View style={styles.supportGrid}>
              <TouchableOpacity
                style={styles.supportItem}
                onPress={() => router.push('/help')}
                activeOpacity={0.8}
              >
                <View style={styles.supportIconWrap}>
                  <HelpCircle size={22} color={Colors.primary} />
                </View>
                <Text style={styles.supportItemLabel}>Help Center</Text>
              </TouchableOpacity>

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
                onPress={() => showComingSoon('Call Support')}
                activeOpacity={0.8}
              >
                <View style={styles.supportIconWrap}>
                  <Phone size={22} color={Colors.primary} />
                </View>
                <Text style={styles.supportItemLabel}>Call Us</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.supportItem}
                onPress={() => router.push({ pathname: '/help', params: { openTicket: '1' } })}
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
              onPress={() => router.push({ pathname: '/help', params: { openTicket: '1' } })}
              activeOpacity={0.85}
            >
              <FileText size={16} color="#FFFFFF" />
              <Text style={styles.raiseTicketBtnText}>Raise a Support Ticket</Text>
            </TouchableOpacity>
          </View>

          {/* Actions */}
          {order.status === 'completed' && (
            <View style={styles.actionsCol}>
              <Button
                label="Download Receipt"
                onPress={() => showComingSoon('Download Receipt')}
                variant="outline"
                style={styles.actionBtn}
              />
              <Button
                label="Book Again"
                onPress={() => {
                  router.push('/(booking)/pickup');
                }}
                style={styles.actionBtn}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 16,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#FFD6B3', justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: '#666', fontWeight: '500', marginTop: 2 },

  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 14 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, elevation: 6, gap: 12,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.2 },

  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  routeDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  routeVline: { width: 2, height: 20, backgroundColor: '#FFE8D6', marginLeft: 5, marginVertical: 2 },
  routeInfo: { flex: 1, gap: 2 },
  routeAddrLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '600', letterSpacing: 0.5 },
  routeAddr: { fontSize: 14, fontWeight: '600', lineHeight: 20 },

  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  summaryItem: {
    width: '47%', backgroundColor: '#FFFAF6', borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: '#FFE8D6', alignItems: 'center',
  },
  summaryValue: { fontSize: 18, fontWeight: '800', color: '#FF6B00' },
  summaryKey: { fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#FFE8D6' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 13, color: '#666' },

  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  driverAvatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#FF6B00',
    justifyContent: 'center', alignItems: 'center',
  },
  driverAvatarText: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  driverInfo: { flex: 1, gap: 4 },
  driverName: { fontSize: 16, fontWeight: '700' },
  vehicleNum: { fontSize: 12, color: '#666' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  ratingNum: { fontSize: 12, color: '#666', marginLeft: 4 },
  callBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF0E6',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#FFD6B3',
  },

  actionsCol: { gap: 10 },
  actionBtn: { width: '100%' },

  supportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  supportItem: {
    width: '47%', alignItems: 'center', padding: 14,
    backgroundColor: '#FFFAF6', borderRadius: 16,
    borderWidth: 1, borderColor: '#FFE8D6', gap: 8,
  },
  supportIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#FFD6B3',
  },
  supportItemLabel: { fontSize: 12, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  raiseTicketBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FF6B00', borderRadius: 16, paddingVertical: 14,
    marginTop: 4,
  },
  raiseTicketBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  fareBreakup: { gap: 10 },
  fareLineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fareLineKey: { fontSize: 13, color: '#666', fontWeight: '500' },
  fareLineVal: { fontSize: 13, color: '#1A1A1A', fontWeight: '600' },
  fareTotalKey: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },
  fareTotalVal: { fontSize: 16, fontWeight: '800', color: '#FF6B00' },

  receiptMeta: { gap: 8 },
  receiptMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  receiptMetaKey: { fontSize: 13, color: '#9CA3AF', fontWeight: '500', minWidth: 100 },
  receiptMetaVal: { fontSize: 13, color: '#1A1A1A', fontWeight: '600', flex: 1 },
});

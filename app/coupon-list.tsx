import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ImageBackground, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Tag, Copy, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

interface Coupon {
  code: string;
  benefit: string;
  discount: number;
  expiry: string;
  minOrder: number;
  terms: string[];
  category: string;
  isNew?: boolean;
}

const COUPONS: Coupon[] = [
  {
    code: 'SAVE50',
    benefit: '₹50 off on your ride',
    discount: 50,
    expiry: '30 Jun 2026',
    minOrder: 100,
    category: 'Rides',
    terms: [
      'Valid on all ride categories',
      'Minimum order value ₹100',
      'One-time use per account',
      'Cannot be combined with other offers',
    ],
  },
  {
    code: 'VAHAN10',
    benefit: '₹10 off platform fee',
    discount: 10,
    expiry: '31 Jul 2026',
    minOrder: 50,
    category: 'All Services',
    isNew: true,
    terms: [
      'Applicable on platform fee only',
      'Valid for all service types',
      'Minimum order value ₹50',
      'Valid once per user',
    ],
  },
  {
    code: 'FIRST100',
    benefit: '₹100 off your first booking',
    discount: 100,
    expiry: '31 Dec 2026',
    minOrder: 150,
    category: 'First Booking',
    terms: [
      'Only for first-time bookings',
      'Minimum order value ₹150',
      'Valid for rides and parcels',
      'Non-transferable',
    ],
  },
  {
    code: 'PARCEL20',
    benefit: '20% off on parcel delivery',
    discount: 20,
    expiry: '15 Jul 2026',
    minOrder: 80,
    category: 'Parcel',
    terms: [
      'Valid on parcel & express delivery only',
      'Maximum discount ₹80',
      'Minimum order value ₹80',
      'Valid twice per account',
    ],
  },
];

function CouponCard({
  coupon, onApply, applied,
}: {
  coupon: Coupon;
  onApply: (code: string, discount: number, label: string) => void;
  applied: boolean;
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.couponCard, applied && styles.couponCardApplied]}>
      {/* Top row */}
      <View style={styles.couponTop}>
        <View style={styles.couponLeft}>
          <View style={styles.tagIconWrap}>
            <Tag size={18} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.codeRow}>
              <Text style={styles.couponCode}>{coupon.code}</Text>
              {coupon.isNew && (
                <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>
              )}
              {applied && (
                <View style={styles.appliedBadge}>
                  <CheckCircle size={12} color="#16A34A" />
                  <Text style={styles.appliedBadgeText}>Applied</Text>
                </View>
              )}
            </View>
            <Text style={styles.couponBenefit}>{coupon.benefit}</Text>
            <Text style={styles.couponCategory}>{coupon.category} · Min ₹{coupon.minOrder}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.applyBtn, applied && styles.applyBtnApplied]}
          onPress={() => onApply(coupon.code, coupon.discount, coupon.benefit)}
        >
          <Text style={[styles.applyBtnText, applied && styles.applyBtnTextApplied]}>
            {applied ? 'Remove' : 'Apply'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Expiry */}
      <View style={styles.expiryRow}>
        <Clock size={12} color="#9CA3AF" />
        <Text style={styles.expiryText}>Expires: {coupon.expiry}</Text>
        <TouchableOpacity
          style={styles.termsBtn}
          onPress={() => setExpanded((prev) => !prev)}
        >
          <Text style={styles.termsBtnText}>T&C</Text>
          {expanded ? (
            <ChevronUp size={12} color={Colors.primary} />
          ) : (
            <ChevronDown size={12} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Expanded terms */}
      {expanded && (
        <View style={styles.termsBox}>
          {coupon.terms.map((t, idx) => (
            <View key={idx} style={styles.termRow}>
              <View style={styles.termDot} />
              <Text style={styles.termText}>{t}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function CouponListScreen() {
  const { colors } = useTheme();
  const { currentCode } = useLocalSearchParams<{ currentCode?: string }>();
  const [appliedCode, setAppliedCode] = useState<string | null>(currentCode ?? null);

  const handleApply = (code: string, discount: number, label: string) => {
    if (appliedCode === code) {
      setAppliedCode(null);
      return;
    }
    setAppliedCode(code);
    Alert.alert(
      'Coupon Applied!',
      `${code} applied. You save ${label}.`,
      [
        {
          text: 'Continue',
          onPress: () => router.back(),
        },
      ],
    );
  };

  return (
    <ImageBackground
      source={require('../assets/images/home-bg.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#FF6B00" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Available Coupons</Text>
            <Text style={styles.headerSub}>{COUPONS.length} offers available for you</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {COUPONS.map((coupon) => (
            <CouponCard
              key={coupon.code}
              coupon={coupon}
              onApply={handleApply}
              applied={appliedCode === coupon.code}
            />
          ))}

          <View style={styles.noMoreRow}>
            <Text style={styles.noMoreText}>That's all available coupons for now.</Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF',
    borderWidth: 1, borderColor: '#FFD6B3', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FF6B00' },
  headerSub: { fontSize: 12, color: '#666', marginTop: 2 },

  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },

  couponCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16,
    borderWidth: 1.5, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3, gap: 10,
  },
  couponCardApplied: {
    borderColor: '#16A34A', backgroundColor: '#F0FDF4',
  },

  couponTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  couponLeft: { flex: 1, flexDirection: 'row', gap: 10 },
  tagIconWrap: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#FFD6B3', flexShrink: 0,
  },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  couponCode: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', letterSpacing: 0.5 },
  couponBenefit: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  couponCategory: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },

  newBadge: {
    backgroundColor: '#DCFCE7', paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: { fontSize: 10, fontWeight: '800', color: '#16A34A' },
  appliedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#DCFCE7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
  },
  appliedBadgeText: { fontSize: 10, fontWeight: '800', color: '#16A34A' },

  applyBtn: {
    backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 14, alignSelf: 'flex-start', flexShrink: 0,
  },
  applyBtnApplied: { backgroundColor: '#FEE2E2' },
  applyBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  applyBtnTextApplied: { color: '#EF4444' },

  expiryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 8,
  },
  expiryText: { flex: 1, fontSize: 11, color: '#9CA3AF' },
  termsBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  termsBtnText: { fontSize: 11, fontWeight: '700', color: Colors.primary },

  termsBox: {
    backgroundColor: '#FFFAF7', borderRadius: 12, padding: 12, gap: 6,
    borderWidth: 1, borderColor: '#FFE8D6',
  },
  termRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  termDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: Colors.primary, marginTop: 6, flexShrink: 0,
  },
  termText: { fontSize: 12, color: '#666', lineHeight: 18, flex: 1 },

  noMoreRow: { alignItems: 'center', paddingVertical: 20 },
  noMoreText: { fontSize: 13, color: '#9CA3AF' },
});

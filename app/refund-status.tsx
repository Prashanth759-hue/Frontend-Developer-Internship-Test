import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ImageBackground, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, RefreshCw, Clock, CheckCircle, AlertCircle, Wallet } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import HOME_BG from '../assets/bg/homeBg';

type RefundStatus = 'initiated' | 'processing' | 'completed' | 'failed';



const REFUND_STEPS = [
  { key: 'initiated', label: 'Initiated' },
  { key: 'processing', label: 'Processing' },
  { key: 'completed', label: 'Completed' },
];

function getStepIndex(status: RefundStatus) {
  if (status === 'failed') return 1;
  return REFUND_STEPS.findIndex((s) => s.key === status);
}

export default function RefundStatusScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const STATUS_CONFIG: Record<RefundStatus, {
    label: string; color: string; bgColor: string; icon: any; timeline: string;
  }> = {
    initiated:  { label: 'Refund Initiated',   color: '#D97706',      bgColor: colors.surfaceElevated, icon: Clock,        timeline: 'Expected in 5–7 business days' },
    processing: { label: 'Refund Processing',   color: '#3B82F6',      bgColor: colors.surfaceElevated, icon: RefreshCw,    timeline: 'Expected in 3–5 business days' },
    completed:  { label: 'Refund Completed',    color: Colors.success, bgColor: colors.surfaceElevated, icon: CheckCircle,  timeline: 'Credited to your original payment method' },
    failed:     { label: 'Refund Failed',       color: Colors.danger,  bgColor: colors.surfaceElevated, icon: AlertCircle,  timeline: 'Contact support for assistance' },
  };
  const { orderId, amount, status: rawStatus, method } = useLocalSearchParams<{
    orderId?: string; amount?: string; status?: string; method?: string;
  }>();

  const status: RefundStatus = (rawStatus as RefundStatus) ?? 'processing';
  const displayAmount = parseInt(amount ?? '120', 10);
  const cfg = STATUS_CONFIG[status];
  const stepIdx = getStepIndex(status);
  const Icon = cfg.icon;

  return (
    <ImageBackground
      source={HOME_BG}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#FF6B00" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Refund Status</Text>
            <Text style={styles.headerSub}>{orderId ?? 'ORD-001'}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Status card */}
          <View style={[styles.statusCard, { backgroundColor: cfg.bgColor, borderColor: cfg.color + '40' }]}>
            <View style={[styles.statusIconWrap, { backgroundColor: cfg.bgColor }]}>
              <Icon size={36} color={cfg.color} />
            </View>
            <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
            <Text style={styles.statusTimeline}>{cfg.timeline}</Text>
          </View>

          {/* Amount */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Refund Amount</Text>
            <Text style={[styles.amountValue, { color: cfg.color }]}>
              ₹{displayAmount.toLocaleString('en-IN')}
            </Text>
          </View>

          {/* Progress steps */}
          {status !== 'failed' && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>📋 REFUND PROGRESS</Text>
              <View style={styles.stepsContainer}>
                {REFUND_STEPS.map((step, idx) => {
                  const done = idx < stepIdx;
                  const active = idx === stepIdx;
                  return (
                    <View key={step.key} style={styles.stepRow}>
                      <View style={styles.stepLeft}>
                        <View style={[
                          styles.stepCircle,
                          done && styles.stepCircleDone,
                          active && styles.stepCircleActive,
                        ]}>
                          {done ? (
                            <CheckCircle size={16} color="#FFF" />
                          ) : (
                            <Text style={[styles.stepNum, active && { color: Colors.primary }]}>
                              {idx + 1}
                            </Text>
                          )}
                        </View>
                        {idx < REFUND_STEPS.length - 1 && (
                          <View style={[styles.stepVline, done && styles.stepVlineDone]} />
                        )}
                      </View>
                      <View style={styles.stepInfo}>
                        <Text style={[
                          styles.stepLabel,
                          done && { color: Colors.success },
                          active && { color: Colors.primary },
                        ]}>
                          {step.label}
                        </Text>
                        {active && (
                          <Text style={styles.stepActiveNote}>{cfg.timeline}</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Details */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📄 REFUND DETAILS</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Order ID</Text>
              <Text style={[styles.detailVal, { color: colors.textPrimary }]}>
                {orderId ?? 'ORD-001'}
              </Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Refund Amount</Text>
              <Text style={[styles.detailVal, { color: cfg.color, fontWeight: '800' }]}>
                ₹{displayAmount.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Refund To</Text>
              <View style={styles.methodBadge}>
                <Wallet size={12} color={Colors.primary} />
                <Text style={styles.methodBadgeText}>{method ?? 'Original Payment Method'}</Text>
              </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Expected By</Text>
              <Text style={[styles.detailVal, { color: colors.textPrimary }]}>
                {status === 'completed' ? 'Credited' : '5–7 Business Days'}
              </Text>
            </View>
          </View>

          {/* Help */}
          <TouchableOpacity style={styles.helpBtn} onPress={() => router.push('/help')}>
            <Text style={styles.helpBtnText}>Need help? Contact Support</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  safe: { flex: 1, backgroundColor: 'transparent' },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    backgroundColor: colors.surfaceElevated, marginBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FF6B00' },
  headerSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  content: { paddingHorizontal: 16, paddingBottom: 48, gap: 14 },

  statusCard: {
    borderRadius: 24, padding: 28, alignItems: 'center', gap: 10,
    borderWidth: 1.5,
  },
  statusIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  statusLabel: { fontSize: 22, fontWeight: '800' },
  statusTimeline: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },

  amountCard: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 20, alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: colors.cardBorder,
  },
  amountLabel: { fontSize: 13, color: colors.placeholder, fontWeight: '600' },
  amountValue: { fontSize: 44, fontWeight: '800' },

  card: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 18, gap: 14,
    borderWidth: 1.5, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: colors.placeholder, letterSpacing: 1.2 },

  stepsContainer: { gap: 0 },
  stepRow: { flexDirection: 'row', gap: 14 },
  stepLeft: { alignItems: 'center', width: 32 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.border,
  },
  stepCircleDone: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  stepCircleActive: { backgroundColor: colors.surface, borderColor: Colors.primary },
  stepNum: { fontSize: 13, fontWeight: '700', color: colors.placeholder },
  stepVline: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 4, minHeight: 28 },
  stepVlineDone: { backgroundColor: '#16A34A' },
  stepInfo: { flex: 1, paddingBottom: 20, paddingTop: 4 },
  stepLabel: { fontSize: 15, fontWeight: '700', color: colors.placeholder },
  stepActiveNote: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },

  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailKey: { fontSize: 13, color: colors.placeholder, fontWeight: '500' },
  detailVal: { fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.divider },
  methodBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.iconBg, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1, borderColor: colors.iconBorder,
  },
  methodBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  helpBtn: { alignItems: 'center', paddingVertical: 14 },
  helpBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
})
;

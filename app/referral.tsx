import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ImageBackground, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Copy, Check, Users, Gift, Share2 } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useComingSoon } from '../components/common/ComingSoonModal';

const REFERRAL_CODE = 'RAVI100';
const HOW_IT_WORKS = [
  { step: '1', icon: '📤', title: 'Share your code', desc: 'Send your unique referral code to friends and family.' },
  { step: '2', icon: '📱', title: 'Friend signs up', desc: 'Your friend downloads Vahan360 and registers using your code.' },
  { step: '3', icon: '🎁', title: 'Both earn rewards', desc: 'You get ₹100 and your friend gets ₹50 on their first ride.' },
];

export default function ReferralScreen() {
  const { colors } = useTheme();
  const { show: showComingSoon, modal } = useComingSoon();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('Code Copied!', `Referral code "${REFERRAL_CODE}" copied.`);
  };

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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#FF6B00" />
          </TouchableOpacity>
          <View style={styles.heroCenter}>
            <View style={styles.heroIcon}>
              <Gift size={36} color="#FFF" />
            </View>
            <Text style={styles.heroTitle}>Refer & Earn</Text>
            <Text style={styles.heroSubtitle}>
              Invite friends and earn ₹100 for every successful referral!
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Earnings card */}
          <View style={styles.earningsRow}>
            <View style={styles.earningCard}>
              <Text style={styles.earningValue}>₹0</Text>
              <Text style={styles.earningLabel}>Total Earned</Text>
            </View>
            <View style={styles.earningCard}>
              <Text style={styles.earningValue}>0</Text>
              <Text style={styles.earningLabel}>Friends Referred</Text>
            </View>
            <View style={styles.earningCard}>
              <Text style={styles.earningValue}>₹100</Text>
              <Text style={styles.earningLabel}>Per Referral</Text>
            </View>
          </View>

          {/* Code card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🎟️ YOUR REFERRAL CODE</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{REFERRAL_CODE}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
                {copied
                  ? <Check size={18} color={Colors.primary} />
                  : <Copy size={18} color={Colors.primary} />}
                <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() => showComingSoon('Share Referral')}
              activeOpacity={0.85}
            >
              <Share2 size={18} color="#FFF" />
              <Text style={styles.shareBtnText}>Share with Friends</Text>
            </TouchableOpacity>
          </View>

          {/* How it works */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>ℹ️ HOW IT WORKS</Text>
            {HOW_IT_WORKS.map((item, idx) => (
              <View key={item.step} style={[styles.stepRow, idx < HOW_IT_WORKS.length - 1 && styles.stepRowBorder]}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepEmoji}>{item.icon}</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* T&C note */}
          <Text style={styles.tnc}>
            *Rewards are credited after your friend completes their first ride. Valid for new users only.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#FFD6B3', justifyContent: 'center', alignItems: 'center',
    alignSelf: 'flex-start', marginBottom: 16,
  },
  heroCenter: { alignItems: 'center', gap: 10 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#FF6B00',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#FF6B00', shadowOpacity: 0.3, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: {
    fontSize: 14, color: '#555', fontWeight: '500',
    textAlign: 'center', lineHeight: 20, maxWidth: 280,
  },

  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 14 },

  earningsRow: { flexDirection: 'row', gap: 10 },
  earningCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#FF6B00',
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  earningValue: { fontSize: 20, fontWeight: '800', color: '#FF6B00' },
  earningLabel: { fontSize: 11, color: '#666', marginTop: 3, fontWeight: '500' },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, elevation: 6, gap: 14,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.2 },

  codeBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF0E6', borderRadius: 16, padding: 14,
    borderWidth: 1.5, borderColor: '#FF6B00', borderStyle: 'dashed',
  },
  codeText: { flex: 1, fontSize: 22, fontWeight: '800', color: '#FF6B00', letterSpacing: 2 },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: '#FFD6B3',
  },
  copyBtnText: { fontSize: 13, fontWeight: '700', color: '#FF6B00' },

  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FF6B00', borderRadius: 18, paddingVertical: 14,
  },
  shareBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingBottom: 14 },
  stepRowBorder: { borderBottomWidth: 1, borderBottomColor: '#FFE8D6' },
  stepCircle: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFF0E6',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFD6B3',
  },
  stepEmoji: { fontSize: 20 },
  stepInfo: { flex: 1, gap: 3 },
  stepTitle: { fontSize: 15, fontWeight: '700' },
  stepDesc: { fontSize: 13, lineHeight: 18 },

  tnc: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', lineHeight: 16 },
});

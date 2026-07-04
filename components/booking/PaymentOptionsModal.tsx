import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Check,
  ShieldCheck,
  Wallet,
  Landmark,
  Smartphone,
  CreditCard,
  Banknote,
  Sparkles,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../common/Button';
import type { PaymentMode } from '../../store/bookingStore';

// ── Data ──────────────────────────────────────────────────────────────────

const UPI_PROVIDERS = [
  { id: 'gpay', label: 'Google Pay', image: require('../../assets/images/icon-upi.png') },
  { id: 'phonepe', label: 'PhonePe', image: require('../../assets/images/icon-upi.png') },
  { id: 'supermoney', label: 'super.money', image: require('../../assets/images/icon-upi.png') },
  { id: 'paytm', label: 'Paytm', image: require('../../assets/images/icon-upi.png') },
];

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank'];

type SectionKey = 'wallet' | 'netbanking' | 'upi' | 'cards';

interface PaymentOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  amount: number;
  selected: PaymentMode;
  onSelect: (mode: PaymentMode) => void;
  onContinue: () => void;
  onAddCard?: () => void;
  loading?: boolean;
  walletBalance?: number;
  title?: string;
  /** Payment modes to hide entirely (e.g. hide 'wallet' + 'cash' when the
   *  flow itself is topping up the wallet, since paying wallet-to-wallet
   *  or by cash doesn't make sense there). */
  excludeModes?: PaymentMode[];
}

export default function PaymentOptionsModal({
  visible,
  onClose,
  amount,
  selected,
  onSelect,
  onContinue,
  onAddCard,
  loading = false,
  walletBalance = 0,
  title = 'Payment Options',
  excludeModes = [],
}: PaymentOptionsModalProps) {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const [openSection, setOpenSection] = useState<SectionKey | null>('upi');
  const [selectedUpi, setSelectedUpi] = useState('gpay');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const toggleSection = (key: SectionKey) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const walletInsufficient = walletBalance < amount;

  const handlePickUpi = (id: string) => {
    setSelectedUpi(id);
    onSelect('upi');
  };

  const handlePickBank = (bank: string) => {
    setSelectedBank(bank);
    onSelect('netbanking');
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        {/* ── Header ── */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityLabel="Close payment options">
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.headerLogoWrap}>
              <Text style={styles.headerLogoText}>V</Text>
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{title}</Text>
              <View style={styles.trustedRow}>
                <ShieldCheck size={11} color={Colors.success} />
                <Text style={styles.trustedText}>Vahan Secure Checkout</Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Offer strip ── */}
          <View style={styles.offersRow}>
            <View style={[styles.offerChip, { backgroundColor: colors.iconBg, borderColor: colors.iconBorder }]}>
              <Sparkles size={13} color={Colors.primary} />
              <Text style={styles.offerChipText} numberOfLines={1}>Upto 1.5% savings with Vahan Coins</Text>
            </View>
          </View>

          {/* ── Recommended ── */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>RECOMMENDED</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <PaymentRow
              icon={<Smartphone size={18} color={Colors.primary} />}
              label="UPI · Google Pay"
              active={selected === 'upi' && selectedUpi === 'gpay'}
              onPress={() => handlePickUpi('gpay')}
              colors={colors}
            />
            {!excludeModes.includes('wallet') && (
              <>
                <Divider colors={colors} />
                <PaymentRow
                  icon={<Wallet size={18} color={Colors.primary} />}
                  label="Vahan Pay Wallet"
                  sub={`Balance: ₹${walletBalance}`}
                  active={selected === 'wallet'}
                  onPress={() => onSelect('wallet')}
                  colors={colors}
                />
              </>
            )}
            {!excludeModes.includes('cash') && (
              <>
                <Divider colors={colors} />
                <PaymentRow
                  icon={<Banknote size={18} color={Colors.primary} />}
                  label="Cash"
                  sub="Pay on arrival"
                  active={selected === 'cash'}
                  onPress={() => onSelect('cash')}
                  colors={colors}
                />
              </>
            )}
          </View>

          {/* ── All Payment Options ── */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 20 }]}>
            ALL PAYMENT OPTIONS
          </Text>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder, padding: 0 }]}>
            {/* Wallet */}
            {!excludeModes.includes('wallet') && (
              <>
                <SectionHeader
                  icon={<Wallet size={18} color={Colors.primary} />}
                  label="Wallet"
                  open={openSection === 'wallet'}
                  onPress={() => toggleSection('wallet')}
                  colors={colors}
                />
                {openSection === 'wallet' && (
                  <View style={styles.sectionBody}>
                    <PaymentRow
                      icon={<Wallet size={16} color={Colors.primary} />}
                      label="Vahan Pay"
                      sub={walletInsufficient ? `Insufficient balance · ₹${walletBalance} available` : `Balance: ₹${walletBalance}`}
                      active={selected === 'wallet'}
                      onPress={() => onSelect('wallet')}
                      colors={colors}
                      compact
                      warn={walletInsufficient}
                    />
                  </View>
                )}
                <Divider colors={colors} inset />
              </>
            )}

            {/* Netbanking */}
            <SectionHeader
              icon={<Landmark size={18} color={Colors.primary} />}
              label="Netbanking"
              open={openSection === 'netbanking'}
              onPress={() => toggleSection('netbanking')}
              colors={colors}
            />
            {openSection === 'netbanking' && (
              <View style={styles.sectionBody}>
                {BANKS.map((bank) => (
                  <PaymentRow
                    key={bank}
                    icon={<Landmark size={16} color={Colors.primary} />}
                    label={bank}
                    active={selected === 'netbanking' && selectedBank === bank}
                    onPress={() => handlePickBank(bank)}
                    colors={colors}
                    compact
                  />
                ))}
              </View>
            )}
            <Divider colors={colors} inset />

            {/* UPI */}
            <SectionHeader
              icon={<Smartphone size={18} color={Colors.primary} />}
              label="UPI"
              tag="Upto 1.5% savings"
              open={openSection === 'upi'}
              onPress={() => toggleSection('upi')}
              colors={colors}
            />
            {openSection === 'upi' && (
              <View style={styles.sectionBody}>
                {UPI_PROVIDERS.map((app) => (
                  <PaymentRow
                    key={app.id}
                    image={app.image}
                    label={app.label}
                    active={selected === 'upi' && selectedUpi === app.id}
                    onPress={() => handlePickUpi(app.id)}
                    colors={colors}
                    compact
                  />
                ))}
              </View>
            )}
            <Divider colors={colors} inset />

            {/* Cards */}
            <SectionHeader
              icon={<CreditCard size={18} color={Colors.primary} />}
              label="Cards"
              tag="Upto 1.5% savings on EMI"
              open={openSection === 'cards'}
              onPress={() => toggleSection('cards')}
              colors={colors}
            />
            {openSection === 'cards' && (
              <View style={[styles.sectionBody, { paddingBottom: 14 }]}>
                <PaymentRow
                  icon={<CreditCard size={16} color={Colors.primary} />}
                  label="Debit / Credit Card"
                  sub="Visa, Mastercard, RuPay"
                  active={selected === 'card'}
                  onPress={() => onSelect('card')}
                  colors={colors}
                  compact
                />
                <TouchableOpacity
                  style={[styles.addCardBtn, { borderColor: colors.cardBorder, backgroundColor: colors.inputBackground }]}
                  onPress={onAddCard}
                  accessibilityLabel="Add a new card"
                >
                  <Text style={[styles.addCardText, { color: Colors.primary }]}>+ Add a new card</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* ── Footer ── */}
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.cardBorder }]}>
          <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
            By proceeding, I agree to Vahan's Privacy Notice
          </Text>
          <View style={styles.footerRow}>
            <View>
              <Text style={[styles.footerAmountLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.footerAmount, { color: colors.textPrimary }]}>₹{amount}</Text>
            </View>
            <Button
              label="Continue"
              onPress={onContinue}
              loading={loading}
              style={styles.continueBtn}
              accessibilityLabel={`Continue and pay ₹${amount}`}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ── Subcomponents ───────────────────────────────────────────────────────

function Divider({ colors, inset }: { colors: any; inset?: boolean }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.cardBorder,
        marginLeft: inset ? 16 : 0,
      }}
    />
  );
}

function SectionHeader({
  icon,
  label,
  tag,
  open,
  onPress,
  colors,
}: {
  icon: React.ReactNode;
  label: string;
  tag?: string;
  open: boolean;
  onPress: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityLabel={`${label} payment options`}
      accessibilityState={{ expanded: open }}
    >
      <View style={styles.sectionHeaderLeft}>
        {icon}
        <View>
          <Text style={[styles.sectionHeaderLabel, { color: colors.textPrimary }]}>{label}</Text>
          {tag ? <Text style={styles.sectionHeaderTag}>{tag}</Text> : null}
        </View>
      </View>
      {open ? (
        <ChevronUp size={18} color={colors.textSecondary} />
      ) : (
        <ChevronDown size={18} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
}

function PaymentRow({
  icon,
  image,
  label,
  sub,
  active,
  onPress,
  colors,
  compact,
  warn,
}: {
  icon?: React.ReactNode;
  image?: ImageSourcePropType;
  label: string;
  sub?: string;
  active?: boolean;
  onPress: () => void;
  colors: any;
  compact?: boolean;
  warn?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.paymentRow,
        compact && { paddingVertical: 10, paddingHorizontal: 16 },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityLabel={`Pay with ${label}`}
      accessibilityRole="radio"
      accessibilityState={{ selected: !!active }}
    >
      <View style={styles.paymentRowLeft}>
        {image ? (
          <Image source={image} style={styles.paymentRowImage} />
        ) : (
          <View style={[styles.paymentRowIconWrap, { backgroundColor: colors.iconBg }]}>{icon}</View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.paymentRowLabel, { color: colors.textPrimary }]}>{label}</Text>
          {sub ? (
            <Text style={[styles.paymentRowSub, { color: warn ? Colors.danger : colors.textSecondary }]}>
              {sub}
            </Text>
          ) : null}
        </View>
      </View>
      {active ? (
        <View style={styles.checkBadge}>
          <Check size={13} color="#fff" />
        </View>
      ) : (
        <ChevronRight size={16} color={colors.placeholder} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionHeaderLabel: { fontSize: 14, fontWeight: '700' },
  sectionHeaderTag: { fontSize: 11, fontWeight: '600', color: Colors.success, marginTop: 2 },
  sectionBody: { paddingBottom: 4 },

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  paymentRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  paymentRowIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
  },
  paymentRowImage: { width: 28, height: 28, resizeMode: 'contain' },
  paymentRowLabel: { fontSize: 14, fontWeight: '600' },
  paymentRowSub: { fontSize: 11, marginTop: 2 },
  checkBadge: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },

  addCardBtn: {
    marginHorizontal: 16, marginTop: 8,
    borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 14,
    paddingVertical: 12, alignItems: 'center',
  },
  addCardText: { fontSize: 13, fontWeight: '700' },
});

const makeStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.inputBackground,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  headerLogoWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  headerLogoText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  trustedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  trustedText: { fontSize: 11, fontWeight: '600', color: Colors.success },

  content: { padding: 16, paddingBottom: 24, gap: 4 },

  offersRow: { flexDirection: 'row', marginBottom: 14 },
  offerChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, maxWidth: '100%',
  },
  offerChipText: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },

  card: {
    borderRadius: 18, borderWidth: 1.5, padding: 8,
  },

  footer: {
    borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, gap: 10,
  },
  footerNote: { fontSize: 10, textAlign: 'center' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  footerAmountLabel: { fontSize: 11, fontWeight: '600' },
  footerAmount: { fontSize: 20, fontWeight: '800' },
  continueBtn: { flex: 1, maxWidth: 200 },
  sectionBody: {
    paddingBottom: 4,
  },
  addCardBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },

  addCardText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
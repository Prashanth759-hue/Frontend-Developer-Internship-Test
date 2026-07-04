import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Star, ArrowDownLeft, ArrowUpRight, Zap } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Layout, BorderRadius, Shadow } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useComingSoon } from '../../components/common/ComingSoonModal';
import { MOCK_TRANSACTIONS } from '../../constants/mockData';

export default function WalletScreen() {
  const { colors } = useTheme();
  const { show: showComingSoon, modal } = useComingSoon();

  return (
    <ImageBackground
    source={require('../../assets/images/home-bg.png')}
    style={styles.backgroundImage}
    resizeMode="cover"
  >
    <SafeAreaView style={styles.safe}>
      {modal}

      <FlatList
        data={MOCK_TRANSACTIONS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Hero Header */}
            <View style={styles.heroHeader}>
              <Text style={styles.heroTitle}>Vahan Pay</Text>
              <Text style={styles.heroSubtitle}>
                Fast & secure wallet payments
              </Text>

              {/* Wallet Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>₹0</Text>
                  <Text style={styles.statLabel}>Balance</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Coins</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {MOCK_TRANSACTIONS.length}
                  </Text>
                  <Text style={styles.statLabel}>Transactions</Text>
                </View>
              </View>
            </View>

            {/* Wallet Balance Card */}
            <View style={styles.sectionContainer}>
              <LinearGradient
                colors={['#FF6B00', '#FF8C33']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.balanceCard}
              >
                <View style={styles.balanceTop}>
                  <View>
                    <Text style={styles.balanceLabel}>Total Balance</Text>
                    <Text style={styles.balanceAmount}>₹0.00</Text>
                  </View>

                  <View style={styles.walletIconWrap}>
                    <Zap size={24} color="#FFFFFF" />
                  </View>
                </View>

                <Button
                  label="Add Money"
                  onPress={() => router.push('/add-money')}
                  style={styles.addBtn}
                  variant="secondary"
                />
              </LinearGradient>

              {/* Coins Card */}
              <View style={styles.coinsCard}>
                <View style={styles.coinsIcon}>
                  <Star
                    size={20}
                    color={Colors.warning}
                    fill={Colors.warning}
                  />
                </View>

                <View style={styles.coinsInfo}>
                  <Text style={styles.coinsTitle}>Vahan Coins</Text>
                  <Text style={styles.coinsValue}>
                    0 coins available
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.redeemBtn}
                  onPress={() => showComingSoon('Vahan Coins')}
                >
                  <Text style={styles.redeemText}>Redeem</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.txnTitle}>Transactions</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="No transactions yet"
            subtitle="Your wallet history will appear here."
          />
        }
        renderItem={({ item }) => (
          <View style={styles.txnCard}>
            <View
              style={[
                styles.txnIcon,
                {
                  backgroundColor:
                    item.type === 'credit'
                      ? Colors.successLight
                      : Colors.primaryLight,
                },
              ]}
            >
              {item.type === 'credit' ? (
                <ArrowDownLeft size={18} color={Colors.success} />
              ) : (
                <ArrowUpRight size={18} color={Colors.primary} />
              )}
            </View>

            <View style={styles.txnInfo}>
              <Text style={styles.txnLabel}>{item.label}</Text>
              <Text style={styles.txnDate}>{item.date}</Text>
            </View>

            <Text
              style={[
                styles.txnAmount,
                {
                  color:
                    item.type === 'credit'
                      ? Colors.success
                      : '#111827',
                },
              ]}
            >
              {item.type === 'credit' ? '+' : '-'}
              {item.amount}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },

  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  listContent: {
    paddingBottom: 40,
  },

  heroHeader: {
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 20,

    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,

    overflow: 'hidden',

    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
  },

  heroSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 10,
  },

  statCard: {
    flex: 1,

    backgroundColor: '#FFF',

    borderRadius: 24,

    paddingVertical: 14,

    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#FF6B00',

    shadowColor: '#FF6B00',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF6B00',
  },

  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginTop: 2,
  },

  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },

  balanceCard: {
    borderRadius: 24,

    padding: 20,

    borderWidth: 1,
    borderColor: '#FF6B00',

    shadowColor: '#FF6B00',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  balanceLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },

  balanceAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFF',
  },

  walletIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,

    backgroundColor: 'rgba(255,255,255,0.2)',

    justifyContent: 'center',
    alignItems: 'center',
  },

  addBtn: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
    height: 44,
  },

  coinsCard: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFF',

    borderRadius: 24,

    borderWidth: 1,
    borderColor: '#FF6B00',

    padding: 16,

    marginTop: 16,

    shadowColor: '#FF6B00',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  coinsIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,

    backgroundColor: '#FFF0E6',

    justifyContent: 'center',
    alignItems: 'center',
  },

  coinsInfo: {
    flex: 1,
    marginLeft: 12,
  },

  coinsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },

  coinsValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  redeemBtn: {
    backgroundColor: '#FFF0E6',

    borderRadius: 20,

    borderWidth: 1,
    borderColor: '#FF6B00',

    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  redeemText: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '700',
  },

  txnTitle: {
    marginTop: 24,
    marginBottom: 14,

    fontSize: 22,
    fontWeight: '800',

    color: '#FF6B00',
  },

  txnCard: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFF',

    borderRadius: 24,

    borderWidth: 1,
    borderColor: '#FF6B00',

    padding: 16,

    marginHorizontal: 16,
    marginBottom: 12,

    shadowColor: '#FF6B00',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  txnIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,

    justifyContent: 'center',
    alignItems: 'center',
  },

  txnInfo: {
    flex: 1,
    marginLeft: 12,
  },

  txnLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },

  txnDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },

  txnAmount: {
    fontSize: 18,
    fontWeight: '800',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
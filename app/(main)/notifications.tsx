import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Tag, Wallet, User, CheckCheck } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { MOCK_NOTIFICATIONS } from '../../constants/mockData';

const TYPE_ICON: Record<string, React.ReactNode> = {
  promo:   <Tag size={18} color={Colors.primary} />,
  trip:    <Bell size={18} color="#059669" />,
  wallet:  <Wallet size={18} color="#D97706" />,
  account: <User size={18} color="#7C3AED" />,
};
const TYPE_BG: Record<string, string> = {
  promo:   '#FFF0E6',
  trip:    '#ECFDF5',
  wallet:  '#FFFBEB',
  account: '#F5F3FF',
};

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const [items, setItems] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <ImageBackground
      source={require('../../assets/images/home-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {/* Hero */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Notifications</Text>
              <Text style={styles.heroSubtitle}>
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </Text>
            </View>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
                <CheckCheck size={16} color={Colors.primary} />
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notifCard, !item.read && styles.notifCardUnread]}
              onPress={() => markRead(item.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.notifIcon, { backgroundColor: TYPE_BG[item.type] ?? '#F5F5F5' }]}>
                {TYPE_ICON[item.type] ?? <Bell size={18} color={Colors.primary} />}
              </View>
              <View style={styles.notifBody}>
                <Text style={[styles.notifTitle, { color: colors.textPrimary }]}>
                  {item.title}
                </Text>
                <Text style={[styles.notifText, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.body}
                </Text>
                <Text style={styles.notifTime}>{item.time}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
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
  markAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF0E6',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: '#FFD6B3',
  },
  markAllText: { fontSize: 11, fontWeight: '700', color: '#FF6B00' },

  list: { paddingHorizontal: 16, paddingBottom: 32 },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 20,
    padding: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  notifCardUnread: { borderColor: '#FF6B00', borderWidth: 1.5, backgroundColor: '#FFFAF6' },
  notifIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  notifBody: { flex: 1, gap: 3 },
  notifTitle: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  notifText: { fontSize: 13, lineHeight: 18 },
  notifTime: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  unreadDot: {
    width: 9, height: 9, borderRadius: 5, backgroundColor: '#FF6B00', marginTop: 4,
  },
});

import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Home, ClipboardList, Wallet, User } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Layout, Shadow } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';

interface TabIconProps {
  icon: React.ReactNode;
  label: string;
  focused: boolean;
}

function TabIcon({ icon, label, focused }: TabIconProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
      {focused && <View style={styles.activePill} />}
      {icon}
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? Colors.primary : colors.icon },
          focused && styles.tabLabelActive,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: Layout.bottomNavHeight + (Platform.OS === 'ios' ? 24 : 0),
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: colors.icon,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              icon={<Home size={22} color={focused ? Colors.primary : color} />}
              label="Home"
              focused={focused}
            />
          ),
          // Prevent keyboard Tab key from triggering navigation on web
          tabBarButton: Platform.OS === 'web'
            ? (props) => (
                <View
                  {...(props as any)}
                  // @ts-ignore — tabIndex is valid on web
                  tabIndex={0}
                  onKeyDown={(e: any) => {
                    if (e.key === 'Tab') e.stopPropagation();
                    (props as any).onKeyDown?.(e);
                  }}
                />
              )
            : undefined,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              icon={<ClipboardList size={22} color={focused ? Colors.primary : color} />}
              label="Orders"
              focused={focused}
            />
          ),
          tabBarButton: Platform.OS === 'web'
            ? (props) => (
                <View
                  {...(props as any)}
                  // @ts-ignore
                  tabIndex={0}
                  onKeyDown={(e: any) => {
                    if (e.key === 'Tab') e.stopPropagation();
                    (props as any).onKeyDown?.(e);
                  }}
                />
              )
            : undefined,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              icon={<Wallet size={22} color={focused ? Colors.primary : color} />}
              label="Wallet"
              focused={focused}
            />
          ),
          tabBarButton: Platform.OS === 'web'
            ? (props) => (
                <View
                  {...(props as any)}
                  // @ts-ignore
                  tabIndex={0}
                  onKeyDown={(e: any) => {
                    if (e.key === 'Tab') e.stopPropagation();
                    (props as any).onKeyDown?.(e);
                  }}
                />
              )
            : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              icon={<User size={22} color={focused ? Colors.primary : color} />}
              label="Profile"
              focused={focused}
            />
          ),
          tabBarButton: Platform.OS === 'web'
            ? (props) => (
                <View
                  {...(props as any)}
                  // @ts-ignore
                  tabIndex={0}
                  onKeyDown={(e: any) => {
                    if (e.key === 'Tab') e.stopPropagation();
                    (props as any).onKeyDown?.(e);
                  }}
                />
              )
            : undefined,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="offers"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="saved-addresses"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="payment-methods"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 64,
    minHeight: 56,
    position: 'relative',
  },
  tabItemFocused: {},
  activePill: {
    position: 'absolute',
    top: -8,
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  tabLabel: {
    ...Typography.caption,
    fontSize: 10,
  },
  tabLabelActive: {
    fontFamily: 'Inter_600SemiBold',
  },
});
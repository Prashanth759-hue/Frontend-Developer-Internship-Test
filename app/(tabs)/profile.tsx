import React from "react";
import { useAppStore } from "../../store/appStore";
import { THEMES } from "../../constants/colors";
import { router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";

export default function ProfileScreen() {
  const menuItems = [
    "My Documents",
    "Language",
    "Theme",
    "Safety Centre",
    "Help & Support",
    "Logout",
  ];

  const {
  theme,
  setTheme,
  setIsLoggedIn,
} = useAppStore();

  const colors =
    theme === "dark"
      ? THEMES.dark
      : THEMES.light;
  const styles = createStyles(colors);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
    ]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        {/* Heading */}
        <View style={styles.topBar}>
  <TouchableOpacity
    onPress={() => router.back()}
  >
    <Text style={styles.backButton}>
      ← Back
    </Text>
  </TouchableOpacity>

  <Text
  style={[
    styles.heading,
    {
      color: colors.text,
    },
  ]}
>
    Profile
  </Text>
</View>

        {/* Driver Card */}
        <View
            style={[
              styles.profileCard,
              {
                backgroundColor:
                  colors.card,
              },
            ]}
          >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              H
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>
              Harish
            </Text>

            <Text style={styles.phone}>
              +91 9876543210
            </Text>

            <View style={styles.badgeRow}>
              <View style={styles.kycBadge}>
                <Text
                  style={styles.kycText}
                >
                  ✓ KYC Verified
                </Text>
              </View>

              <View
                style={styles.ratingBadge}
              >
                <Text
                  style={
                    styles.ratingText
                  }
                >
                  ⭐ 4.9
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Card */}
        <View
          style={[
            styles.statsCard,
            {
              backgroundColor:
                colors.card,
            },
          ]}
        >
          <View style={styles.statBox}>
            <Text
              style={styles.statValue}
            >
              Truck
            </Text>

            <Text
              style={styles.statLabel}
            >
              Vehicle
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statBox}>
            <Text
              style={styles.statValue}
            >
              KA-05
            </Text>

            <Text
              style={styles.statLabel}
            >
              Reg
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statBox}>
            <Text
              style={styles.statValue}
            >
              1284
            </Text>

            <Text
              style={styles.statLabel}
            >
              Trips
            </Text>
          </View>
        </View>

        {/* Menu Card */}
        <View
          style={[
            styles.menuCard,
            {
              backgroundColor:
                colors.card,
            },
          ]}
        >
          {menuItems.map(
            (item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuRow,
                  index === menuItems.length - 1 && {
                    borderBottomWidth: 0,
                  },
                ]}
                onPress={() => {
                  if (item === "Theme") {
                    setTheme(
                      theme === "dark"
                        ? "light"
                        : "dark"
                    );
                  }

                  if (item === "Logout") {
                    Alert.alert(
                      "Logout",
                      "Are you sure you want to logout?",
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                        {
                          text: "Logout",
                          style: "destructive",
                          onPress: () => {
                            setIsLoggedIn(false);
                            router.replace("/auth/login");
                          },
                        },
                      ]
                    );
                  }
                }}>
                <Text
                  style={[
                    styles.menuText,
                    item ===
                      "Logout" && {
                      color:
                        "#FF4D4F",
                    },
                  ]}
                >
                  {item}
                </Text>

                <Text
                  style={
                    styles.arrow
                  }
                >
                  ›
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <Text style={styles.version}>
          vahan360 Driver • v3.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    heading: {
      color: colors.text,
      fontSize: 30,
      fontWeight: "700",
      marginTop: 25,
      marginLeft: 25,
    },

    profileCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 22,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
    },

    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },

    avatarText: {
      color: "#FFFFFF",
      fontSize: 30,
      fontWeight: "700",
    },

    profileInfo: {
      marginLeft: 15,
      flex: 1,
    },

    name: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "700",
    },

    phone: {
      color: colors.secondaryText,
      fontSize: 15,
      marginTop: 4,
    },

    badgeRow: {
      flexDirection: "row",
      marginTop: 12,
    },

    kycBadge: {
      backgroundColor: "#0F3D3E",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 18,
    },

    kycText: {
      color: "#22C55E",
      fontWeight: "700",
      fontSize: 13,
    },

    ratingBadge: {
      backgroundColor: "#3B2F14",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 18,
      marginLeft: 8,
    },

    ratingText: {
      color: "#FBBF24",
      fontWeight: "700",
      fontSize: 13,
    },

    statsCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: 18,
      borderRadius: 22,
      paddingVertical: 25,
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
    },

    statBox: {
      alignItems: "center",
      flex: 1,
    },

    statValue: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "700",
    },

    statLabel: {
      color: colors.secondaryText,
      fontSize: 13,
      marginTop: 4,
    },

    divider: {
      width: 1,
      height: 50,
      backgroundColor: colors.border,
    },

    menuCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: 18,
      borderRadius: 22,
      paddingHorizontal: 18,
    },

    menuRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    menuText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
    },

    arrow: {
      color: colors.secondaryText,
      fontSize: 22,
    },

    version: {
      color: colors.secondaryText,
      textAlign: "center",
      marginTop: 20,
      marginBottom: 25,
      fontSize: 13,
    },

    topBar: {
      marginTop: 20,
      marginBottom: 20,
    },

    backButton: {
      fontSize: 18,
      color: colors.primary,
      fontWeight: "600",
      marginBottom: 15,
    },
  });
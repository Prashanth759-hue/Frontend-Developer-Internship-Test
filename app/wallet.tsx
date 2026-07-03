import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useAppStore } from "../store/appStore";
import { THEMES } from "../constants/colors";

export default function WalletScreen() {
    const { theme, setTheme } =
    useAppStore();
  
    const colors =
      theme === "dark"
        ? THEMES.dark
        : THEMES.light;
    const styles = createStyles(colors);
  return (
    <SafeAreaView style={styles.container}>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Text style={styles.backButton}>
            ← Back
          </Text>
        </TouchableOpacity>
      
        <Text style={styles.heading}>
          Wallet
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Available Balance
        </Text>

        <Text style={styles.amount}>
          ₹520
        </Text>

        <TouchableOpacity
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            Withdraw
          </Text>
        </TouchableOpacity>
      </View>
      {/* Today's Earnings */}

      <View style={styles.infoCard}>

        <Text style={styles.infoTitle}>
          Today's Earnings
        </Text>

        <Text style={styles.infoAmount}>
          ₹860
        </Text>

      </View>

      {/* Platform Fee */}

      <View style={styles.infoCard}>

        <Text style={styles.infoTitle}>
          Today's Platform Fee
        </Text>

        <Text style={styles.platformFee}>
          ₹20
        </Text>

        <View style={styles.statusRow}>

          <View style={styles.statusBadge}>

            <Text style={styles.statusText}>
              ✓ Deducted Today
            </Text>

          </View>

        </View>

        <Text style={styles.platformMessage}>
          Platform fee is charged only once per day.
        </Text>

      </View>

      {/* First Ride Benefit */}

      <View style={styles.infoCard}>

        <Text style={styles.infoTitle}>
          First Ride Benefit
        </Text>

        <Text style={styles.platformMessage}>
          If your wallet balance is below ₹20,
          you can still complete your first trip.

          {"\n\n"}

          The ₹20 platform fee will be deducted
          after your first completed trip.
        </Text>

        <View style={styles.firstRideBadge}>

          <Text style={styles.firstRideText}>
            ✓ First Ride Allowed
          </Text>

        </View>

      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },

    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 25,
      marginTop: 30,
      borderWidth: 1,
      borderColor: colors.border,
    },

    label: {
      fontSize: 18,
      color: colors.secondaryText,
    },

    amount: {
      fontSize: 50,
      fontWeight: "700",
      color: colors.primary,
      marginVertical: 20,
    },

    button: {
      backgroundColor: colors.primary,
      padding: 15,
      borderRadius: 15,
      alignItems: "center",
    },

    buttonText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "700",
    },

    topBar: {
      marginTop: 25,
      marginBottom: 25,
    },

    backButton: {
      fontSize: 18,
      color: colors.primary,
      fontWeight: "600",
      marginBottom: 15,
    },

    heading: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.text,
    },

    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 20,
      marginTop: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },

    infoTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.secondaryText,
    },

    infoAmount: {
      marginTop: 10,
      fontSize: 32,
      fontWeight: "700",
      color: "#16A34A",
    },

    platformFee: {
      marginTop: 10,
      fontSize: 30,
      fontWeight: "700",
      color: colors.primary,
    },

    statusRow: {
      flexDirection: "row",
      marginTop: 15,
    },

    statusBadge: {
      backgroundColor: "#DCFCE7",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },

    statusText: {
      color: "#15803D",
      fontWeight: "700",
    },

    platformMessage: {
      marginTop: 15,
      color: colors.secondaryText,
      fontSize: 14,
      lineHeight: 20,
    },

    firstRideBadge: {
      backgroundColor: "#DCFCE7",
      marginTop: 18,
      paddingVertical: 10,
      borderRadius: 14,
      alignItems: "center",
    },

    firstRideText: {
      color: "#15803D",
      fontWeight: "700",
      fontSize: 15,
    },

    rechargeButton: {
      marginTop: 20,
      backgroundColor: colors.primary,
      height: 52,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
    },

    rechargeText: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "700",
    },

    scrollContent: {
      paddingBottom: 40,
    },
  });
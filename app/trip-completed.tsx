import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
   ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useAppStore } from "../store/appStore";
import { THEMES } from "../constants/colors";

export default function TripCompletedScreen() {
    const { theme, setTheme } =
    useAppStore();
  
    const colors =
      theme === "dark"
        ? THEMES.dark
        : THEMES.light;
    const styles = createStyles(colors);
  const [showSuccess, setShowSuccess] = useState(false);
    if (showSuccess) {
    return (
      <SafeAreaView style={styles.successContainer}>

        <View style={styles.successCircle}>
          <Text style={styles.tick}>✓</Text>
        </View>

        <Text style={styles.successTitle}>
          Payment Successful
        </Text>

        <TouchableOpacity
          style={styles.successButton}
          onPress={() =>
            router.replace({
              pathname: "/(tabs)/home",
              params: {
                online: "true",
              },
            })
          }
        >
          <Text style={styles.successButtonText}>
            Back to Dashboard
          </Text>
        </TouchableOpacity>

      </SafeAreaView>
    );
  }


 return (
  <SafeAreaView style={styles.container}>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Success Tick */}
      <View style={styles.successCircle}>
        <Text style={styles.tick}>✓</Text>
      </View>

      {/* Heading */}
      <Text style={styles.title}>
        Trip Completed
      </Text>

      {/* Amount */}
      <Text style={styles.subText}>
        ₹118 credited to Wallet
      </Text>

      {/* Trip Details */}
      <View style={styles.detailsCard}>

        <View style={styles.detailRow}>
          <Text style={styles.label}>
            Distance
          </Text>

          <Text style={styles.value}>
            6.8 km
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.label}>
            Duration
          </Text>

          <Text style={styles.value}>
            21 min
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.label}>
            Trip Fare
          </Text>

          <Text style={styles.value}>
            ₹140
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.label}>
            Platform Fee
          </Text>

          <Text style={styles.fee}>
            -₹22
          </Text>
        </View>

      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowSuccess(true)}
      >
        <Text style={styles.buttonText}>
          Finish Trip
        </Text>
      </TouchableOpacity>

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

    successCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "#DCFCE7",
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      marginTop: 80,
    },

    tick: {
      fontSize: 60,
      color: "#16A34A",
      fontWeight: "700",
    },

    title: {
      fontSize: 34,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
      marginTop: 35,
    },

    amount: {
      fontSize: 58,
      fontWeight: "800",
      color: colors.primary,
      textAlign: "center",
      marginTop: 35,
    },

    subText: {
      fontSize: 18,
      color: colors.secondaryText,
      textAlign: "center",
      marginTop: 10,
    },

    detailsCard: {
      backgroundColor: colors.card,
      marginHorizontal: 25,
      marginTop: 45,
      borderRadius: 25,
      padding: 25,
      borderWidth: 1,
      borderColor: colors.border,
    },

    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 18,
    },

    divider: {
      height: 1,
      backgroundColor: colors.border,
    },

    label: {
      fontSize: 18,
      color: colors.secondaryText,
    },

    value: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },

    fee: {
      fontSize: 20,
      fontWeight: "700",
      color: "#EF4444",
    },

    button: {
      marginHorizontal: 25,
      marginTop: 30,
      marginBottom: 30,
      backgroundColor: colors.primary,
      paddingVertical: 20,
      borderRadius: 22,
      alignItems: "center",
      elevation: 8,
    },

    buttonText: {
      color: "#FFFFFF",
      fontSize: 22,
      fontWeight: "700",
    },

    scrollContent: {
      paddingBottom: 120,
    },

    successContainer: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      padding: 25,
    },

    successTitle: {
      fontSize: 34,
      fontWeight: "700",
      marginTop: 35,
      color: colors.text,
    },

    successSub: {
      fontSize: 18,
      color: colors.secondaryText,
      marginTop: 20,
      textAlign: "center",
      lineHeight: 28,
    },

    successButton: {
      marginTop: 50,
      backgroundColor: colors.primary,
      paddingVertical: 18,
      paddingHorizontal: 40,
      borderRadius: 18,
      width: "100%",
      alignItems: "center",
    },

    successButtonText: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "700",
    },
  });
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useAppStore } from "../store/appStore";
import { THEMES } from "../constants/colors";

export default function IncentiveScreen() {
    const { theme, setTheme } =
    useAppStore();
  
    const colors =
      theme === "dark"
        ? THEMES.dark
        : THEMES.light;
    const styles = createStyles(colors);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
  <TouchableOpacity
    onPress={() => router.back()}
  >
    <Text style={styles.backButton}>
      ← Back
    </Text>
  </TouchableOpacity>

  <Text style={styles.heading}>
    Bonus & Incentive
  </Text>
</View>

      <View style={styles.card}>
        <Text style={styles.title}>
          Weekly Target
        </Text>

        <Text style={styles.amount}>
          ₹120
        </Text>

        <Text style={styles.text}>
          Complete 2 more trips
        </Text>
      </View>

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
      padding: 25,
      borderRadius: 20,
      marginTop: 30,
      borderWidth: 1,
      borderColor: colors.border,
    },

    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },

    amount: {
      fontSize: 50,
      color: colors.primary,
      fontWeight: "700",
      marginVertical: 15,
    },

    text: {
      fontSize: 18,
      color: colors.secondaryText,
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
  });
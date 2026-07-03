import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function UnderReviewScreen() {

  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
      >

        {/* Top Icon */}

        <View style={styles.iconContainer}>

          <View style={styles.iconCircle}>

            <Text style={styles.icon}>
              ⏳
            </Text>

          </View>

        </View>

        {/* Heading */}

        <Text style={styles.title}>
          Documents Submitted
        </Text>

        <Text style={styles.subTitle}>
          Your KYC is Under Review
        </Text>

        <Text style={styles.description}>
          Your documents have been
          submitted successfully.

          {"\n\n"}

          Our verification team is
          reviewing your information.

        </Text>

    {/* Information Card */}
    <View style={styles.infoCard}>

    <Text style={styles.infoTitle}>
        Verification in Progress
    </Text>

    <Text style={styles.infoText}>
        You can explore the app while your
        KYC is under review.
    </Text>

    <Text style={styles.infoText}>
        Trip acceptance will be available
        after your KYC is approved.
    </Text>

    </View>

</ScrollView>

</SafeAreaView>

);
}

const styles = StyleSheet.create({

container: {
  flex: 1,
  backgroundColor: "#FFFFFF",
},

iconContainer: {
  alignItems: "center",
  marginTop: 40,
},

iconCircle: {
  width: 110,
  height: 110,
  borderRadius: 55,
  backgroundColor: "#FFF4E8",
  justifyContent: "center",
  alignItems: "center",
},

icon: {
  fontSize: 52,
},

title: {
  marginTop: 28,
  textAlign: "center",
  fontSize: 28,
  fontWeight: "700",
  color: "#111827",
},

subTitle: {
  marginTop: 8,
  textAlign: "center",
  fontSize: 20,
  fontWeight: "600",
  color: "#FF7A00",
},

description: {
  marginTop: 18,
  textAlign: "center",
  color: "#6B7280",
  fontSize: 15,
  lineHeight: 25,
  paddingHorizontal: 28,
},

timeCard: {
  marginTop: 30,
  marginHorizontal: 22,
  backgroundColor: "#FFF7ED",
  borderRadius: 18,
  padding: 20,
  alignItems: "center",
},

infoTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#FF7A00",
},


time: {
  marginTop: 10,
  fontSize: 30,
  fontWeight: "700",
  color: "#FF7A00",
},

infoCard: {
  marginHorizontal: 22,
  marginTop: 28,
  backgroundColor: "#FFF7ED",
  borderRadius: 18,
  padding: 22,
  alignItems: "center",
},

infoText: {
  textAlign: "center",
  fontSize: 15,
  color: "#4B5563",
  lineHeight: 24,
  marginBottom: 10,
  marginTop: 10,
},

});
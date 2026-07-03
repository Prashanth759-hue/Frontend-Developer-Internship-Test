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

export default function RejectedScreen() {

  return (

    <SafeAreaView
      style={styles.container}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
      >

        {/* Top Icon */}

        <View style={styles.iconContainer}>

          <View style={styles.iconCircle}>

            <Text style={styles.icon}>
              ❌
            </Text>

          </View>

        </View>

        {/* Heading */}

        <Text style={styles.title}>
          KYC Rejected
        </Text>

        <Text style={styles.subTitle}>
          Verification Failed
        </Text>

        <Text style={styles.description}>
          We couldn't verify your KYC
          documents.

          {"\n\n"}

          Please review the reason below
          and upload the correct document.

        </Text>

        {/* Reason Card */}
        <View style={styles.reasonCard}>

  <Text style={styles.reasonTitle}>
    Reason for Rejection
  </Text>

  <View style={styles.reasonBox}>

    <Text style={styles.reasonLabel}>
      Document
    </Text>

    <Text style={styles.reasonValue}>
      Driving Licence
    </Text>

    <View style={styles.divider} />

    <Text style={styles.reasonLabel}>
      Reason
    </Text>

    <Text style={styles.reasonValue}>
      Driving Licence details do not match your Aadhaar information.
    </Text>

  </View>

</View>

{/* Note */}

<View style={styles.noteCard}>

  <Text style={styles.noteTitle}>
    What should you do?
  </Text>

  <Text style={styles.noteText}>
    Please upload the correct Driving Licence
    to continue with your KYC verification.
  </Text>

</View>

{/* Re-upload Button */}
<TouchableOpacity
  style={styles.reuploadButton}
  onPress={() =>
    router.replace("/kyc/vehicle")
  }
>
  <Text style={styles.reuploadText}>
    Re-upload Document
  </Text>
</TouchableOpacity>

<View style={{ height: 35 }} />

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
marginTop: 45,
},

iconCircle: {
width: 110,
height: 110,
borderRadius: 55,
backgroundColor: "#FEE2E2",
justifyContent: "center",
alignItems: "center",
},

icon: {
fontSize: 52,
},

title: {
marginTop: 28,
textAlign: "center",
fontSize: 30,
fontWeight: "700",
color: "#111827",
},

subTitle: {
marginTop: 8,
textAlign: "center",
fontSize: 20,
fontWeight: "600",
color: "#DC2626",
},

description: {
marginTop: 18,
paddingHorizontal: 28,
textAlign: "center",
fontSize: 15,
lineHeight: 24,
color: "#6B7280",
},

reasonCard: {
marginHorizontal: 22,
marginTop: 30,
backgroundColor: "#FFFFFF",
borderRadius: 18,
padding: 20,
elevation: 2,
shadowColor: "#000",
shadowOpacity: 0.05,
shadowRadius: 10,
},

reasonTitle: {
fontSize: 20,
fontWeight: "700",
color: "#111827",
marginBottom: 18,
},

reasonBox: {
backgroundColor: "#FFF7ED",
borderRadius: 14,
padding: 18,
},

reasonLabel: {
fontSize: 13,
fontWeight: "600",
color: "#6B7280",
},

reasonValue: {
marginTop: 5,
fontSize: 16,
fontWeight: "600",
color: "#111827",
lineHeight: 24,
},

divider: {
height: 1,
backgroundColor: "#E5E7EB",
marginVertical: 16,
},

noteCard: {
marginHorizontal: 22,
marginTop: 22,
backgroundColor: "#F9FAFB",
borderRadius: 18,
padding: 20,
},

noteTitle: {
fontSize: 18,
fontWeight: "700",
color: "#111827",
marginBottom: 12,
},

noteText: {
fontSize: 15,
lineHeight: 24,
color: "#4B5563",
},

reuploadButton: {
marginHorizontal: 22,
marginTop: 35,
height: 58,
borderRadius: 16,
backgroundColor: "#FF7A00",
justifyContent: "center",
alignItems: "center",
},

reuploadText: {
fontSize: 18,
fontWeight: "700",
color: "#FFFFFF",
},

});
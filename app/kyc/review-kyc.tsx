import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function SubmitKYC() {

  const [confirmed, setConfirmed] = useState(false);

  return (

    <SafeAreaView
      style={styles.container}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}

        <View style={styles.header}>

          <Text style={styles.title}>
            Submit KYC
          </Text>

          <Text style={styles.subtitle}>
            You're almost there!
          </Text>

          <Text style={styles.description}>
            Please review your submitted
            information before completing
            your KYC verification.
          </Text>

        </View>

        {/* Progress Card */}

        <View style={styles.progressCard}>

          <View style={styles.progressTop}>

            <Text style={styles.progressTitle}>
              KYC Completion
            </Text>

            <Text style={styles.progressPercent}>
              100%
            </Text>

          </View>

          <View style={styles.progressBackground}>

            <View
              style={styles.progressFill}
            />

          </View>

        </View>

        {/* Checklist Starts Here */}

        {/* Aadhaar */}

        <View style={styles.card}>

          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✓</Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              Aadhaar Card
            </Text>

            <Text style={styles.cardSubtitle}>
              Uploaded Successfully
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/kyc/aadhaar")}
          >
            <Text style={styles.editText}>
              Edit
            </Text>
          </TouchableOpacity>

        </View>

        {/* PAN */}

        <View style={styles.card}>

          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✓</Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              PAN Card
            </Text>

            <Text style={styles.cardSubtitle}>
              Uploaded Successfully
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/kyc/aadhaar")}
          >
            <Text style={styles.editText}>
              Edit
            </Text>
          </TouchableOpacity>

        </View>

        {/* Driving Licence */}

        <View style={styles.card}>

          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✓</Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              Driving Licence
            </Text>

            <Text style={styles.cardSubtitle}>
              Uploaded Successfully
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/kyc/vehicle")}
          >
            <Text style={styles.editText}>
              Edit
            </Text>
          </TouchableOpacity>

        </View>

        {/* Vehicle RC */}

        <View style={styles.card}>

          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✓</Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              Vehicle RC
            </Text>

            <Text style={styles.cardSubtitle}>
              Uploaded Successfully
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/kyc/vehicle")}
          >
            <Text style={styles.editText}>
              Edit
            </Text>
          </TouchableOpacity>

        </View>

        {/* Vehicle Details */}

        <View style={styles.card}>

          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✓</Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              Vehicle Details
            </Text>

            <Text style={styles.cardSubtitle}>
              Verified Successfully
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/kyc/vehicle")}
          >
            <Text style={styles.editText}>
              Edit
            </Text>
          </TouchableOpacity>

        </View>

        {/* Selfie */}

        <View style={styles.card}>

          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✓</Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              Selfie Verification
            </Text>

            <Text style={styles.cardSubtitle}>
              Captured Successfully
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/kyc/selfie")}
          >
            <Text style={styles.editText}>
              Edit
            </Text>
          </TouchableOpacity>

        </View>

        {/* Declaration */}

        <View style={styles.declarationCard}>

        <Text style={styles.declarationTitle}>
            Declaration
        </Text>

        <Text style={styles.declarationText}>
            Please verify that all the information
            and documents submitted are correct.
            Providing incorrect information may
            delay your KYC verification.
        </Text>

        <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() =>
            setConfirmed(!confirmed)
            }
        >

            <View
            style={[
                styles.checkbox,
                confirmed &&
                styles.checkboxSelected,
            ]}
            >
            {confirmed && (
                <Text
                style={styles.checkboxTick}
                >
                ✓
                </Text>
            )}
            </View>

            <Text
            style={styles.checkboxText}
            >
            I confirm that all the above
            information is correct.
            </Text>

        </TouchableOpacity>

        </View>
        {/* Submit Button */}

<TouchableOpacity
  style={[
    styles.submitButton,
    !confirmed &&
      styles.submitDisabled,
  ]}
  disabled={!confirmed}
  onPress={() =>
    router.replace("/kyc/under-review")
  }
>
  <Text style={styles.submitText}>
    Submit KYC
  </Text>
</TouchableOpacity>

<View style={{ height: 40 }} />

</ScrollView>

</SafeAreaView>

);
}

const styles = StyleSheet.create({

container: {
flex: 1,
backgroundColor: "#FFFFFF",
},

header: {
  paddingHorizontal: 22,
  paddingTop: 25,
  alignItems: "center",
},

title: {
  fontSize: 34,
  fontWeight: "700",
  color: "#111827",
  textAlign: "center",
},

subtitle: {
  marginTop: 10,
  fontSize: 22,
  fontWeight: "700",
  color: "#FF7A00",
  textAlign: "center",
},

description: {
  marginTop: 16,
  fontSize: 16,
  lineHeight: 26,
  color: "#6B7280",
  textAlign: "center",
  paddingHorizontal: 20,
},

progressCard: {
  marginHorizontal: 22,
  marginTop: 30,
  backgroundColor: "#FFFFFF",
  borderRadius: 18,
  padding: 18,
  elevation: 3,
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 12,
},

progressTop: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
},

progressTitle: {
fontSize: 16,
fontWeight: "600",
color: "#111827",
},

progressPercent: {
fontSize: 16,
fontWeight: "700",
color: "#FF7A00",
},

progressBackground: {
  height: 12,
  backgroundColor: "#ECECEC",
  borderRadius: 30,
  overflow: "hidden",
},

progressFill: {
width: "100%",
height: "100%",
backgroundColor: "#FF7A00",
},

card: {
marginHorizontal: 22,
marginTop: 18,
backgroundColor: "#FFFFFF",
borderRadius: 16,
padding: 16,
flexDirection: "row",
alignItems: "center",
elevation: 2,
shadowColor: "#000",
shadowOpacity: 0.05,
shadowRadius: 8,
},

iconCircle: {
width: 42,
height: 42,
borderRadius: 21,
backgroundColor: "#16A34A",
justifyContent: "center",
alignItems: "center",
},

iconText: {
fontSize: 20,
fontWeight: "700",
color: "#FFFFFF",
},

cardContent: {
marginLeft: 15,
},

cardTitle: {
fontSize: 16,
fontWeight: "600",
color: "#111827",
},

cardSubtitle: {
marginTop: 3,
fontSize: 13,
color: "#6B7280",
},

declarationCard: {
marginHorizontal: 22,
marginTop: 25,
backgroundColor: "#FFF7ED",
borderRadius: 16,
padding: 18,
},

declarationTitle: {
fontSize: 18,
fontWeight: "700",
color: "#FF7A00",
},

declarationText: {
marginTop: 10,
fontSize: 14,
lineHeight: 22,
color: "#4B5563",
},

checkboxRow: {
marginTop: 18,
flexDirection: "row",
alignItems: "center",
},

checkbox: {
width: 24,
height: 24,
borderRadius: 6,
borderWidth: 2,
borderColor: "#FF7A00",
justifyContent: "center",
alignItems: "center",
},

checkboxSelected: {
backgroundColor: "#FF7A00",
},

checkboxTick: {
color: "#FFFFFF",
fontWeight: "700",
},

checkboxText: {
flex: 1,
marginLeft: 12,
fontSize: 14,
color: "#374151",
},

submitButton: {
marginHorizontal: 22,
marginTop: 35,
height: 58,
borderRadius: 16,
backgroundColor: "#FF7A00",
justifyContent: "center",
alignItems: "center",
},

submitDisabled: {
opacity: 0.45,
},

submitText: {
color: "#FFFFFF",
fontSize: 18,
fontWeight: "700",
},

editButton: {
  marginLeft: "auto",
  backgroundColor: "#FFF7ED",
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 10,
},

editText: {
  color: "#FF7A00",
  fontWeight: "700",
  fontSize: 14,
},

});
import React, { useEffect, useState, } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAppStore }from "../../store/appStore";

export default function AadhaarScreen() {
  const {
  setDocumentType,
  aadhaarUploaded,
  panUploaded,
  aadhaarNumber,
  panNumber,
  setAadhaarNumber,
  setPanNumber,
} = useAppStore();

const [aadhaarError, setAadhaarError] = useState("");
const [panError, setPanError] = useState("");
const [aadhaarOcrError, setAadhaarOcrError] = useState(false);
const [panOcrError, setPanOcrError] = useState(false);

useEffect(() => {
  const aadhaarValid =
    aadhaarNumber.replace(/\s/g, "").length === 12;

  const panValid =
    /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
      panNumber
    );

  if (
    aadhaarUploaded &&
    panUploaded &&
    aadhaarValid &&
    panValid
  ) {
    router.replace("/kyc/vehicle");
  }
}, [
  aadhaarUploaded,
  panUploaded,
  aadhaarNumber,
  panNumber,
]);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* Header */}

      <Text style={styles.header}>
        Complete Your KYC
      </Text>

      <Text style={styles.subHeader}>
        Complete verification to start
        accepting trips and deliveries.
      </Text>

      {/* Stepper */}

      <View style={styles.stepper}>
        <View style={styles.stepItem}>
          <View
            style={
              styles.activeCircle
            }
          >
            <Text
              style={
                styles.circleText
              }
            >
              1
            </Text>
          </View>

          <Text
            style={
              styles.stepLabel
            }
          >
            Personal
          </Text>
        </View>

        <View style={styles.line} />

        <View style={styles.stepItem}>
          <View
            style={styles.circle}
          >
            <Text
              style={
                styles.inactiveText
              }
            >
              2
            </Text>
          </View>

          <Text
            style={
              styles.stepLabel
            }
          >
            Vehicle
          </Text>
        </View>

        <View style={styles.line} />

        <View style={styles.stepItem}>
          <View
            style={styles.circle}
          >
            <Text
              style={
                styles.inactiveText
              }
            >
              3
            </Text>
          </View>

          <Text
            style={
              styles.stepLabel
            }
          >
            Selfie
          </Text>
        </View>
      </View>

      {/* Screen Title */}
<Text style={styles.title}>
  Upload the following *
</Text>

<View
  style={[
    styles.uploadRow,
    styles.panUploadRow,
  ]}
>  <Text style={styles.docText}>
    Aadhaar Card
  </Text>

  <TouchableOpacity
    onPress={() => {
      setDocumentType("aadhaar");
      setAadhaarOcrError(true); // Demo only
      router.push("/kyc/camera");
    }}
  >
  <Text
    style={[
      styles.uploadBtn,
      aadhaarUploaded && styles.uploadSuccess,
    ]}
  >
    {aadhaarUploaded
      ? "✓ Uploaded"
      : "📷 Upload"}
  </Text>
  </TouchableOpacity>
</View>
{aadhaarOcrError && (
  <Text style={styles.ocrError}>
    Could not read document, please upload a clearer image.
    You can enter the Aadhaar number manually.
  </Text>
)}

{aadhaarUploaded && (
  <View style={styles.inputBox}>
    <TextInput
  value={aadhaarNumber}
  onChangeText={(text) => {

    const numbers =
      text
        .replace(/\D/g, "")
        .slice(0, 12);

    const formatted =
      numbers.replace(
        /(\d{4})(\d{0,4})(\d{0,4})/,
        (_, a, b, c) =>
          [a, b, c]
            .filter(Boolean)
            .join(" ")
      );

    setAadhaarNumber(formatted);

    if (numbers.length === 12) {
  setAadhaarError("");
} else if (numbers.length >= 0) {
  setAadhaarError("Aadhaar number must contain exactly 12 digits.");
} else {
  setAadhaarError("");
}
  }}
  placeholder="Enter aadhar number"
  keyboardType="number-pad"
  maxLength={14}
  style={styles.input}
/>
  </View>
)}
{aadhaarError ? (
  <Text style={styles.errorText}>
    {aadhaarError}
  </Text>
) : null}

<View style={styles.uploadRow}>
  <Text style={styles.docText}>
    PAN Card
  </Text>

  <TouchableOpacity
    onPress={() => {
      setDocumentType("pan");
      setPanOcrError(true); // Demo only
      router.push("/kyc/camera");
    }}
  >
  <Text
    style={[
      styles.uploadBtn,
      panUploaded && styles.uploadSuccess,
    ]}
  >
    {panUploaded
      ? "✓ Uploaded"
      : "📷 Upload"}
  </Text>
  </TouchableOpacity>
</View>
{panOcrError && (
  <Text style={styles.ocrError}>
    Could not read document, please upload a clearer image.
    You can enter the PAN number manually.
  </Text>
)}
{panUploaded && (
  <View style={styles.inputBox}>
    <TextInput
  value={panNumber}
  placeholder="Enter pan number"
  autoCapitalize="characters"
  maxLength={10}
  onChangeText={(text) => {

    let value =
      text.toUpperCase();

    value = value.replace(
      /[^A-Z0-9]/g,
      ""
    );

    let result = "";

    for (let i = 0; i < value.length; i++) {

      if (i < 5) {

        if (/[A-Z]/.test(value[i]))
          result += value[i];

      } else if (i < 9) {

        if (/[0-9]/.test(value[i]))
          result += value[i];

      } else {

        if (/[A-Z]/.test(value[i]))
          result += value[i];

      }

    }

    setPanNumber(result);

    if (result.length === 0) {
      setPanError("");
    }
    else if (result.length < 10) {
      setPanError("PAN must contain 10 characters.");
    }
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(result)) {
      setPanError("PAN format should be ABCDE1234F.");
    }
    else {
      setPanError("");
    }

  }}
  style={styles.input}
/>
  </View>
)}
{panError ? (
  <Text style={styles.errorText}>
    {panError}
  </Text>
) : null}
    </ScrollView>
  );
}


const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
      padding: 20,
    },

    header: {
      fontSize: 30,
      fontWeight: "700",
      color: "#1A1A1A",
      textAlign: "center",
      marginTop: 25,
    },

    subHeader: {
      fontSize: 15,
      color: "#6B7280",
      textAlign: "center",
      marginTop: 10,
      marginBottom: 40,
    },

    stepper: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent:
        "center",
      marginBottom: 40,
    },

    stepItem: {
      alignItems: "center",
    },

    activeCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        "#FF7A00",
      justifyContent:
        "center",
      alignItems: "center",
    },

    circle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      borderWidth: 1,
      borderColor:
        "#D1D5DB",
      justifyContent:
        "center",
      alignItems: "center",
    },

    circleText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 18,
    },

    inactiveText: {
      color: "#6B7280",
      fontWeight: "700",
      fontSize: 18,
    },

    line: {
      width: 60,
      height: 2,
      backgroundColor:
        "#E5E7EB",
      marginTop: 21,
    },

    stepLabel: {
      marginTop: 10,
      fontSize: 13,
      color: "#374151",
    },

    title: {
      fontSize: 24,
      fontWeight: "700",
      color: "#1A1A1A",
      marginBottom: 25,
    },

    label: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1A1A1A",
      marginBottom: 8,
      marginTop: 20,
    },

    uploadCard: {
      height: 58,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#FBBF77",
      backgroundColor:
        "#FFF7F0",
      justifyContent:
        "center",
      paddingHorizontal: 20,
    },

    uploadText: {
      color: "#FF7A00",
      fontWeight: "600",
      fontSize: 16,
    },

    input: {
      height: 46,
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      paddingHorizontal: 18,
      fontSize: 16,
      color: "#1A1A1A",
    },

    button: {
      height: 60,
      borderRadius: 18,
      backgroundColor:
        "#FF7A00",
      justifyContent:
        "center",
      alignItems: "center",
      marginTop: 40,
      marginBottom: 40,
    },

    buttonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 18,
    },

    uploadRow: {
  height: 58,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "#F3F4F6",
  backgroundColor: "#FFFFFF",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 20,
  marginBottom: 12,
},

docText: {
  fontSize: 17,
  fontWeight: "600",
  color: "#1A1A1A",
},

uploadBtn: {
  color: "#FF7A00",
  fontWeight: "600",
  fontSize: 16,
},

uploadSuccess: {
  color: "#FF7A00",
  fontWeight: "700",
},

inputBox: {
  marginTop: -1,
  marginBottom: 8,
},

inputLabel: {
  fontSize: 15,
  fontWeight: "600",
  color: "#111827",
  marginBottom: 6,
},

panUploadRow: {
  marginTop: 17,
},

errorText: {
  color: "#DC2626",
  fontSize: 13,
  marginTop: 6,
  marginLeft: 4,
  fontWeight: "500",
},

ocrError: {
  color: "#DC2626",
  fontSize: 13,
  marginBottom: 8,
  marginLeft: 4,
  fontWeight: "600",
},
  });

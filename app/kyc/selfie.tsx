import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { useAppStore } from "../../store/appStore";

export default function SelfieScreen() {
  const {
  setDocumentType,
  selfieUri,
} = useAppStore();

const [showSuccess, setShowSuccess] =
  React.useState(false);
const [showInstructions, setShowInstructions] =
  React.useState(false);

useEffect(() => {

  if (!selfieUri) return;

  // Show success message
  setShowSuccess(true);

  // Wait 2 seconds before opening dashboard
  const timer = setTimeout(() => {
    // router.replace("/kyc/review-kyc");
    router.replace("/(tabs)/home");
  }, 2000);

  return () => clearTimeout(timer);

}, [selfieUri]);

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
              styles.completedCircle
            }
          >
            <Text
              style={
                styles.circleText
              }
            >
              ✓
            </Text>
          </View>

          <Text
            style={
              styles.stepLabel
            }
          >
            Aadhaar
          </Text>
        </View>

        <View style={styles.line} />

        <View style={styles.stepItem}>
          <View
            style={
              styles.completedCircle
            }
          >
            <Text
              style={
                styles.circleText
              }
            >
              ✓
            </Text>
          </View>

          <Text
            style={
              styles.stepLabel
            }
          >
            DL & RC
          </Text>
        </View>

        <View style={styles.line} />

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

      <Text style={styles.title}>
        Upload the following *
      </Text>

      <View style={styles.uploadRow}>
        <Text style={styles.docText}>
          Selfie Verification
        </Text>

<TouchableOpacity
  onPress={() => {
    setShowInstructions(true);
  }}
>
<Text
  style={[
    styles.uploadBtn,
    selfieUri && styles.uploadSuccess,
  ]}
>
  {selfieUri
    ? "✓ Uploaded"
    : "📷 Capture"}
</Text>
</TouchableOpacity>
      </View>

      {selfieUri && (
        <View
          style={styles.successBox}
        >
          <Text
            style={
              styles.successText
            }
          >
            ✓ Face captured successfully
          </Text>
        </View>
      )}
      <Modal
  visible={showInstructions}
  transparent
  animationType="fade"
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>

      <Text style={styles.modalTitle}>
        📸 Selfie Instructions
      </Text>

      <Text style={styles.modalText}>
        • Place your face inside the frame.
      </Text>

      <Text style={styles.modalText}>
        • Ensure good lighting.
      </Text>

      <Text style={styles.modalText}>
        • Remove sunglasses or masks.
      </Text>

      <Text style={styles.modalText}>
        • Look straight at the camera.
      </Text>

      <View style={styles.modalButtons}>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() =>
            setShowInstructions(false)
          }
        >
          <Text style={styles.cancelText}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.okButton}
          onPress={() => {
            setShowInstructions(false);
            setDocumentType("selfie");
            router.push("/kyc/camera");
          }}
        >
          <Text style={styles.okText}>
            OK
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  </View>
</Modal>
    </ScrollView>
    
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:"#FFFFFF",
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
      justifyContent:"center",
      marginBottom: 40,
    },

    stepItem: {
      alignItems: "center",
    },

    completedCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:"#16A34A",
      justifyContent: "center",
      alignItems: "center",
    },

    activeCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:"#FF7A00",
      justifyContent:"center",
      alignItems: "center",
    },

    circleText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 18,
    },

    line: {
      width: 60,
      height: 2,
      backgroundColor:"#E5E7EB",
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

    uploadRow: {
      height: 70,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:"#F3F4F6",
      backgroundColor:"#FFFFFF",
      flexDirection: "row",
      justifyContent:"space-between",
      alignItems: "center",
      paddingHorizontal: 20,
    },

    docText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#1A1A1A",
    },

    uploadBtn: {
     color: "#FF7A00",
     fontSize: 16,
     fontWeight: "600",
    },

    uploadSuccess: {
     color: "#FF7A00",
     fontSize: 16,
     fontWeight: "700",
    },

    successBox: {
      marginTop: 25,
      padding: 18,
      borderRadius: 16,
      backgroundColor:
        "#F0FDF4",
    },

    successText: {
      color: "#16A34A",
      fontWeight: "600",
      textAlign: "center",
    },

    modalOverlay: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.5)",
},

modalCard: {
  width: "88%",
  backgroundColor: "#FFFFFF",
  borderRadius: 22,
  padding: 24,
},

modalTitle: {
  fontSize: 24,
  fontWeight: "700",
  color: "#111827",
  marginBottom: 20,
  textAlign: "center",
},

modalText: {
  fontSize: 16,
  color: "#374151",
  marginBottom: 12,
  lineHeight: 24,
},

modalButtons: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 25,
},

cancelButton: {
  flex: 1,
  backgroundColor: "#F3F4F6",
  paddingVertical: 14,
  borderRadius: 14,
  marginRight: 10,
  alignItems: "center",
},

okButton: {
  flex: 1,
  backgroundColor: "#FF7A00",
  paddingVertical: 14,
  borderRadius: 14,
  marginLeft: 10,
  alignItems: "center",
},

cancelText: {
  color: "#374151",
  fontSize: 17,
  fontWeight: "700",
},

okText: {
  color: "#FFFFFF",
  fontSize: 17,
  fontWeight: "700",
},
  });
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAppStore } from "../store/appStore";
import { THEMES } from "../constants/colors";

export default function TripProgressScreen() {
    const { theme, setTheme } =
    useAppStore();
  
    const colors =
      theme === "dark"
        ? THEMES.dark
        : THEMES.light;
    const styles = createStyles(colors);
  //after testign remove this like and use this like:// const vehicleType = "truck"; remember this is only for testing .
  const [vehicleType] = useState< "bike" | "scooty" | "auto" | "cab" | "truck" >("truck");
  const [step, setStep] = useState(1);
  const [showPickupOtp, setShowPickupOtp] =
  useState(false);

  const params = useLocalSearchParams();

React.useEffect(() => {
  if (params.step) {
    setStep(Number(params.step));
  }
}, [params.step]);

const [showDropOtp, setShowDropOtp] =
  useState(false);

const [pickupOtp, setPickupOtp] =
  useState("");

const [dropOtp, setDropOtp] =
  useState("");

  const nextStep = () => {
  if (step === 1) {
    setStep(2);
  }

  else if (step === 2) {
    setShowPickupOtp(true);
  }

  else if (step === 3) {

      // const vehicleType = "truck";

      if (vehicleType === "truck") {

          router.push("/proof-of-load");

      } else {

          setStep(4);

      }

  }

  else if (step === 4) {

      if (vehicleType === "truck") {

          router.push("/proof_unload");

      } else {

          router.push("/trip-completed");

      }

  }

  else if (step === 5) {
    router.push("/trip-completed");
  }
};

  const getButtonText = () => {
  switch (step) {
    case 1:
      return "Arrived at Pickup";

    case 2:
      return "Verify Pickup OTP";

    case 3:
      return "Start Trip";

    case 4:
      return "Verify Delivery OTP";

    case 5:
      return "Done";

    default:
      return "Continue";
  }
};
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* MAP */}
        <View style={styles.map}>
          <Text style={styles.mapText}>
            Map Placeholder
          </Text>
        </View>

        {/* STEP INDICATOR */}
        <View style={styles.stepContainer}>
          {[
            "Pickup",
            "Arrived",
            "OTP",
            "Progress",
            "Complete",
          ].map((item, index) => (
            <View
              key={index}
              style={styles.stepItem}
            >
              <View
                style={[
                  styles.circle,
                  step >= index + 1 &&
                    styles.activeCircle,
                ]}
              >
                <Text
                  style={[
                    styles.circleText,
                    step >= index + 1 &&
                      styles.activeCircleText,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>

              <Text
                style={[
                  styles.stepText,
                  step >= index + 1 &&
                    styles.activeStepText,
                ]}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* PICKUP DROP CARD */}
        <View style={styles.locationCard}>
          <Text style={styles.label}>
            PICKUP
          </Text>

          <Text style={styles.address}>
            BDA Complex, HSR Layout
          </Text>

          <Text
            style={[
              styles.label,
              { marginTop: 20 },
            ]}
          >
            DROP
          </Text>

          <Text style={styles.address}>
            Embassy Tech Village, ORR
          </Text>
        </View>

        {/* CUSTOMER CARD */}
        <View style={styles.customerCard}>
          <View>
            <Text style={styles.customer}>
              Embassy Front Desk
            </Text>

            <Text style={styles.tripInfo}>
              Parcel • Hyperlocal
            </Text>

            <Text style={styles.earn}>
              Earn ₹118
            </Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.iconBox}
            >
              <Text>📞</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBox}
            >
              <Text>💬</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Modal
  visible={showPickupOtp}
  transparent
  animationType="slide"
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>

      <Text style={styles.modalTitle}>
        Enter Pickup OTP
      </Text>

      <TextInput
        style={styles.otpInput}
        keyboardType="number-pad"
        maxLength={4}
        value={pickupOtp}
        onChangeText={setPickupOtp}
        placeholder="1234"
      />

      <TouchableOpacity
        style={styles.modalButton}
        onPress={() => {
          if (pickupOtp === "1234") {
            setShowPickupOtp(false);
            setStep(3);
          } else {
            Alert.alert(
              "Wrong Pickup OTP"
            );
          }
        }}
      >
        <Text style={styles.modalButtonText}>
          Verify
        </Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>

<Modal
  visible={showDropOtp}
  transparent
  animationType="slide"
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>

      <Text style={styles.modalTitle}>
        Enter Delivery OTP
      </Text>

      <TextInput
        style={styles.otpInput}
        keyboardType="number-pad"
        maxLength={4}
        value={dropOtp}
        onChangeText={setDropOtp}
        placeholder="5678"
      />

      <TouchableOpacity
        style={styles.modalButton}
        onPress={() => {
          if (dropOtp === "5678") {
            setShowDropOtp(false);
            setStep(5);
          } else {
            Alert.alert(
              "Wrong Delivery OTP"
            );
          }
        }}
      >
        <Text style={styles.modalButtonText}>
          Verify
        </Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>
      {/* SOS */}
      <TouchableOpacity
        style={styles.sosButton}
        onPress={() => router.push("/safety/sos")}
      >
        <Text style={styles.sosText}>
          SOS
        </Text>
      </TouchableOpacity>

      {/* BOTTOM BUTTON */}
      <TouchableOpacity
        style={styles.bottomButton}
        onPress={nextStep}
      >
        <Text style={styles.bottomText}>
          {getButtonText()}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    map: {
      height: 230,
      backgroundColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },

    mapText: {
      fontSize: 16,
      color: colors.secondaryText,
    },

    stepContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 15,
      paddingHorizontal: 8,
    },

    stepItem: {
      alignItems: "center",
      width: 55,
    },

    circle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },

    activeCircle: {
      backgroundColor: colors.primary,
    },

    circleText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.secondaryText,
    },

    activeCircleText: {
      color: "#FFFFFF",
    },

    stepText: {
      marginTop: 6,
      fontSize: 10,
      color: colors.secondaryText,
      textAlign: "center",
    },

    activeStepText: {
      color: colors.primary,
      fontWeight: "700",
    },

    locationCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: 20,
      padding: 18,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },

    label: {
      color: colors.secondaryText,
      fontWeight: "700",
      fontSize: 12,
    },

    address: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginTop: 6,
    },

    customerCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      marginHorizontal: 20,
      marginTop: 20,
      padding: 18,
      marginBottom: 120,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },

        customer: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },

    tripInfo: {
      marginTop: 5,
      fontSize: 14,
      color: colors.secondaryText,
    },

    earn: {
      marginTop: 5,
      fontSize: 16,
      fontWeight: "700",
      color: colors.primary,
    },

    actionRow: {
      flexDirection: "row",
    },

    iconBox: {
      width: 50,
      height: 50,
      borderRadius: 15,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 10,
    },

    sosButton: {
      position: "absolute",
      right: 25,
      bottom: 100,
      width: 50,
      height: 50,
      borderRadius: 35,
      backgroundColor: "#EF4444",
      justifyContent: "center",
      alignItems: "center",
      elevation: 10,
    },

    sosText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 18,
    },

    bottomButton: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 18,
      alignItems: "center",
      elevation: 8,
    },

    bottomText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "700",
    },

    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.4)",
    },

    modalCard: {
      width: "85%",
      backgroundColor: colors.card,
      padding: 25,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },

    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 20,
      color: colors.text,
    },

    otpInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 15,
      padding: 15,
      fontSize: 20,
      textAlign: "center",
      color: colors.text,
      backgroundColor: colors.background,
    },

    modalButton: {
      backgroundColor: colors.primary,
      padding: 15,
      borderRadius: 15,
      marginTop: 20,
    },

    modalButtonText: {
      color: "#FFFFFF",
      textAlign: "center",
      fontWeight: "700",
      fontSize: 16,
    },
  });
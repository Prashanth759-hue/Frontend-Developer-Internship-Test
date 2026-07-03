import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";

export default function TripPaymentScreen() {

  // Testing only
  const [paymentMethod] = useState<"cash" | "upi" | "wallet">("cash");
  const tripAmount = 118;

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");

  const continueToOtp = () => {
    setShowOtp(true);
  };

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.heading}>
        Payment
      </Text>

      <Text style={styles.subHeading}>
        Complete the payment before delivery verification.
      </Text>

      <View style={styles.card}>

        <Text style={styles.label}>
          Payment Method
        </Text>

        {/* CASH */}

        {paymentMethod === "cash" && (
          <>
            <Text style={styles.method}>
              💵 Cash
            </Text>

            <Text style={styles.info}>
              Collect ₹{tripAmount} from the customer.
            </Text>

            <TouchableOpacity
              style={styles.orangeButton}
              onPress={continueToOtp}
            >
              <Text style={styles.buttonText}>
                Cash Received
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* UPI */}

        {paymentMethod === "upi" && (
          <>
            <Text style={styles.method}>
              📱 UPI
            </Text>

            <Text style={styles.info}>
              Customer selected UPI.
            </Text>

            <Text style={styles.info}>
              Show your personal QR.
            </Text>

            <View style={styles.qrPlaceholder}>
            <Text style={styles.qrIcon}>📱</Text>

            <Text style={styles.qrTitle}>
                Driver Personal QR
            </Text>

            <Text style={styles.qrSubTitle}>
                QR will appear here
            </Text>
            </View>

            <Text style={styles.upi}>
              harish@okaxis
            </Text>

            <TouchableOpacity
              style={styles.orangeButton}
              onPress={continueToOtp}
            >
              <Text style={styles.buttonText}>
                Payment Received
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* WALLET */}

        {paymentMethod === "wallet" && (
          <>
            <Text style={styles.method}>
              👛 Vahan360 Wallet
            </Text>

            <Text style={styles.success}>
              ₹{tripAmount} received successfully.
            </Text>

            <Text style={styles.info}>
              Money has been credited to your
              Vahan360 wallet automatically.
            </Text>

            <TouchableOpacity
              style={styles.orangeButton}
              onPress={continueToOtp}
            >
              <Text style={styles.buttonText}>
                Continue
              </Text>
            </TouchableOpacity>
          </>
        )}

      </View>

      {/* OTP */}

      <Modal
        visible={showOtp}
        transparent
        animationType="slide"
      >
        <View style={styles.overlay}>

          <View style={styles.modal}>

            <Text style={styles.modalTitle}>
              Delivery OTP
            </Text>

            <TextInput
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={4}
              placeholder="5678"
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.orangeButton}
              onPress={() => {

                if (otp === "5678") {

                  setShowOtp(false);

                  router.replace("/trip-completed");

                } else {

                  Alert.alert(
                    "Invalid OTP",
                    "Please enter a valid OTP."
                  );

                }

              }}
            >
              <Text style={styles.buttonText}>
                Verify OTP
              </Text>
            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#FFFFFF",
    padding:20,
    justifyContent:"center",
  },

  heading:{
    fontSize:32,
    fontWeight:"700",
    color:"#111827",
  },

  subHeading:{
    marginTop:8,
    fontSize:16,
    color:"#6B7280",
    marginBottom:25,
  },

  card:{
    backgroundColor:"#FFF7ED",
    borderRadius:20,
    padding:22,
  },

  label:{
    fontSize:16,
    color:"#6B7280",
    fontWeight:"600",
  },

  method:{
    marginTop:12,
    fontSize:24,
    fontWeight:"700",
    color:"#111827",
  },

  info:{
    marginTop:15,
    fontSize:16,
    color:"#374151",
    lineHeight:24,
  },

  success:{
    marginTop:15,
    fontSize:18,
    color:"#16A34A",
    fontWeight:"700",
  },

  qr:{
    width:220,
    height:220,
    alignSelf:"center",
    marginTop:20,
    marginBottom:15,
    resizeMode:"contain",
  },

  upi:{
    textAlign:"center",
    fontSize:18,
    fontWeight:"700",
    color:"#111827",
  },

  orangeButton:{
    marginTop:30,
    backgroundColor:"#FF7A00",
    paddingVertical:17,
    borderRadius:18,
    alignItems:"center",
  },

  buttonText:{
    color:"#FFFFFF",
    fontSize:18,
    fontWeight:"700",
  },

  overlay:{
    flex:1,
    backgroundColor:"rgba(0,0,0,0.4)",
    justifyContent:"center",
    alignItems:"center",
  },

  modal:{
    width:"85%",
    backgroundColor:"#FFFFFF",
    borderRadius:20,
    padding:25,
  },

  modalTitle:{
    fontSize:22,
    fontWeight:"700",
    textAlign:"center",
    marginBottom:20,
  },

  input:{
    borderWidth:1,
    borderColor:"#D1D5DB",
    borderRadius:15,
    padding:15,
    fontSize:22,
    textAlign:"center",
  },

  qrPlaceholder: {
  height: 220,
  borderRadius: 18,
  borderWidth: 2,
  borderStyle: "dashed",
  borderColor: "#D1D5DB",
  backgroundColor: "#F9FAFB",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 20,
  marginBottom: 15,
},

qrIcon: {
  fontSize: 50,
},

qrTitle: {
  marginTop: 12,
  fontSize: 18,
  fontWeight: "700",
  color: "#111827",
},

qrSubTitle: {
  marginTop: 6,
  fontSize: 14,
  color: "#6B7280",
},

});
import React, {
  useState,
  useEffect,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  TextInput,
} from "react-native";
import { router } from "expo-router";

export default function SosScreen() {

  // Dummy values (Frontend only)
  const [battery] = useState("82%");
  const [location] = useState( "HSR Layout, Bangalore" );

  // Mock internet status
  const [hasInternet] = useState(true);

  // Loading state
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNoInternet, setShowNoInternet] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [countdownRunning, setCountdownRunning] = useState(false);
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [queuedAlert, setQueuedAlert] = useState(false);
  useEffect(() => {

  if (!countdownRunning)
    return;

  if (countdown === 0) {

    setCountdownRunning(false);

    sendSOS();

    return;

  }

  const timer = setTimeout(() => {

    setCountdown((prev) => prev - 1);

  }, 1000);

  return () => clearTimeout(timer);

}, [
  countdownRunning,
  countdown,
]);

  const sendSOS = () => {

  setShowConfirm(false);
  setCountdown(5);

  if (!hasInternet) {

    setShowNoInternet(true);

    return;
  }

  setSending(true);

  setTimeout(() => {

    setSending(false);

    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      router.back();

    }, 2000);

  }, 2500);

};

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.title}>
        Emergency SOS
      </Text>

      <Text style={styles.subtitle}>
        Press SOS only during an emergency.
      </Text>
      <View style={styles.mapContainer}>

  <Text style={styles.mapIcon}>
    🗺️
  </Text>

  <Text style={styles.mapTitle}>
    Map Preview
  </Text>

  <Text style={styles.mapSubtitle}>
    Current location will appear here
  </Text>

</View>

      <View style={styles.card}>

        <Text style={styles.label}>
          📍 Current Location
        </Text>

        <Text style={styles.value}>
          {location}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.label}>
          🔋 Battery
        </Text>

        <Text style={styles.value}>
          {battery}
        </Text>

      </View>

<TouchableOpacity
  style={styles.cancelButton}
  onPress={() => router.back()}
>
  <Text style={styles.cancelText}>
    Cancel
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.sosButton}
  disabled={sending}
  onPress={() => setShowConfirm(true)}
>
  <Text style={styles.sosText}>
    {sending
      ? "Sending Emergency Alert..."
      : "🚨 Send SOS"}
  </Text>
</TouchableOpacity>

{/* SOS Confirmation */}

{showConfirm && (

<View style={styles.popup}>

<View style={styles.popupCard}>

<Text style={styles.popupTitle}>
🚨 Emergency SOS
</Text>

<Text style={styles.popupMessage}>
Briefly describe your emergency.
</Text>

<TextInput
style={styles.issueInput}
placeholder="Example: Accident, vehicle breakdown, medical emergency..."
multiline
value={issueText}
onChangeText={setIssueText}
/>

<TouchableOpacity
style={styles.voiceButton}
onPress={()=>{
setVoiceRecorded(true);
}}
>

<Text style={styles.voiceText}>
🎤 {voiceRecorded ? "Voice Note Added" : "Record Voice Note"}
</Text>

</TouchableOpacity>

<Text
style={styles.countdownText}
>

{countdownRunning
  ? `Sending emergency alert in ${countdown} seconds...`
  : "Press Start SOS to begin the 5-second countdown."}

</Text>

<View style={styles.popupButtons}>

<TouchableOpacity
style={styles.cancelPopup}
onPress={()=>{
setCountdown(5);
setCountdownRunning(false);
setShowConfirm(false);
}}
>

<Text style={styles.cancelPopupText}>
Cancel
</Text>

</TouchableOpacity>

<TouchableOpacity
style={styles.sendPopup}
onPress={()=>{
setCountdownRunning(true);
}}
>

<Text style={styles.sendPopupText}>
Start SOS
</Text>

</TouchableOpacity>

</View>

</View>

</View>

)}

{/* No Internet */}

{showNoInternet && (

<View style={styles.popup}>

<View style={styles.popupCard}>

<Text style={styles.popupTitle}>
No Internet
</Text>

<Text style={styles.popupMessage}>
No connection detected.

{"\n\n"}

Your SOS alert has been queued.

{"\n\n"}

It will be sent automatically when your internet connection is restored.
</Text>

<TouchableOpacity
style={styles.retryButton}
onPress={()=>{
setQueuedAlert(true);
setShowNoInternet(false);
}}
>

<Text style={styles.retryText}>
Retry
</Text>

</TouchableOpacity>

</View>

</View>

)}
{/* SOS Success */}

{showSuccess && (

<View style={styles.popup}>

  <View style={styles.popupCard}>

    <Text
      style={{
        fontSize: 60,
        textAlign: "center",
      }}
    >
      ✅
    </Text>

    <Text style={styles.popupTitle}>
      SOS Sent Successfully
    </Text>

    <Text style={styles.popupMessage}>

    SOS Sent Successfully.

    {"\n\n"}

    ✓ Driver: Ram

    {"\n"}

    ✓ Phone: +91 9876543210

    {"\n"}

    ✓ Trip ID: TRIP1024

    {"\n"}

    ✓ Location: {location}

    {"\n"}

    ✓ Battery: {battery}

    {"\n"}

    ✓ Emergency Details:
    {issueText || "Not Provided"}

    {"\n"}

    ✓ Voice Note:
    {voiceRecorded ? "Attached" : "Not Attached"}

    {"\n\n"}

    Vahan360 Operations have been notified.

    {"\n"}

    Help is on the way.

    </Text>
  </View>

</View>

)}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    justifyContent: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#FFF7ED",
    borderRadius: 20,
    padding: 20,
  },

  label: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },

  value: {
    fontSize: 18,
    color: "#111827",
    fontWeight: "700",
    marginTop: 8,
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 20,
  },

  cancelButton: {
  height: 58,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#D1D5DB",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 35,
},

cancelText: {
  fontSize: 17,
  fontWeight: "700",
  color: "#374151",
},

sosButton: {
  height: 60,
  borderRadius: 16,
  backgroundColor: "#EF4444",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 18,
},

sosText: {
  color: "#FFFFFF",
  fontWeight: "700",
  fontSize: 18,
},

mapContainer: {
  height: 220,
  borderRadius: 20,
  backgroundColor: "#F3F4F6",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 25,
},

mapIcon: {
  fontSize: 52,
},

mapTitle: {
  marginTop: 10,
  fontSize: 22,
  fontWeight: "700",
  color: "#111827",
},

mapSubtitle: {
  marginTop: 6,
  fontSize: 15,
  color: "#6B7280",
},

popup:{
position:"absolute",
top:0,
bottom:0,
left:0,
right:0,
backgroundColor:"rgba(0,0,0,0.5)",
justifyContent:"center",
alignItems:"center",
},

popupCard:{
width:"85%",
backgroundColor:"#FFF",
padding:25,
borderRadius:20,
},

popupTitle:{
fontSize:22,
fontWeight:"700",
textAlign:"center",
},

popupMessage:{
marginTop:15,
textAlign:"center",
fontSize:16,
color:"#6B7280",
},

popupButtons:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:30,
},

cancelPopup:{
padding:15,
},

sendPopup:{
backgroundColor:"#EF4444",
paddingHorizontal:25,
paddingVertical:15,
borderRadius:12,
},

retryButton:{
marginTop:25,
backgroundColor:"#FF7A00",
paddingVertical:15,
borderRadius:12,
},

retryText:{
color:"#FFF",
textAlign:"center",
fontWeight:"700",
fontSize:16,
},

issueInput: {
  borderWidth: 1,
  borderColor: "#E5E7EB",
  borderRadius: 14,
  padding: 14,
  minHeight: 100,
  textAlignVertical: "top",
  fontSize: 15,
  color: "#111827",
  marginTop: 18,
},

voiceButton: {
  marginTop: 18,
  backgroundColor: "#FFF7ED",
  borderRadius: 14,
  paddingVertical: 14,
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#FDBA74",
},

voiceText: {
  color: "#FF7A00",
  fontSize: 16,
  fontWeight: "700",
},

countdownText: {
  marginTop: 20,
  textAlign: "center",
  fontSize: 18,
  fontWeight: "700",
  color: "#EF4444",
  lineHeight: 28,
},

cancelPopupText: {
  color: "#374151",
  fontWeight: "700",
  fontSize: 16,
},

sendPopupText: {
  color: "#FFFFFF",
  fontWeight: "700",
  fontSize: 16,
},

});
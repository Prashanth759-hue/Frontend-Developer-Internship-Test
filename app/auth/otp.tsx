import React, {
  useEffect,
  useState,
  useRef,
} from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { COLORS } from "../../constants/colors";
import { useAppStore } from "../../store/appStore";
import { THEMES } from "../../constants/colors";

export default function OtpScreen() {
    const { theme, setTheme } =
    useAppStore();
  
    const colors =
      theme === "dark"
        ? THEMES.dark
        : THEMES.light;
    const styles = createStyles(colors);
  const {
    mobile,
    email,
    setIsLoggedIn,
  } = useAppStore();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [attempts, setAttempts] = useState(0);
  const [otpLocked, setOtpLocked] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<TextInput>(null);
  const [otpExpired, setOtpExpired] = useState(false);
  const [cooldownMode, setCooldownMode] = useState(false);

  useEffect(() => {
    if (timer <= 0) {
      setOtpExpired(true);

      if (cooldownMode) {
        setOtpLocked(false);
        setAttempts(0);
        setCooldownMode(false);
      }

      return;
    }

    const t = setTimeout(() => {
      setTimer((p) => p - 1);
    }, 1000);

    return () => clearTimeout(t);
  }, [timer, cooldownMode]);

  useEffect(() => {
  const timer = setTimeout(() => {
    inputRef.current?.focus();
  }, 300);

  return () => clearTimeout(timer);
}, []);


  const verifyOtp = () => {
    console.log("otpExpired:", otpExpired);
    console.log("timer:", timer);
  if (otp.length !== 6) return;

  // Check if account is temporarily locked
  if (otpLocked) {
    setError("Too many incorrect OTP attempts. Please wait 30 seconds before trying again.");
    return;
  }

  // Check if OTP has expired
  if (otpExpired) {
    setError("OTP expired. Please resend OTP.");
    return;
  }

  // Check if OTP is correct
  if (otp === "123456") {
    setError("");
    setAttempts(0);
    setIsLoggedIn(true);
    router.replace("/kyc/aadhaar");
    return;
  }

  // Wrong OTP
  const newAttempts = attempts + 1;
  setAttempts(newAttempts);
  setOtp("");

  if (newAttempts >= 3) {
    setOtpLocked(true);
    setCooldownMode(true);
    setTimer(30); // 30-second cooldown

    setError(
      "Too many incorrect OTP attempts. Please wait 30 seconds before trying again."
    );

    return;
  }

  setError(
    `Invalid OTP. ${3 - newAttempts} attempt(s) remaining.`
  );

  setTimeout(() => {
    setError("");
  }, 3000);
};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Verify OTP
      </Text>

      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to
        your mobile number.
      </Text>

      <TouchableOpacity
  activeOpacity={1}
  disabled={otpLocked}
  onPress={() => {
    if (!otpLocked) {
      inputRef.current?.focus();
    }
  }}
>
  <View style={styles.otpContainer}>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <View
        key={i}
        style={styles.otpBox}
      >
        <Text style={styles.otpDigit}>
          {otp[i] || ""}
        </Text>
      </View>
    ))}
  </View>
</TouchableOpacity>

<TextInput
  ref={inputRef}
  value={otp}
  editable={!otpLocked}
  onChangeText={(t) => {
    setOtp(
      t.replace(/\D/g, "").slice(0, 6)
    );

    if (error) {
      setError("");
    }
  }}
  keyboardType="number-pad"
  maxLength={6}
  autoFocus
  style={styles.hiddenInput}
/>

      <Text style={styles.timer}>
        {timer > 0
          ? `Resend in 0:${String(
              timer
            ).padStart(2, "0")}`
          : "Didn't receive the OTP?"}
      </Text>

{(timer <= 0 || cooldownMode) && (
  <View style={styles.otpOptions}>

    {/* SMS */}
    <TouchableOpacity
      disabled={cooldownMode && timer > 0}
      style={[
        styles.smsResend,
        cooldownMode && timer > 0 && { opacity: 0.5 },
      ]}
      onPress={() => {
        setOtp("");
        setError("");
        setAttempts(0);
        setOtpLocked(false);
        setOtpExpired(false);
        setTimer(60); // Only one timer

        // Later:
        // SMS OTP API
      }}
    >
      <Text style={styles.smsText}>
        Resend OTP
      </Text>
    </TouchableOpacity>

    {/* WhatsApp */}
    <TouchableOpacity
      disabled={cooldownMode && timer > 0}
      style={[
        styles.whatsappResend,
        cooldownMode && timer > 0 && { opacity: 0.5 }
      ]}
      onPress={() => {
        setOtp("");
        setError("");
        setAttempts(0);
        setOtpLocked(false);
        setOtpExpired(false);
        setTimer(60); // or 30 if WhatsApp should have 30 sec cooldown

        // Later:
        // WhatsApp OTP API
      }}
    >
      <Image
        source={require("../../assets/icons/whatsapp.png")}
        style={styles.whatsappIcon}
        resizeMode="contain"
      />

      <Text style={styles.whatsappText}>
        Get OTP on WhatsApp
      </Text>
    </TouchableOpacity>

  </View>
)}

      {error ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : null}

      <TouchableOpacity
        disabled={otp.length !== 6 || otpLocked}
        style={[
          styles.button,
          {
            backgroundColor:
              otpLocked
                ? "#FBBF77"
                : otp.length === 6
                ? "#FF7A00"
                : "#FBBF77",
          },
        ]}
        onPress={verifyOtp}
      >
        <Text style={styles.buttonText}>
          Verify
        </Text>
      </TouchableOpacity>
    </View>
  );
}
const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      padding: 20,
    },

    title: {
      fontSize: 30,
      fontWeight: "700",
      color: colors.text,
    },

    subtitle: {
      marginTop: 10,
      marginBottom: 30,
      fontSize: 15,
      color: colors.secondaryText,
    },

    input: {
      height: 60,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      backgroundColor: colors.card,
      textAlign: "center",
      fontSize: 22,
      fontWeight: "600",
      color: colors.text,
      letterSpacing: 10,
    },

    timer: {
      marginTop: 20,
      textAlign: "center",
      color: colors.secondaryText,
    },

    otpOptions: {
      marginTop: 18,
    },

    smsResend: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 25,
      paddingVertical: 12,
      paddingHorizontal: 18,
      marginBottom: 12,
    },

    smsText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#2563EB",
    },

    otpChip: {
      height: 44,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      borderRadius: 25,
      paddingHorizontal: 17,
      marginHorizontal: 8,
    },

    chipIcon: {
      width: 45,
      height: 45,
      marginRight: 8,
    },

    chipText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },

    errorText: {
      marginTop: 15,
      color: "#EF4444",
      textAlign: "center",
      fontSize: 14,
      fontWeight: "600",
    },

    button: {
      height: 62,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 35,
      backgroundColor: colors.primary,
    },

    buttonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 18,
    },

    whatsappResend: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "center",
      marginTop: -3,
      paddingVertical: 12,
      paddingHorizontal: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 25,
    },

    whatsappIcon: {
      width: 30,
      height: 30,
      marginRight: 10,
    },

    whatsappText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.primary,
    },

    otpContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },

    otpBox: {
      width: 50,
      height: 58,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
    },

    otpDigit: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
    },

    hiddenInput: {
      position: "absolute",
      opacity: 0.01,
      width: "100%",
      height: 60,
      top: 120,
    },
  });
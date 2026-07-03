import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { router } from "expo-router";
import { useAppStore } from "../../store/appStore";
import { translations, } from "../language/translations";
import { THEMES } from "../../constants/colors";

export default function LoginScreen() {
    const { theme, setTheme } =
    useAppStore();
  
    const colors =
      theme === "dark"
        ? THEMES.dark
        : THEMES.light;
    const styles = createStyles(colors);
const {
  language,
  setLanguage,
  setLocationPermission,
  mobile,
  email,
  setMobile,
  setEmail,
  setDriverName,
  setDriverPhone,
} = useAppStore();

  const t =
    translations[
      language as keyof typeof translations
    ] || translations.en;

  const [
    showLocation,
    setShowLocation,
  ] = useState(true);

  const [
    showLanguage,
    setShowLanguage,
  ] = useState(false);

  const [
    locationDenied,
    setLocationDenied,
  ] = useState(false);

  const languages = [
    "English",
    "ಕನ್ನಡ",
    "தமிழ்",
    "हिन्दी",
    "తెలుగు",
  ];

  const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isValid =
   mobile.length === 10 &&
   emailRegex.test(email);

const sendOtp = () => {

  // Dummy data (Frontend only)
  setDriverName("Ram");
  //setDriverName(response.driverName); after implementign backend.
  setDriverPhone(mobile);
  //setDriverPhone(response.mobile);
  router.push("/auth/otp");

};


  return (
  <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      keyboardVerticalOffset={100}
    >
      {/* Orange Header */}
      <View style={styles.topSection} />

      {/* White Card */}
      <View style={styles.card}>
        <View style={styles.dragLine} />

        <Image
          source={require("../../assets/images/delivery-login.png")}
          style={styles.loginImage}
          resizeMode="contain"
        />
        <TouchableOpacity
        onPress={() => setShowLanguage(true)}
        style={styles.languageChange}
      >
        <Text style={styles.languageChangeText}>
          🌐 {
            language === "en"
              ? "English"
              : language === "kn"
              ? "ಕನ್ನಡ"
              : language === "ta"
              ? "தமிழ்"
              : language === "hi"
              ? "हिन्दी"
              : "తెలుగు"
          }
        </Text>
      </TouchableOpacity>

        <Text style={styles.title}>
          {t.enterMobile}
        </Text>

        <Text style={styles.subtitle}>
          We'll send you a 6-digit verification code.
        </Text>

        {/* Mobile Input */}
        <View style={styles.inputContainer}>
          <View style={styles.countryBox}>
            <Text style={styles.countryText}>
              🇮🇳 +91
            </Text>
          </View>

          <TextInput
            value={mobile}
            onChangeText={(t) =>
              setMobile(
                t.replace(/\D/g, "").slice(0, 10)
              )
            }
            keyboardType="number-pad"
            autoFocus
            placeholder="Enter mobile number"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
        </View>

        {/* Email Input */}
<View
  style={[
    styles.inputContainer,
    {
      marginTop: 12,
    },
  ]}
>
  <TextInput
    value={email}
    onChangeText={setEmail}
    keyboardType="email-address"
    autoCapitalize="none"
    placeholder={
      t.enterEmail
    }
    placeholderTextColor="#9CA3AF"
    style={styles.emailInput}
  />
</View>

        {/* Button */}
        <TouchableOpacity
          disabled={!isValid}
          style={[
            styles.button,
            {
              opacity: isValid ? 1 : 0.5,
            },
          ]}
          onPress={sendOtp}
        >
          <Text style={styles.buttonText}>
            Send OTP
          </Text>
        </TouchableOpacity>

        <Text style={styles.bottomText}>
          By continuing you agree to our
          Terms & Privacy Policy.
        </Text>
      </View>

      {/* LOCATION POPUP */}
<Modal
  visible={showLocation}
  transparent
  animationType="fade"
>
  <View style={styles.permissionOverlay}>
    <View style={styles.permissionCard}>

      <Text
        style={styles.permissionTitle}
      >
        Allow Vahan360 to access this
        device's precise location?
      </Text>

      <Text style={styles.locationDesc}>
        Location is required to provide
        nearby trips and navigation.
      </Text>

      {/* While Using App */}
      <TouchableOpacity
        style={styles.permissionButton}
        onPress={() => {
          setLocationPermission(
            "granted"
          );

          setShowLocation(false);
          setShowLanguage(true);
        }}
      >
        <Text
          style={
            styles.permissionButtonText
          }
        >
          While using app
        </Text>
      </TouchableOpacity>

      {/* Only This Time */}
      <TouchableOpacity
        style={styles.permissionButton}
        onPress={() => {
          setLocationPermission(
            "temporary"
          );

          setShowLocation(false);
          setShowLanguage(true);
        }}
      >
        <Text
          style={
            styles.permissionButtonText
          }
        >
          Only this time
        </Text>
      </TouchableOpacity>

      {/* Don't Allow */}
      <TouchableOpacity
  style={styles.permissionButton}
  onPress={() => {
    setLocationPermission(
      "denied"
    );

    setShowLocation(false);
    setShowLanguage(true);
  }}
>
  <Text
    style={
      styles.permissionButtonText
    }
  >
    Don't Allow
  </Text>
</TouchableOpacity>

    </View>
  </View>
</Modal>

      {/* LANGUAGE POPUP */}
      <Modal
  visible={showLanguage}
  transparent
  animationType="slide"
>
  <View style={styles.overlay}>
    <View style={styles.sheet}>
      <View style={styles.dragLine} />

      <Text
        style={styles.sheetTitle}
      >
        {t.selectLanguage}
      </Text>

      {languages.map((item) => (
        <TouchableOpacity
          key={item}
          style={styles.languageCard}
          onPress={() => {

            if (
              item === "English"
            ) {
              setLanguage("en");
            }

            else if (
              item === "ಕನ್ನಡ"
            ) {
              setLanguage("kn");
            }

            else if (
              item === "தமிழ்"
            ) {
              setLanguage("ta");
            }

            else if (
              item === "हिन्दी"
            ) {
              setLanguage("hi");
            }

            else if (
              item === "తెలుగు"
            ) {
              setLanguage("te");
            }

            setShowLanguage(
              false
            );
          }}
        >
          <Text
            style={
              styles.languageText
            }
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
</Modal>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    loginImage: {
      width: "90%",
      height: 170,
      alignSelf: "center",
      marginTop: -20,
      marginBottom: 10,
    },

    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    topSection: {
      height: "18%",
      backgroundColor: colors.primary,
    },

    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderTopLeftRadius: 45,
      borderTopRightRadius: 45,
      marginTop: -30,
      padding: 30,
    },

    dragLine: {
      width: 55,
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 20,
      alignSelf: "center",
      marginBottom: 20,
    },

    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      lineHeight: 36,
    },

    subtitle: {
      fontSize: 16,
      color: colors.secondaryText,
      marginTop: 8,
      marginBottom: 20,
    },

    inputContainer: {
      flexDirection: "row",
      height: 60,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: colors.card,
    },

    countryBox: {
      width: 110,
      justifyContent: "center",
      alignItems: "center",
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },

    countryText: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
    },

    input: {
      flex: 1,
      paddingHorizontal: 20,
      fontSize: 18,
      color: colors.text,
    },

    button: {
      height: 62,
      backgroundColor: colors.primary,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 40,
    },

    buttonText: {
      color: "#FFFFFF",
      fontSize: 22,
      fontWeight: "700",
    },

        bottomText: {
      textAlign: "center",
      color: colors.secondaryText,
      fontSize: 15,
      marginTop: 30,
    },

    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.35)",
    },

    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 35,
      borderTopRightRadius: 35,
      padding: 25,
    },

    sheetTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 20,
    },

    languageCard: {
      height: 58,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      paddingHorizontal: 20,
      marginTop: 12,
      backgroundColor: colors.card,
    },

    languageText: {
      fontSize: 18,
      color: colors.text,
    },

    permissionOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.45)",
    },

    permissionCard: {
      width: "88%",
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 25,
      borderWidth: 1,
      borderColor: colors.border,
    },

    permissionTitle: {
      fontSize: 22,
      fontWeight: "700",
      textAlign: "center",
      color: colors.text,
    },

    locationImages: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginVertical: 30,
    },

    locationBox: {
      alignItems: "center",
    },

    locationEmoji: {
      fontSize: 48,
    },

    locationLabel: {
      marginTop: 10,
      fontSize: 16,
      color: colors.text,
    },

    permissionAction: {
      textAlign: "center",
      color: colors.primary,
      fontSize: 18,
      fontWeight: "700",
      paddingVertical: 15,
    },

    permissionDeny: {
      textAlign: "center",
      color: colors.secondaryText,
      fontSize: 18,
      paddingVertical: 15,
    },

    locationDesc: {
      fontSize: 16,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 24,
      marginTop: 20,
      marginBottom: 30,
    },

    permissionButton: {
      height: 50,
      backgroundColor: colors.primary,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 13,
    },

    permissionButtonText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "700",
    },

    background: {
      minHeight: "100%",
    },

    emailInput: {
      flex: 1,
      paddingHorizontal: 20,
      fontSize: 18,
      color: colors.text,
    },

    languageChange: {
      alignSelf: "flex-end",
      marginBottom: 15,
    },

    languageChangeText: {
      color: colors.primary,
      fontSize: 17,
      fontWeight: "700",
    },
  });
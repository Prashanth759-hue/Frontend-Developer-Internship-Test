import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAppStore } from "../store/appStore";
import { THEMES } from "../constants/colors";

export default function ProofOfLoadScreen() {
    const { theme, setTheme } =
    useAppStore();
  
    const colors =
      theme === "dark"
        ? THEMES.dark
        : THEMES.light;
    const styles = createStyles(colors);
    const {
  setDocumentType,
  proofLoadUploaded,
  proofLoadImage,
} = useAppStore();
  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}

      <TouchableOpacity
        onPress={() => router.back()}
      >
        <Text style={styles.backButton}>
          ← Back
        </Text>
      </TouchableOpacity>

      <Text style={styles.heading}>
        Proof of Load
      </Text>

      <Text style={styles.subHeading}>
        Upload at least one photo before starting the trip.
      </Text>

      {/* Upload Card */}

      <View style={styles.uploadCard}>

        {proofLoadUploaded ? (

        <Image
        source={{
        uri: proofLoadImage,
        }}
        style={styles.previewImage}
        />

        ) : (

        <>

        <Text style={styles.uploadIcon}>
        📷
        </Text>

        <Text style={styles.uploadTitle}>
        No photo selected
        </Text>

        <Text style={styles.uploadSub}>
        Upload a clear picture of the loaded goods.
        </Text>

        </>

        )}

      </View>


  {/* Camera */}

<TouchableOpacity
  style={styles.cameraCard}
    onPress={() => {

    setDocumentType("proofLoad");

    router.push("/kyc/camera");

    }}
  >

<Text style={styles.cameraEmoji}>
  📷
</Text>

    <Text style={styles.optionText}>
      Camera
    </Text>

  </TouchableOpacity>


      {/* Info */}

      <Text style={styles.infoText}>
        Minimum 1 photo is required to continue.
      </Text>

      {/* Continue */}

<TouchableOpacity
  style={styles.continueButton}
  onPress={() => {

    if (!proofLoadUploaded) {

      Alert.alert(
        "Upload Required",
        "Please upload a proof of load photo before continuing."
      );

      return;
    }

    router.replace("/trip-progress?step=4");

  }}
>
  <Text style={styles.continueText}>
    Continue
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
      padding: 20,
    },

    backButton: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.primary,
      marginTop: 20,
    },

    heading: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.text,
      marginTop: 20,
    },

    subHeading: {
      fontSize: 16,
      color: colors.secondaryText,
      marginTop: 10,
      marginBottom: 30,
    },

    uploadCard: {
      height: 220,
      backgroundColor: colors.card,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },

    uploadIcon: {
      fontSize: 60,
    },

    uploadTitle: {
      fontSize: 22,
      fontWeight: "700",
      marginTop: 15,
      color: colors.text,
    },

    uploadSub: {
      marginTop: 10,
      fontSize: 15,
      color: colors.secondaryText,
      textAlign: "center",
      paddingHorizontal: 25,
    },

    cameraEmoji: {
      fontSize: 45,
    },

    cameraButton: {
      marginTop: 30,
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 18,
      alignItems: "center",
    },

    cameraText: {
      fontSize: 18,
      fontWeight: "700",
      color: "#FFFFFF",
    },

    galleryButton: {
      marginTop: 15,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 16,
      borderRadius: 18,
      alignItems: "center",
      backgroundColor: colors.card,
    },

    galleryText: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },

    infoText: {
      marginTop: 20,
      fontSize: 15,
      textAlign: "center",
      color: "#EF4444",
    },

    continueButton: {
      position: "absolute",
      left: 20,
      right: 20,
      bottom: 35,
      backgroundColor: colors.primary,
      paddingVertical: 18,
      borderRadius: 20,
      alignItems: "center",
    },

    continueText: {
      fontSize: 18,
      fontWeight: "700",
      color: "#FFFFFF",
    },

    previewImage: {
      width: 180,
      height: 180,
      borderRadius: 18,
      resizeMode: "cover",
    },

    cameraCard: {
      width: "60%",
      alignSelf: "center",
      backgroundColor: colors.card,
      borderRadius: 18,
      paddingVertical: 20,
      alignItems: "center",
      marginTop: 30,
      borderWidth: 1,
      borderColor: colors.border,
    },

    optionIcon: {
      width: 45,
      height: 45,
      resizeMode: "contain",
    },

    optionText: {
      marginTop: 10,
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
    },
  });
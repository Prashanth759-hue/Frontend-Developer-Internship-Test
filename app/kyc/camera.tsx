import React, { useEffect, useRef, useState, } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Text,
  TextInput,
  Linking,
} from "react-native";import { CameraView,useCameraPermissions, } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router }from "expo-router";
import { useAppStore } from "../../store/appStore";

export default function CameraScreen() {
const {

documentType,

setAadhaarUploaded,
setPanUploaded,

setDlUploaded,
setRcUploaded,
setInsuranceUploaded,
setVehiclePhotoUploaded,

setProofLoadUploaded,
setProofUnloadUploaded,

setProofLoadImage,
setProofUnloadImage,

setSelfieUri,

} = useAppStore();

  const cameraRef =
    useRef<any>(null);

  const [
    permission,
    requestPermission,
  ] =
    useCameraPermissions();

  const [
    image,
    setImage,
  ] = useState<string | null>(
    null
  );

  const [captureStep, setCaptureStep] =
  useState(1);

  useEffect(() => {
    if (!permission) return;

    if (
      !permission.granted
    ) {
      requestPermission();
    }
  }, [permission]);

  const capturePhoto =
  async () => {
    if (!cameraRef.current)
      return;

    const photo =
      await cameraRef.current.takePictureAsync();

    setImage(photo.uri);
  };

  const openGallery =
    async () => {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        });

      if (
        !result.canceled
      ) {
        setImage(
          result.assets[0].uri
        );
      }
    };

    if (!permission?.granted) {
      return (
        <View style={styles.center}>

          <Text style={styles.permissionTitle}>
            Camera access needed to upload documents.
          </Text>

          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.permissionButtonText}>
              Open Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.galleryPermissionButton}
            onPress={openGallery}
          >
            <Text style={styles.galleryPermissionText}>
              Use Gallery Instead
            </Text>
          </TouchableOpacity>

        </View>
      );
    }

  return (
    <View
      style={
        styles.container
      }
    >
      {!image ? (
        <>
          <CameraView
  ref={cameraRef}
  style={styles.camera}
  facing={
    documentType === "selfie"
      ? "front"
      : "back"
  }
/>
          <Text
  style={{
    position: "absolute",
    top: 55,
    alignSelf: "center",
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  }}
>
  {
documentType === "aadhaar"
? captureStep === 1
? "Capture Aadhaar Front"
: "Capture Aadhaar Back"

: documentType === "pan"
? captureStep === 1
? "Capture PAN Front"
: "Capture PAN Back"

: documentType === "dl"
? captureStep === 1
? "Capture Driving Licence Front"
: "Capture Driving Licence Back"

: documentType === "rc"
? captureStep === 1
? "Capture Vehicle RC Front"
: "Capture Vehicle RC Back"

: documentType === "insurance"
? captureStep === 1
? "Capture Insurance Front"
: "Capture Insurance Back"

: documentType === "vehiclePhoto"
? "Capture Vehicle Photo"

: documentType === "selfie"
? "Take Selfie"

: ""
}
</Text>
          <View
            style={
              styles.bottomBar
            }
          >
            <TouchableOpacity
  onPress={openGallery}
>
  <Image
    source={require(
      "../../assets/icons/gallery.png"
    )}
    style={{
      width: 56,
      height: 56,
    }}
    resizeMode="contain"
  />
</TouchableOpacity>

            <TouchableOpacity
              style={
                styles.captureOuter
              }
              onPress={
                capturePhoto
              }
            >
              <View
                style={
                  styles.captureInner
                }
              />
            </TouchableOpacity>

            <View
              style={{
                width: 40,
              }}
            />
          </View>
        </>
      ) : (
        <>
          <Image
            source={{
              uri: image,
            }}
            style={
              styles.preview
            }
          />

          <View
            style={
              styles.previewActions
            }
          >
            <TouchableOpacity
              style={
                styles.retakeBtn
              }
              onPress={() =>
                setImage(
                  null
                )
              }
            >
              <Text
                style={
                  styles.btnText
                }
              >
                Retake
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.useBtn
              }
             onPress={() => {

if (documentType === "aadhaar") {

if (captureStep === 1) {
setImage(null);
setCaptureStep(2);
return;
}

setAadhaarUploaded(true);
router.back();
return;

}

if (documentType === "pan") {

if (captureStep === 1) {
setImage(null);
setCaptureStep(2);
return;
}

setPanUploaded(true);
router.back();
return;

}

if (documentType === "dl") {

if (captureStep === 1) {
setImage(null);
setCaptureStep(2);
return;
}

setDlUploaded(true);
router.back();
return;

}

if (documentType === "rc") {

if (captureStep === 1) {
setImage(null);
setCaptureStep(2);
return;
}

setRcUploaded(true);
router.back();
return;

}

if (documentType === "insurance") {

if (captureStep === 1) {
setImage(null);
setCaptureStep(2);
return;
}

setInsuranceUploaded(true);
router.back();
return;

}

if (documentType === "vehiclePhoto") {

setVehiclePhotoUploaded(true);

router.back();

return;

}

if (documentType === "proofLoad") {

setProofLoadUploaded(true);

setProofLoadImage(image!);

router.back();

return;

}

if (documentType === "proofUnload") {

setProofUnloadUploaded(true);

setProofUnloadImage(image!);

router.back();

return;

}

if (documentType === "selfie") {

setSelfieUri(image!);

router.back();

return;

}

}}
            >
              <Text style={styles.btnText}>
               {(documentType === "aadhaar" ||
                documentType === "pan" ||
                documentType === "dl" ||
                documentType === "rc" ||
                documentType === "insurance"
                )
                 ? captureStep === 1
                 ? "Back Photo"
                 : "Done"
                 : "Done"}
             </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#000",
    },

    camera: {
      flex: 1,
    },

    bottomBar: {
      height: 220,
      backgroundColor:
        "#000",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-around",
    },

    gallery: {
      fontSize: 34,
      color:
        "#FFFFFF",
    },

    captureOuter: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 5,
      borderColor:
        "#FFFFFF",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    captureInner: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor:
        "#FFFFFF",
    },

    preview: {
      flex: 1,
    },

    previewActions: {
      height: 190,
      backgroundColor:
        "#000",
      flexDirection:
        "row",
      justifyContent:
        "space-evenly",
      alignItems:
        "center",
    },

    retakeBtn: {
      backgroundColor:
        "#444",
      paddingHorizontal:
        30,
      paddingVertical:
        12,
      borderRadius: 12,
    },

    useBtn: {
      backgroundColor:
        "#FF7A00",
      paddingHorizontal:
        30,
      paddingVertical:
        12,
      borderRadius: 12,
    },

    btnText: {
      color:
        "#FFFFFF",
      fontWeight:
        "500",
    },

    center: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    permissionTitle: {
  fontSize: 18,
  fontWeight: "600",
  color: "#111827",
  textAlign: "center",
  marginBottom: 30,
  paddingHorizontal: 30,
},

permissionButton: {
  backgroundColor: "#FF7A00",
  paddingVertical: 15,
  paddingHorizontal: 35,
  borderRadius: 14,
  marginBottom: 15,
},

permissionButtonText: {
  color: "#FFFFFF",
  fontWeight: "700",
  fontSize: 16,
},

galleryPermissionButton: {
  borderWidth: 1,
  borderColor: "#FF7A00",
  paddingVertical: 15,
  paddingHorizontal: 35,
  borderRadius: 14,
},

galleryPermissionText: {
  color: "#FF7A00",
  fontWeight: "700",
  fontSize: 16,
},
  });
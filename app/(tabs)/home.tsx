import React, { useState,useEffect, } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  Alert,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useLocalSearchParams } from "expo-router";
import { translations } from "../language/translations";
import { useAppStore } from "../../store/appStore"; //for database
import { THEMES } from "../../constants/colors";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const {  language, locationPermission, selfieUri,  theme,} = useAppStore(); //for database

  console.log("Current Language:", language);
  const t = translations[ language as keyof typeof translations] || translations.en;
  const [ showLocation,setShowLocation,] = useState(false);
  const [online, setOnline] = useState(false);
  const [tripRequest, setTripRequest] = useState(false);
  const translateX =  useSharedValue(0);
  const [hasTrip, setHasTrip] = useState(false);
  const [timer, setTimer] = useState(10);
  const params = useLocalSearchParams();
  const [orderPreference, setOrderPreference] = useState("both");
  // Demo (later backend will control this)
  const [tripActive, setTripActive] = useState(false);
  // Demo vehicle type (later comes from backend) here we can change truck and test .onyl for testign purpose.
  const [vehicleType] = useState< "bike" | "scooty" | "auto" | "cab" | "truck"  >("bike");
const colors =
  theme === "dark"
    ? THEMES.dark
    : THEMES.light;

const styles = createStyles(colors);
  useEffect(() => {
  if (
    locationPermission ===
    "denied"
  ) {
    setShowLocation(true);
  }
}, [locationPermission]);


  useEffect(() => {
  let countdown: ReturnType<typeof setInterval>;

  if (tripRequest) {
    setTimer(10);

    countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setTripRequest(false); // hide modal
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return () => {
    clearInterval(countdown);
  };
}, [tripRequest]);

  useEffect(() => {
  let timer: ReturnType<typeof setTimeout>;

  if (online) {
    setTripRequest(false);

    timer = setTimeout(() => {
      setTripRequest(true);
    }, 5000);
  } else {
    setTripRequest(false);
  }

  return () => { clearTimeout(timer); };
}, [online]);

  const MAX_SLIDE = 220;
  const gesture =
  Gesture.Pan()
    .onUpdate((e) => {
        if (!online) {
            translateX.value = Math.max(
            0,
            Math.min(e.translationX, MAX_SLIDE)
            );
        } else {
            translateX.value = Math.max(
            0,
             Math.min(
            MAX_SLIDE + e.translationX,
            MAX_SLIDE
            )
            );
        }
    })

    .onEnd(() => {
        if (!online) {
        if (translateX.value > MAX_SLIDE / 2) {
            translateX.value = withTiming(MAX_SLIDE);
            runOnJS(setOnline)(true);
        } else {
            translateX.value = withTiming(0);
        }
        } else {
        if (translateX.value < MAX_SLIDE / 2) {
            translateX.value = withTiming(0);
            runOnJS(setOnline)(false);
        } else {
            translateX.value = withTiming(MAX_SLIDE);
        }
        }
    });

    const truckStyle =
  useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          translateX.value,
      },
    ],
  }));
  
  return (
    <SafeAreaView style={styles.container}>
      
        <LinearGradient
          colors={["#FF7A00", "#FF9A2F"]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{t.goodMorning} ☀️</Text>
              <Text style={styles.name}>Harish</Text>
              <Text style={styles.driverId}>
                Driver ID : VH360-1023
              </Text>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  ✓ {t.verifiedDriver}
                </Text>
              </View>
            </View>

            <View style={styles.rightIcons}>
              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() => router.push("/notifications")}
              >
                <Text style={styles.icon}>🔔</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.profileCircle}>

                {selfieUri ? (

                  <Image
                    source={{ uri: selfieUri }}
                    style={styles.profileImage}
                  />

                ) : (

<TouchableOpacity style={styles.profileCircle}>
  <Image
    source={
      selfieUri
        ? { uri: selfieUri }
        : require("../../assets/icons/profile.png")
    }
    style={styles.profileImage}
  />
</TouchableOpacity>

                )}

              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <Svg
          width={width}
          height={180}
          viewBox={`0 0 ${width} 180`}
          style={styles.wave}
        >
          <Path
              fill={colors.background}
            d={`
              M0,140
              C90,80 180,40 280,60
              C420,90 520,150 ${width},120
              C${width + 50},110 ${width + 50},110 ${width},180
              L0,180
              Z
            `}
          />
        </Svg>
        <View style={[styles.sliderCard,
          {
            backgroundColor: online
              ? "#DCFCE7"
              : "#FFF7ED",
            borderColor: online
              ? "#BBF7D0"
              : "#FDBA74",
          },
        ]}
        >
  {/* Slider */}
  <View
    style={[
      styles.track,
      {
        backgroundColor: online
          ? "#F0FDF4"
          : "#FFF7ED",
        borderColor: online
          ? "#BBF7D0"
          : "#FDBA74",
      },
    ]}
  >
    <Text
      style={{
        position: "absolute",
        left: online ? 20 : undefined,
        right: online ? undefined : 20,
        fontSize: 22,
        fontWeight: "700",
        color: online
          ? "#22C55E"
          : "#F97316",
      }}
    >
      {online ? "<<<" : ">>>"}
    </Text>

    <View
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        borderTopWidth: 2,
        borderStyle: "dashed",
        borderColor: online
          ? "#22C55E"
          : "#F97316",
      }}
    />

    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.truckBox,
          truckStyle,
        ]}
      >
        <Image
          source={
            online
              ? require("../../assets/images/truck-left.png")
              : require("../../assets/images/truck-right.png")
          }
          style={styles.truckImage}
        />
      </Animated.View>
    </GestureDetector>
  </View>

  {/* Text BELOW slider */}
  <Text
    style={[
      styles.statusTitle,
      {
        color: online
          ? "#16A34A"
          : "#EA580C",
      },
    ]}
  >
    {online ? "ONLINE" : "GO ONLINE"}
  </Text>

  <Text style={styles.statusSub}>
    {online
      ? "Waiting for trips..."
      : "Slide to the right to go online"}
  </Text>

  <Text style={styles.statusHint}>
    {online
      ? "Slide to the left to go offline"
      : ""}
  </Text>
</View>

  <ScrollView showsVerticalScrollIndicator={false}>
    {online && !tripRequest && (
  <View style={styles.waitingCard}>
    <Text style={styles.waitingTitle}>
      No trips available right now.
    </Text>

    <Text style={styles.waitingSub}>
      We'll notify you when a new trip arrives.
    </Text>
  </View>
)}
    <View style={styles.topCardsRow}>
      <TouchableOpacity
  style={styles.walletCard}
  onPress={() =>
    router.push("/wallet")
  }
>
  <Text style={styles.cardIcon}>💰</Text>

    <Text style={styles.cardTitle}>
      {t.wallet}
    </Text>

    <Text style={styles.cardAmount}>
      ₹520
    </Text>
</TouchableOpacity>
<TouchableOpacity
  style={styles.bonusCard}
  onPress={() =>
    router.push("/incentives")
  }
>
    <Text style={styles.cardIcon}>🏆</Text>

    <Text style={styles.cardTitle}>
      {t.bonus}
    </Text>

    <Text style={styles.cardAmount}>
      ₹120
    </Text>

</TouchableOpacity>
  
</View>

<View style={styles.documentCard}>
  <Text style={styles.documentText}>
    ⚠ {t.dlExpiry}
  </Text>
</View>

<View style={styles.announcementCard}>
  <Text style={styles.announcementText}>
    📢 {t.announcement}
  </Text>
</View>

{/* bike ride type */}
{vehicleType === "bike" && (
<View style={styles.orderCard}>
  <View style={styles.orderHeader}>
    <Text style={styles.orderTitle}>
      🚕 Order Preference
    </Text>

    <Text style={styles.orderArrow}>
      ›
    </Text>
  </View>

  <View style={styles.orderRow}>

    <TouchableOpacity
      style={[
        styles.smallBox,
        orderPreference === "rides" &&
          styles.selectedBox,
      ]}
      onPress={() => {

        if (tripActive) {

          Alert.alert(
            "Cannot change order preference",
            "Finish your current trip before changing your order preference."
          );

          return;
        }

        setOrderPreference("rides");

      }}>
      <Text style={styles.smallTitle}>
        🚕
      </Text>

      <Text
        style={[
          styles.smallText,
          orderPreference === "rides" && {
            color: "#FFFFFF",
          },
        ]}
      >
        Rides
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.smallBox,
        orderPreference === "parcels" &&
          styles.selectedBox,
      ]}
      onPress={() => {

        if (tripActive) {

          Alert.alert(
            "Cannot change order preference",
            "Finish your current trip before changing your order preference."
          );

          return;
        }

        setOrderPreference("parcels");

      }}>

      <Text style={styles.smallTitle}>
        📦
      </Text>

      <Text
        style={[
          styles.smallText,
          orderPreference === "parcels" && {
            color: "#FFFFFF",
          },
        ]}
      >
        Parcels
      </Text>
    </TouchableOpacity>

  </View>

    <TouchableOpacity
      style={[
        styles.bothBox,
        orderPreference === "both" &&
          styles.selectedBox,
      ]}
      onPress={() => {

        if (tripActive) {

          Alert.alert(
            "Cannot change order preference",
            "Finish your current trip before changing your order preference."
          );

          return;
        }

        setOrderPreference("both");

      }}>
      <Text style={styles.smallTitle}>
        🔄
      </Text>

      <Text
        style={[
          styles.smallText,
          orderPreference === "both" && {
            color: "#FFFFFF",
          },
        ]}
      >
        Both
      </Text>
    </TouchableOpacity>

</View>
)}
</ScrollView>

<Modal
  visible={tripRequest}
  transparent
  animationType="slide"
>
  <View style={styles.modalOverlay}>
    <View style={styles.orderModal}>

      <View style={styles.dragBar} />

      <View style={styles.sheetTop}>
        <Text style={styles.requestBadge}>
          📦 Parcel • Hyperlocal
        </Text>

        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>
            {timer}
          </Text>
        </View>
      </View>

      <Text style={styles.requestAmount}>
        ₹118
      </Text>

      <Text style={styles.requestInfo}>
        you earn • 6.8 km • ~18 min
      </Text>

      <View style={styles.locationCard}>
        <Text style={styles.pickupText}>
          {t.pickup}
        </Text>

        <Text style={styles.addressText}>
          BDA Complex, HSR Layout
        </Text>

        <Text style={styles.dropText}>
          {t.drop}
        </Text>

        <Text style={styles.addressText}>
          Embassy Tech Village, ORR
        </Text>
      </View>

      <View style={styles.buttonRow}>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => {
         router.push("/trip-progress")
            setTripRequest(false);
            setHasTrip(true);
            setTimer(10);

            // later
            // router.push("/trip-progress");
          }}
        >
          <Text style={styles.acceptText}>
            ✓ {t.accept}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  </View>
</Modal>

{/* bottom navigation */}
<View style={styles.bottomNav}>
  <TouchableOpacity style={styles.navItem}>
    <Image
      source={require("../../assets/icons/home.png")}
      style={styles.navIcon}
    />
    <Text style={styles.activeText}>{t.home}</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.navItem}
    onPress={() =>
    router.push("/(tabs)/earnings")
  }
  >
    <Image
      source={require("../../assets/icons/earnings.png")}
      style={styles.navIcon}
    />
    <Text style={styles.inactiveText}>{t.earnings}</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.navItem}
    onPress={() =>
    router.push("/(tabs)/trips")
    }
  >
    <Image
      source={require("../../assets/icons/trips.png")}
      style={styles.navIcon}
    />
    <Text style={styles.inactiveText}>{t.trips}</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.navItem}
     onPress={() =>
    router.push("/(tabs)/profile")
    }
  >
    <Image
      source={require("../../assets/icons/profile.png")}
      style={styles.navIcon}
    />
    <Text style={styles.inactiveText}>{t.profile}</Text>
  </TouchableOpacity>
</View>

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
        Location Required
      </Text>

      <Text
        style={styles.locationDesc}
      >
        Please allow location access
        to receive nearby trips and
        navigation.
      </Text>

      <TouchableOpacity
        style={styles.permissionButton}
        onPress={() => {
          setShowLocation(false);
        }}
      >
        <Text
          style={
            styles.permissionButtonText
          }
        >
            Allow
        </Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>
</SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    header: {
      height: 300,
      paddingTop: 50,
      paddingHorizontal: 25,
    },

    headerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    greeting: {
      color: "#FFFFFF",
      fontSize: 16,
    },

    name: {
      color: "#FFFFFF",
      fontSize: 34,
      fontWeight: "700",
      marginTop: 8,
    },

    driverId: {
      color: "#FFFFFF",
      fontSize: 16,
      marginTop: 8,
    },

    badge: {
      marginTop: 16,
      backgroundColor: "rgba(255,255,255,0.25)",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: "flex-start",
    },

    badgeText: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 13,
    },

    rightIcons: {
      flexDirection: "row",
    },

    iconCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },

    profileCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },

    icon: {
      fontSize: 18,
    },

    profileText: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.primary,
    },

    wave: {
      position: "absolute",
      top: 140,
      left: 0,
    },

    onlineCard: {
      marginHorizontal: 20,
      marginTop: -20,
      borderRadius: 30,
      paddingVertical: 22,
      paddingHorizontal: 20,
      elevation: 8,
      backgroundColor: colors.card,
    },

    slideArrow: {
      textAlign: "center",
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
    },

    onlineTitle: {
      textAlign: "center",
      fontSize: 26,
      fontWeight: "700",
      marginTop: 15,
      color: colors.text,
    },

    onlineSub: {
      textAlign: "center",
      fontSize: 15,
      color: colors.secondaryText,
      marginTop: 6,
    },

    onlineHint: {
      textAlign: "center",
      fontSize: 13,
      color: colors.secondaryText,
      marginTop: 6,
    },

    sliderCard: {
      marginHorizontal: 20,
      marginTop: -20,
      backgroundColor: colors.card,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      paddingTop: 10,
      paddingBottom: 14,
      paddingHorizontal: 14,
      alignItems: "center",
    },

    track: {
      width: 300,
      height: 55,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      overflow: "hidden",
      backgroundColor: colors.background,
    },

    truckBox: {
      position: "absolute",
      left: 12,
      top: 7,
    },

    truckImage: {
      width: 66,
      height: 60,
      resizeMode: "contain",
    },

    statusTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1FA53A",
      marginTop: 20,
    },

    statusSub: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.secondaryText,
      marginTop: 5,
    },

    statusHint: {
      fontSize: 12,
      color: colors.secondaryText,
      marginTop: 3,
      marginBottom: 5,
    },

    bottomNav: {
      height: 80,
      backgroundColor: colors.card,
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 5,
    },

    navItem: {
      alignItems: "center",
      flex: 1,
    },

    navIcon: {
      width: 40,
      height: 40,
      resizeMode: "contain",
      tintColor: colors.secondaryText,
    },

    activeText: {
      color: colors.primary,
      fontSize: 12,
      marginTop: -6,
      fontWeight: "700",
    },

    inactiveText: {
      color: colors.secondaryText,
      fontSize: 12,
      marginTop: -6,
    },

    dashboardCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: 12,
      borderRadius: 22,
      padding: 20,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },

    dashboardTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 18,
    },

    dashboardRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
    },

    dashboardLabel: {
      fontSize: 15,
      color: colors.text,
      fontWeight: "600",
    },

    dashboardValue: {
      fontSize: 15,
      color: colors.primary,
      fontWeight: "700",
    },

    divider: {
      height: 1,
      backgroundColor: colors.border,
    },

    topCardsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginHorizontal: 20,
      marginTop: 15,
    },

    walletCard: {
      width: "48%",
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      elevation: 4,
    },

    bonusCard: {
      width: "48%",
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },

    cardIcon: {
      fontSize: 28,
    },

    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginTop: 10,
      color: colors.text,
    },

    cardAmount: {
      fontSize: 28,
      fontWeight: "700",
      marginTop: 10,
      color: colors.primary,
    },

        documentCard: {
      marginHorizontal: 20,
      marginTop: 15,
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },

    documentText: {
      color: colors.text,
      fontSize: 15,
    },

    announcementCard: {
      marginHorizontal: 20,
      marginTop: 15,
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },

    announcementText: {
      color: colors.text,
      fontSize: 15,
    },

    tripCard: {
      marginHorizontal: 20,
      marginTop: 15,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },

    tripTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },

    tripText: {
      marginTop: 8,
      fontSize: 15,
      color: colors.secondaryText,
    },

    tripButton: {
      marginTop: 15,
      backgroundColor: "#16A34A",
      paddingVertical: 12,
      borderRadius: 15,
      alignItems: "center",
    },

    tripButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },

    sosButton: {
      position: "absolute",
      right: 20,
      bottom: 95,
      width: 65,
      height: 65,
      borderRadius: 32.5,
      backgroundColor: "#EF4444",
      justifyContent: "center",
      alignItems: "center",
      elevation: 10,
    },

    sosText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 16,
    },

    waitingCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      elevation: 3,
    },

    waitingTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: "#16A34A",
    },

    waitingSub: {
      fontSize: 14,
      color: colors.secondaryText,
      marginTop: 10,
    },

    requestCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 25,
      padding: 20,
      elevation: 6,
    },

    requestBadge: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "700",
    },

    requestAmount: {
      fontSize: 52,
      fontWeight: "700",
      color: colors.primary,
      marginTop: 20,
    },

    requestInfo: {
      fontSize: 18,
      color: colors.secondaryText,
      marginTop: 10,
    },

    locationCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      marginTop: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },

    pickupText: {
      color: colors.secondaryText,
      fontWeight: "700",
      marginTop: 10,
    },

    addressText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
      marginTop: 8,
    },

    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 25,
    },

    rejectButton: {
      width: "38%",
      backgroundColor: "#1F2937",
      paddingVertical: 18,
      borderRadius: 20,
      alignItems: "center",
    },

    acceptButton: {
      width: "58%",
      backgroundColor: colors.primary,
      paddingVertical: 18,
      borderRadius: 20,
      alignItems: "center",
    },

    rejectText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "700",
    },

    acceptText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "700",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.25)",
      justifyContent: "flex-end",
    },

    orderModal: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 35,
      borderTopRightRadius: 35,
      paddingHorizontal: 20,
      padding: 20,
      paddingBottom: 10,
      paddingTop: 10,
    },

    dragBar: {
      width: 90,
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 10,
      alignSelf: "center",
      marginBottom: 8,
    },

    sheetTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    timerCircle: {
      width: 58,
      height: 58,
      borderRadius: 29,
      borderWidth: 6,
      borderColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },

    timerText: {
      color: colors.primary,
      fontSize: 28,
      fontWeight: "700",
    },

    dropText: {
      color: colors.primary,
      fontWeight: "700",
      fontSize: 14,
      marginTop: 20,
    },

    permissionOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },

    permissionCard: {
      width: "85%",
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 25,
      alignItems: "center",
    },

    permissionTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
      marginBottom: 15,
    },

    locationDesc: {
      fontSize: 16,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 25,
    },

    permissionButton: {
      width: "100%",
      height: 55,
      backgroundColor: colors.primary,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },

    permissionButtonText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "700",
    },

    profileImage: {
      width: "100%",
      height: "100%",
      borderRadius: 100,
      resizeMode: "cover",
    },

    orderCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: 18,
      borderRadius: 20,
      padding: 18,
      elevation: 4,
    },

    orderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
    },

    orderTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },

    orderArrow: {
      fontSize: 24,
      color: colors.secondaryText,
    },

    orderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    smallBox: {
      width: "47%",
      backgroundColor: colors.card,
      paddingVertical: 18,
      borderRadius: 15,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },

    bothBox: {
      marginTop: 15,
      backgroundColor: colors.card,
      paddingVertical: 18,
      borderRadius: 15,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },

    smallTitle: {
      fontSize: 24,
    },

    smallText: {
      marginTop: 8,
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },

    selectedBox: {
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.primary,
    },
  });
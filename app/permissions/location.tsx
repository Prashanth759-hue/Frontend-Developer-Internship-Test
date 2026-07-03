import { View, Text, Button, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useAppStore } from "../../store/appStore";

export default function LocationScreen() {
  const {
  setLocationPermission,
} = useAppStore();

  const requestLocation = async () => {
const { status } =
await Location.requestForegroundPermissionsAsync();

console.log("STATUS:", status);

if (status === "granted") {
setLocationPermission(
"granted"
);


router.replace(
  "/auth/login"
);


} else {
setLocationPermission(
"denied"
);


console.log(
  "Permission Denied"
);

router.replace(
  "/auth/login"
);


}
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Allow Location Access
      </Text>

      <Text style={styles.subtitle}>
        Vahan360 needs your location to provide nearby trips and navigation.
      </Text>

      <Button
        title="Allow Location"
        onPress={requestLocation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 15,
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
});
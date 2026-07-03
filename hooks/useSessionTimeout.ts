import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";

export function useSessionTimeout(timeout = 300000) { // 5 minutes

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetSessionTimer = () => {

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {

      Alert.alert(
        "Session Expired",
        "Your session has expired due to inactivity.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/auth/login");
            //   router.replace("/kyc/aadhaar");  from hwere u want u can add.
            //   router.replace(lastCompletedStep);
            },
          },
        ]
      );

    }, timeout);

  };

  useEffect(() => {

    resetSessionTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };

  }, []);

  return { resetSessionTimer };
}
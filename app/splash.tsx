import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { router } from "expo-router";

export default function Splash() {
  const fade = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      router.replace("/auth/login");
    }, 2300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.Image
      source={require(
        "../assets/images/splash2.png"
      )}
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        opacity: fade,
      }}
      resizeMode="cover"
    />
  );
}
import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';

const SPLASH_DURATION = 2200; // 2.2 seconds, counted from when the image is actually visible

export default function SplashIndex() {
  const [imageReady, setImageReady] = useState(false);

  // Only start the visible countdown once the image has actually painted,
  // so a slow asset fetch (e.g. Expo Go pulling it from the dev server)
  // can never cause the splash to be skipped.
  useEffect(() => {
    if (!imageReady) return;
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [imageReady]);

  const handleImageReady = useCallback(() => setImageReady(true), []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/index.png')}
        style={styles.image}
        resizeMode="cover"
        onLoadEnd={handleImageReady}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
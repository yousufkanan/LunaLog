import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Animated, Image } from "react-native";
import * as SplashScreen from "expo-splash-screen";

// keep splash visible until manually hidden
SplashScreen.preventAutoHideAsync();

export default function AnimatedSplashScreen({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const [animationDone, setAnimationDone] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }).start(() => setAnimationDone(true));
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (animationDone) {
      SplashScreen.hideAsync();
      onFinish();
    }
  }, [animationDone]);

  return (
    <View style={styles.container}>
      {!animationDone && (
        <Animated.View style={[styles.splashContainer, { opacity }]}>
          <Image
            source={require("../assets/splash.png")}
            style={styles.splashImage}
            resizeMode="contain"
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  splashImage: {
    width: 220,
    height: 220,
  },
});

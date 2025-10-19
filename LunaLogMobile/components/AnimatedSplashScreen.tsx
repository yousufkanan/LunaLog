import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import * as SplashScreen from "expo-splash-screen";

// Keep splash visible until manually hidden
SplashScreen.preventAutoHideAsync();

export default function AnimatedSplashScreen({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hide native splash immediately
    SplashScreen.hideAsync();

    // Create the animation sequence
    Animated.sequence([
      // Fade in + spin
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
      // Hold
      Animated.delay(500),
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  }, []);

  // Interpolate rotation value to degrees
  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.splashContainer,
          {
            opacity,
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <Animated.Image
          source={require("../assets/images/splash-icon.png")}
          style={styles.splashImage}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  splashImage: {
    width: 220,
    height: 220,
  },
});

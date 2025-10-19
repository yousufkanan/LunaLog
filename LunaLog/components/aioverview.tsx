import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Animated,
  ScrollView,
  Pressable,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";

type AIOverviewScreenProps = {
  onReset: () => void;
  aiOverviewLines?: string[];
};

export default function AIOverviewScreen({
  onReset,
  aiOverviewLines = [
    "• Today's reflection shows a balanced emotional journey with genuine moments of contentment",
    "• You demonstrated resilience and adaptability when facing challenges that tested your patience",
    "• Creative tasks and meaningful conversations brought you the most satisfaction",
    "• Your responses indicate strong self-awareness and emotional intelligence",
    "• Consider maintaining this reflective practice to support your mental well-being and personal growth",
  ],
}: AIOverviewScreenProps) {
  const [typedOverviewTitle, setTypedOverviewTitle] = useState("");
  const [showFullText, setShowFullText] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  // Line-by-line animation refs
  const line1Opacity = useRef(new Animated.Value(0)).current;
  const line2Opacity = useRef(new Animated.Value(0)).current;
  const line3Opacity = useRef(new Animated.Value(0)).current;
  const line4Opacity = useRef(new Animated.Value(0)).current;
  const line5Opacity = useRef(new Animated.Value(0)).current;

  const colorScheme = useColorScheme();
  const overviewTitle = "AI Overview";

  // Typing effect for AI Overview title
  useEffect(() => {
    // Fade in the header container first
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= overviewTitle.length) {
        setTypedOverviewTitle(overviewTitle.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
        // After typing completes, start showing text line by line
        setShowFullText(true);
      }
    }, 80);

    return () => clearInterval(typingInterval);
  }, []);

  // Line-by-line fade animation
  useEffect(() => {
    if (!showFullText) return;

    const lineOpacities = [
      line1Opacity,
      line2Opacity,
      line3Opacity,
      line4Opacity,
      line5Opacity,
    ];

    // Animate each line sequentially
    Animated.stagger(
      500,
      lineOpacities.slice(0, aiOverviewLines.length).map((opacity) =>
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        })
      )
    ).start(() => {
      // After all lines fade in, show the footer
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });
  }, [showFullText, aiOverviewLines.length]);

  const lineOpacities = [
    line1Opacity,
    line2Opacity,
    line3Opacity,
    line4Opacity,
    line5Opacity,
  ];

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView
        style={{
          paddingTop: Platform.OS === "android" ? 48 : 64,
          paddingHorizontal: 20,
          paddingBottom: 12,
        }}
      >
        <Pressable onPress={onReset}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">LunaLog</ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
      >
        {/* Header with typing effect */}
        <Animated.View style={{ opacity: headerOpacity, marginBottom: 40 }}>
          <ThemedText
            style={{
              fontSize: 32,
              fontWeight: "700",
              textAlign: "center",
              color: colorScheme === "dark" ? "#ddd" : "#555",
              paddingTop: 20,
            }}
          >
            {typedOverviewTitle}
            {typedOverviewTitle.length < overviewTitle.length && (
              <ThemedText style={{ color: "#007AFF" }}>|</ThemedText>
            )}
          </ThemedText>
        </Animated.View>

        {/* AI Generated Text - Bullet points revealing line by line */}
        <ThemedView
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: 4,
          }}
        >
          {aiOverviewLines.map((line, index) => (
            <Animated.View
              key={index}
              style={{
                opacity: lineOpacities[index] || 0,
                marginBottom: 20,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 17,
                  lineHeight: 28,
                  color: colorScheme === "dark" ? "#ccc" : "#444",
                  textAlign: "left",
                }}
              >
                {line}
              </ThemedText>
            </Animated.View>
          ))}
        </ThemedView>

        {/* Footer */}
        <Animated.View
          style={{
            opacity: footerOpacity,
            marginTop: 80,
            alignItems: "center",
            paddingBottom: 100,
          }}
        >
          <ThemedText
            style={{
              fontSize: 28,
              fontWeight: "700",
              textAlign: "center",
              color: colorScheme === "dark" ? "#fff" : "#000",
              marginBottom: 10,
              paddingTop: 20,
            }}
          >
            Thank You! 🌙
          </ThemedText>
          <ThemedText
            style={{
              fontSize: 18,
              fontWeight: "600",
              textAlign: "center",
              color: colorScheme === "dark" ? "#888" : "#666",
            }}
          >
            See You Tomorrow
          </ThemedText>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

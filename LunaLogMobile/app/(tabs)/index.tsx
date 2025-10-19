import { Alert, Platform, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React, { useState, useRef, useEffect } from "react";
import AnimatedSplashScreen from "../../components/AnimatedSplashScreen";
import { Pressable } from "react-native";
import { MoonRatingInput } from "@/components/MoonRatingInput";
import { submitJournalEntry } from "@/scripts/journalService";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AIOverviewScreen from "@/components/aioverview";
import { getJournalEntries } from "@/scripts/journalService";
const questionsData: any = require("../../assets/questions.json");

export default function HomeScreen() {
  const [splashFinished, setSplashFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const [responses, setResponses] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPrevious, setShowPrevious] = useState(false);
  const [typedText1, setTypedText1] = useState("");
  const [typedText2, setTypedText2] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [showAIOverview, setShowAIOverview] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const moonFadeAnim = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const welcomeOpacity = useRef(new Animated.Value(1)).current;
  const [entries, setEntries] = useState<any[]>([]);

  const colorScheme = useColorScheme();

  const welcomeLine1 = "Welcome Back,";
  const welcomeLine2 = "Let's Talk About Your Day";

  const fetchEntries = async () => {
    try {
      const data = await getJournalEntries();
      setEntries(Array.isArray(data) ? data : []);
    } catch (e) {
      setEntries([]);
      // optionally log error
    }
  };

  // Typing animation effect for welcome
  useEffect(() => {
    if (!splashFinished || !showWelcome) return;

    let index1 = 0;
    const typingInterval1 = setInterval(() => {
      if (index1 <= welcomeLine1.length) {
        setTypedText1(welcomeLine1.slice(0, index1));
        index1++;
      } else {
        clearInterval(typingInterval1);
        let index2 = 0;
        const typingInterval2 = setInterval(() => {
          if (index2 <= welcomeLine2.length) {
            setTypedText2(welcomeLine2.slice(0, index2));
            index2++;
          } else {
            clearInterval(typingInterval2);
          }
        }, 40);
      }
    }, 60);

    return () => {
      clearInterval(typingInterval1);
    };
  }, [splashFinished, showWelcome]);

  if (!splashFinished) {
    return <AnimatedSplashScreen onFinish={() => setSplashFinished(true)} />;
  }

  const questionList: any[] =
    Array.isArray(questionsData) && questionsData.length
      ? questionsData
      : [{ prompt: "How was your day?" }];

  const isLast = currentIndex === questionList.length - 1;

  const onSubmit = async () => {
    if (rating === null) {
      Alert.alert("No Rating", "Please select a rating before submitting.");
      return;
    }

    setIsSubmitting(true);

    const finalResponses = [...responses, rating];

    console.log("Submitting responses:", finalResponses);

    const success = await submitJournalEntry(finalResponses);

    setIsSubmitting(false);

    if (success) {
      fetchEntries();
      // Show AI Overview screen
      setShowAIOverview(true);
    } else {
      Alert.alert(
        "Error",
        "Failed to submit your journal entry. Please try again."
      );
    }
  };

  const resetToStart = () => {
    setShowAIOverview(false);
    setCurrentIndex(0);
    setDisplayIndex(0);
    setRating(null);
    setResponses([]);
    slideAnim.setValue(0);
    moonFadeAnim.setValue(1);
    setShowPrevious(false);
    setShowWelcome(true);
    setTypedText1("");
    setTypedText2("");
    welcomeOpacity.setValue(1);
  };

  const onNext = () => {
    if (rating === null) {
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      Alert.alert("No Rating", "Please select a rating before continuing.");
      return;
    }

    if (currentIndex === 0 && showWelcome) {
      Animated.timing(welcomeOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setShowWelcome(false);
      });
    }

    if (isLast) {
      onSubmit();
      return;
    }

    if (isAnimating) return;

    setResponses((prev) => [...prev, rating]);
    setIsAnimating(true);
    setShowPrevious(true);

    Animated.timing(moonFadeAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex((i) => i + 1);
      setDisplayIndex((i) => i + 1);
      setRating(null);
      slideAnim.setValue(0);

      Animated.timing(moonFadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
      });
    });
  };

  // Show AI Overview Screen
  if (showAIOverview) {
    return <AIOverviewScreen onReset={resetToStart} entries={entries} />;
  }

  const question = questionList[displayIndex] || {};
  const nextQuestion =
    displayIndex < questionList.length - 1
      ? questionList[displayIndex + 1]
      : null;

  const current = Array.isArray(questionsData)
    ? questionsData[displayIndex]
    : null;
  const labels = current?.scaleLabels;

  const currentTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -450],
    extrapolate: "clamp",
  });

  const currentOpacity = slideAnim.interpolate({
    inputRange: [0, 0.25, 0.5],
    outputRange: [1, 0.6, 0],
  });

  const currentScale = slideAnim.interpolate({
    inputRange: [0, 0.5],
    outputRange: [1, 0.88],
  });

  const nextTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
    extrapolate: "clamp",
  });

  const nextOpacity = slideAnim.interpolate({
    inputRange: [0, 0.2, 0.6, 1],
    outputRange: [0.35, 0.5, 0.85, 1],
  });

  const nextTextOpacity = slideAnim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0.7, 0.8, 0.95, 1],
  });

  const gradientColors =
    colorScheme === "dark"
      ? [
          "rgba(21,23,24,0)",
          "rgba(21,23,24,0.4)",
          "rgba(21,23,24,0.75)",
          "rgba(21,23,24,0.95)",
          "rgba(21,23,24,1)",
        ]
      : [
          "rgba(255,255,255,0)",
          "rgba(255,255,255,0.4)",
          "rgba(255,255,255,0.75)",
          "rgba(255,255,255,0.95)",
          "rgba(255,255,255,1)",
        ];

  const topGradientColors =
    colorScheme === "dark"
      ? [
          "rgba(21,23,24,1)",
          "rgba(21,23,24,0.95)",
          "rgba(21,23,24,0.75)",
          "rgba(21,23,24,0.4)",
          "rgba(21,23,24,0)",
        ]
      : [
          "rgba(255,255,255,1)",
          "rgba(255,255,255,0.95)",
          "rgba(255,255,255,0.75)",
          "rgba(255,255,255,0.4)",
          "rgba(255,255,255,0)",
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
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">LunaLog</ThemedText>
        </ThemedView>
      </ThemedView>

      {showWelcome && (
        <Animated.View
          style={{
            position: "absolute",
            top: Platform.OS === "android" ? 130 : 150,
            left: 0,
            right: 0,
            alignItems: "center",
            opacity: welcomeOpacity,
            zIndex: 10,
          }}
          pointerEvents="none"
        >
          <ThemedText
            style={{
              fontSize: 42,
              fontWeight: "800",
              textAlign: "center",
              color: colorScheme === "dark" ? "#fff" : "#000",
              marginBottom: 8,
              paddingTop: 24,
            }}
          >
            {typedText1}
            {typedText1.length < welcomeLine1.length && (
              <ThemedText style={{ color: "#d2d2d2ff" }}>|</ThemedText>
            )}
          </ThemedText>
          {typedText1.length >= welcomeLine1.length && (
            <ThemedText
              style={{
                fontSize: 20,
                fontWeight: "600",
                textAlign: "center",
                color: colorScheme === "dark" ? "#aaa" : "#666",
              }}
            >
              {typedText2}
              {typedText2.length < welcomeLine2.length && (
                <ThemedText style={{ color: "#d2d2d2ff" }}>|</ThemedText>
              )}
            </ThemedText>
          )}
        </Animated.View>
      )}

      <ThemedView
        style={{
          flex: 1,
          paddingHorizontal: 20,
          justifyContent: "center",
        }}
      >
        <ThemedView
          style={{
            flex: 1,
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={{
              position: "absolute",
              left: 8,
              right: 8,
              opacity: currentOpacity,
              transform: [
                { translateY: currentTranslateY },
                { scale: currentScale },
              ],
            }}
          >
            <ThemedText
              style={{
                fontSize: 22,
                fontWeight: "700",
                lineHeight: 30,
                paddingLeft: 8,
              }}
            >
              {question.prompt}
            </ThemedText>

            <ThemedText
              style={{
                fontSize: 15,
                color: "#888",
                marginTop: 6,
                marginBottom: 20,
                lineHeight: 22,
                paddingLeft: 8,
              }}
            >
              {question.subDescription}
            </ThemedText>

            <Animated.View style={{ opacity: moonFadeAnim }}>
              <MoonRatingInput
                rating={rating}
                onRatingChange={setRating}
                style={{ marginBottom: 28, justifyContent: "center" }}
              />
            </Animated.View>

            <ThemedView
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              <ThemedText
                style={{
                  color: "#888",
                  fontSize: 14,
                  flex: 1,
                  fontWeight: "500",
                }}
              >
                {rating == null ? "Select a mood" : labels?.[rating] || ""}
              </ThemedText>

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  onPress={onNext}
                  disabled={isSubmitting || isAnimating}
                  accessibilityLabel={isLast ? "Submit entry" : "Next question"}
                  style={({ pressed }) => ({
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    backgroundColor:
                      isSubmitting || isAnimating
                        ? "#999"
                        : rating !== null
                        ? "#007AFF"
                        : "#ccc",
                    opacity: pressed ? 0.8 : 1,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                    elevation: 3,
                  })}
                >
                  <ThemedText
                    style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : isLast
                      ? "Submit ✓"
                      : "Next →"}
                  </ThemedText>
                </Pressable>
              </Animated.View>
            </ThemedView>
          </Animated.View>

          {nextQuestion && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 8,
                right: 8,
                opacity: nextOpacity,
                transform: [{ translateY: nextTranslateY }],
              }}
            >
              <ThemedView>
                <Animated.View style={{ opacity: nextTextOpacity }}>
                  <ThemedText
                    style={{
                      fontSize: 22,
                      fontWeight: "700",
                      color: colorScheme === "dark" ? "#ccc" : "#444",
                      lineHeight: 30,
                      paddingLeft: 8,
                    }}
                  >
                    {nextQuestion.prompt}
                  </ThemedText>
                  {nextQuestion.subDescription && (
                    <ThemedText
                      style={{
                        fontSize: 15,
                        color: "#999",
                        marginTop: 6,
                        marginBottom: 20,
                        lineHeight: 22,
                        paddingLeft: 8,
                      }}
                    >
                      {nextQuestion.subDescription}
                    </ThemedText>
                  )}
                  <Animated.View style={{ opacity: moonFadeAnim }}>
                    <MoonRatingInput
                      rating={rating}
                      onRatingChange={setRating}
                      style={{ marginBottom: 28, justifyContent: "center" }}
                    />
                  </Animated.View>
                </Animated.View>
              </ThemedView>

              <Animated.View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: slideAnim.interpolate({
                    inputRange: [0, 0.5, 0.8, 1],
                    outputRange: [1, 0.6, 0.2, 0],
                  }),
                }}
              >
                <LinearGradient
                  colors={gradientColors}
                  style={{
                    flex: 1,
                    borderRadius: 16,
                  }}
                  pointerEvents="none"
                />
              </Animated.View>
            </Animated.View>
          )}

          <ThemedView
            style={{
              position: "absolute",
              bottom: 20,
              left: 0,
              right: 0,
              alignItems: "center",
            }}
          >
            <ThemedView
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.04)",
              }}
            >
              <ThemedText style={{ color: "#888", fontSize: 13 }}>
                <ThemedText style={{ color: "#007AFF", fontWeight: "700" }}>
                  {currentIndex + 1}
                </ThemedText>
                {" of "}
                {questionList.length}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
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

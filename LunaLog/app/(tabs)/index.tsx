import { Alert, Platform, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React, { useState, useRef } from "react";
import AnimatedSplashScreen from "../../components/AnimatedSplashScreen";
import { Pressable } from "react-native";
import { MoonRatingInput } from "@/components/MoonRatingInput";
import { submitJournalEntry } from "@/scripts/journalService";
import { useColorScheme } from "@/hooks/use-color-scheme";
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

  const slideAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();

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
      Alert.alert("Success!", "Your journal entry has been submitted.", [
        {
          text: "OK",
          onPress: () => {
            setCurrentIndex(0);
            setDisplayIndex(0);
            setRating(null);
            setResponses([]);
            slideAnim.setValue(0);
            setShowPrevious(false);
          },
        },
      ]);
    } else {
      Alert.alert(
        "Error",
        "Failed to submit your journal entry. Please try again."
      );
    }
  };

  const onNext = () => {
    if (rating === null) {
      Alert.alert("No Rating", "Please select a rating before continuing.");
      return;
    }

    if (isLast) {
      onSubmit();
      return;
    }

    if (isAnimating) return;

    setResponses((prev) => [...prev, rating]);
    setIsAnimating(true);
    setShowPrevious(true); // Show previous question at top

    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex((i) => i + 1);
      setDisplayIndex((i) => i + 1);
      setRating(null);
      slideAnim.setValue(0);
      setIsAnimating(false);
    });
  };

  const question = questionList[displayIndex] || {};
  const nextQuestion =
    displayIndex < questionList.length - 1
      ? questionList[displayIndex + 1]
      : null;
  const prevQuestion = displayIndex > 0 ? questionList[displayIndex - 1] : null;
  const prevRating = displayIndex > 0 ? responses[displayIndex - 1] : null;

  const current = Array.isArray(questionsData)
    ? questionsData[displayIndex]
    : null;
  const labels = current?.scaleLabels;

  // Current question moves up
  const currentTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -250],
  });

  const currentOpacity = slideAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.3, 0],
  });

  // Duplicate (becomes previous) - instantly appears at top as current fades
  const duplicateTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-250, -250], // Stays at top
  });

  const duplicateOpacity = slideAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.3, 0.3], // Fades in as current fades out
  });

  // Next question moves from bottom to center
  const nextTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [250, 0],
  });

  const nextOpacity = slideAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.7, 1],
  });

  // Get background colors based on theme
  const backgroundColor = colorScheme === "dark" ? "#151718" : "#ffffff";
  const gradientColors =
    colorScheme === "dark"
      ? ["rgba(21,23,24,0)", "rgba(21,23,24,0.7)", "rgba(21,23,24,1)"]
      : ["rgba(255,255,255,0)", "rgba(255,255,255,0.7)", "rgba(255,255,255,1)"];

  const topGradientColors =
    colorScheme === "dark"
      ? ["rgba(21,23,24,1)", "rgba(21,23,24,0.7)", "rgba(21,23,24,0)"]
      : ["rgba(255,255,255,1)", "rgba(255,255,255,0.7)", "rgba(255,255,255,0)"];

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
          {/* Previous Question - Static at top */}
          {showPrevious && prevQuestion && prevRating !== null && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                opacity: 0.3,
                transform: [{ translateY: -250 }],
              }}
            >
              <ThemedView
                style={{
                  marginHorizontal: 20,
                  padding: 20,
                  borderRadius: 12,
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: "#666",
                  }}
                >
                  {prevQuestion.prompt}
                </ThemedText>
                {prevQuestion.subDescription && (
                  <ThemedText
                    style={{
                      fontSize: 12,
                      color: "#999",
                      marginTop: 4,
                      marginBottom: 8,
                    }}
                  >
                    {prevQuestion.subDescription}
                  </ThemedText>
                )}

                <MoonRatingInput
                  rating={prevRating}
                  onRatingChange={() => {}}
                  style={{ marginTop: 8, opacity: 0.5 }}
                />
              </ThemedView>

              <LinearGradient
                colors={topGradientColors}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 12,
                }}
                pointerEvents="none"
              />
            </Animated.View>
          )}

          {/* Duplicate of Current Question - transitions to become previous */}
          {isAnimating && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                opacity: duplicateOpacity,
                transform: [{ translateY: duplicateTranslateY }],
              }}
            >
              <ThemedView
                style={{
                  marginHorizontal: 20,
                  padding: 20,
                  borderRadius: 12,
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: "#666",
                  }}
                >
                  {question.prompt}
                </ThemedText>
                {question.subDescription && (
                  <ThemedText
                    style={{
                      fontSize: 12,
                      color: "#999",
                      marginTop: 4,
                      marginBottom: 8,
                    }}
                  >
                    {question.subDescription}
                  </ThemedText>
                )}

                <MoonRatingInput
                  rating={rating}
                  onRatingChange={() => {}}
                  style={{ marginTop: 8, opacity: 0.5 }}
                />
              </ThemedView>

              <LinearGradient
                colors={topGradientColors}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 12,
                }}
                pointerEvents="none"
              />
            </Animated.View>
          )}

          {/* Current Question - moves up */}
          <Animated.View
            style={{
              position: "absolute",
              left: 8,
              right: 8,
              opacity: currentOpacity,
              transform: [{ translateY: currentTranslateY }],
            }}
          >
            <ThemedText style={{ fontSize: 20, fontWeight: "600" }}>
              {question.prompt}
            </ThemedText>

            <ThemedText
              style={{ fontSize: 14, color: "#666", marginBottom: 12 }}
            >
              {question.subDescription}
            </ThemedText>

            <MoonRatingInput
              rating={rating}
              onRatingChange={setRating}
              style={{ marginBottom: 24 }}
            />

            <ThemedView
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <ThemedText style={{ color: "#666" }}>
                {rating == null ? "No rating" : labels?.[rating] || ""}
              </ThemedText>

              <Pressable
                onPress={onNext}
                disabled={isSubmitting || isAnimating}
                accessibilityLabel={isLast ? "Submit entry" : "Next question"}
                style={({ pressed }) => ({
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  backgroundColor:
                    isSubmitting || isAnimating ? "#cccccc" : "#007AFF",
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
                  {isSubmitting ? "Submitting..." : isLast ? "Submit" : "Log"}
                </ThemedText>
              </Pressable>
            </ThemedView>
          </Animated.View>

          {/* Next Question Preview - moves up to center */}
          {nextQuestion && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                opacity: nextOpacity,
                transform: [{ translateY: nextTranslateY }],
              }}
            >
              <ThemedView
                style={{
                  marginHorizontal: 20,
                  padding: 20,
                  borderRadius: 12,
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: "#666",
                  }}
                >
                  {nextQuestion.prompt}
                </ThemedText>
                {nextQuestion.subDescription && (
                  <ThemedText
                    style={{
                      fontSize: 12,
                      color: "#999",
                      marginTop: 4,
                    }}
                  >
                    {nextQuestion.subDescription}
                  </ThemedText>
                )}
              </ThemedView>

              <Animated.View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: slideAnim.interpolate({
                    inputRange: [0, 0.7, 1],
                    outputRange: [1, 0.3, 0],
                  }),
                }}
              >
                <LinearGradient
                  colors={gradientColors}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                  }}
                  pointerEvents="none"
                />
              </Animated.View>
            </Animated.View>
          )}

          <ThemedView
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              paddingVertical: 14,
              alignItems: "center",
            }}
          >
            <ThemedText style={{ color: "#666" }}>
              Question {currentIndex + 1} of {questionList.length}
            </ThemedText>
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

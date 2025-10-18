import { Image } from "expo-image";
import { Platform, ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React, { useState } from "react";
import { View } from "react-native";
import AnimatedSplashScreen from "../../components/AnimatedSplashScreen";
import { Pressable } from "react-native";
import { MoonRatingInput } from "@/components/MoonRatingInput";
const questionsData: any = require("../../assets/questions.json");

export default function HomeScreen() {
  const [splashFinished, setSplashFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rating, setRating] = useState<number | null>(null);

  if (!splashFinished) {
    return <AnimatedSplashScreen onFinish={() => setSplashFinished(true)} />;
  }

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
        {(() => {
          const questionList: any[] =
            Array.isArray(questionsData) && questionsData.length
              ? questionsData
              : [{ prompt: "How was your day?" }];

          const stars = Array.from({ length: 10 }, (_, i) => i + 1);
          const isLast = currentIndex === questionList.length - 1;

          const onSubmit = () => {
            console.log("Submitting final rating", {
              questionIndex: currentIndex,
              rating,
            });
          };

          const onNext = () => {
            if (isLast) {
              onSubmit();
              return;
            }
            setRating(null);
            setCurrentIndex((i) => i + 1);
          };

          const question = questionList[currentIndex]?.prompt || "";

          return (
            <ThemedView style={{ flex: 1, justifyContent: "center" }}>
              <ThemedView
                style={{
                  marginHorizontal: 8,
                }}
              >
                <ThemedText
                  style={{ fontSize: 20, fontWeight: "600", marginBottom: 12 }}
                >
                  {question}
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
                  {(() => {
                    const current = Array.isArray(questionsData)
                      ? questionsData[currentIndex]
                      : null;
                    const labels = current?.scaleLabels;

                    return (
                      <ThemedText style={{ color: "#666" }}>
                        {rating == null ? "No rating" : labels[rating]}
                      </ThemedText>
                    );
                  })()}

                  <Pressable
                    onPress={onNext}
                    accessibilityLabel="Next question"
                    style={({ pressed }) => ({
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                      backgroundColor: "#007AFF",
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
                      {isLast ? "Submit" : "Log"}
                    </ThemedText>
                  </Pressable>
                </ThemedView>
              </ThemedView>

              <ThemedView style={{ paddingVertical: 14, alignItems: "center" }}>
                <ThemedText style={{ color: "#666" }}>
                  Question {currentIndex + 1} of {questionList.length}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          );
        })()}
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
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});

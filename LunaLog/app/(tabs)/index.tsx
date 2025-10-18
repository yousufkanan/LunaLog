import { Image } from "expo-image";
import { Platform, ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React, { useState } from "react";
import { Pressable } from "react-native";
const questionsData: any = require("../../assets/questions.json");

export default function HomeScreen() {
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

          const [currentIndex, setCurrentIndex] = useState(0);
          const [rating, setRating] = useState<number | null>(null);

          const stars = Array.from({ length: 10 }, (_, i) => i + 1);

          const onNext = () => {
            setRating(null);
            setCurrentIndex((i) => (i + 1) % questionList.length);
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

                <ThemedView
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginBottom: 12,
                  }}
                >
                  {(() => {
                    const moonImages = [
                      require("../../assets/moonRatings/1.png"),
                      require("../../assets/moonRatings/2.png"),
                      require("../../assets/moonRatings/3.png"),
                      require("../../assets/moonRatings/4.png"),
                      require("../../assets/moonRatings/5.png"),
                      require("../../assets/moonRatings/6.png"),
                      require("../../assets/moonRatings/7.png"),
                      require("../../assets/moonRatings/8.png"),
                      require("../../assets/moonRatings/9.png"),
                      require("../../assets/moonRatings/10.png"),
                    ];

                    return stars.map((s) => {
                      const idx = s - 1;
                      const selected = rating != null && rating >= s;
                      const exactSelected = rating === s;
                      return (
                        <Pressable
                          key={s}
                          onPress={() => setRating(s)}
                          accessibilityLabel={`Rate ${s} out of 10`}
                          style={({ pressed }) => ({
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 6,
                            marginBottom: 6,
                            backgroundColor: pressed
                              ? "rgba(0,0,0,0.06)"
                              : "transparent",
                            borderWidth: exactSelected ? 2 : 0,
                            borderColor: exactSelected
                              ? "#ffcc00"
                              : "transparent",
                          })}
                        >
                          <Image
                            source={moonImages[idx]}
                            style={{
                              width: 32,
                              height: 32,
                              resizeMode: "contain",
                              opacity: selected ? 1 : 0.45,
                            }}
                          />
                        </Pressable>
                      );
                    });
                  })()}
                </ThemedView>

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
                      Log
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

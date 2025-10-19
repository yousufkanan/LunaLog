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

type JournalEntry = {
  entry_id: number;
  entry_date: string;
  moodScore: number;
  insights: string[];
  recommendations: string[];
  full_response_text: string;
};

type AIOverviewScreenProps = {
  onReset: () => void;
  entries: JournalEntry[];
};

export default function AIOverviewScreen({
  onReset,
  entries = [],
}: AIOverviewScreenProps) {
  const [typedOverviewTitle, setTypedOverviewTitle] = useState("");
  const [showFullText, setShowFullText] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const insightsHeaderOpacity = useRef(new Animated.Value(0)).current;
  const recommendationsHeaderOpacity = useRef(new Animated.Value(0)).current;

  // Line-by-line animation refs (6 total: 3 insights + 3 recommendations)
  const line1Opacity = useRef(new Animated.Value(0)).current;
  const line2Opacity = useRef(new Animated.Value(0)).current;
  const line3Opacity = useRef(new Animated.Value(0)).current;
  const line4Opacity = useRef(new Animated.Value(0)).current;
  const line5Opacity = useRef(new Animated.Value(0)).current;
  const line6Opacity = useRef(new Animated.Value(0)).current;

  const colorScheme = useColorScheme();
  const overviewTitle = "AI Overview";

  // Get the latest entry by sorting by entry_date (UNIX timestamp)
  const latestEntry =
    entries.length > 0
      ? entries.reduce((latest, current) => {
          const latestTime = parseInt(latest.entry_date);
          const currentTime = parseInt(current.entry_date);
          return currentTime > latestTime ? current : latest;
        })
      : null;

  // Build the overview data from insights and recommendations
  const insightsList = latestEntry?.insights?.slice(0, 3) || [];
  const recommendationsList = latestEntry?.recommendations?.slice(0, 3) || [];

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
      line6Opacity,
    ];

    const totalLines = insightsList.length + recommendationsList.length;
    const hasInsights = insightsList.length > 0;
    const hasRecommendations = recommendationsList.length > 0;

    // Build animation sequence
    const animations = [];

    // Show Insights header
    if (hasInsights) {
      animations.push(
        Animated.timing(insightsHeaderOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      );
    }

    // Show insight lines
    insightsList.forEach((_, index) => {
      animations.push(
        Animated.timing(lineOpacities[index], {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        })
      );
    });

    // Show Recommendations header
    if (hasRecommendations) {
      animations.push(
        Animated.timing(recommendationsHeaderOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      );
    }

    // Show recommendation lines
    recommendationsList.forEach((_, index) => {
      animations.push(
        Animated.timing(lineOpacities[insightsList.length + index], {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        })
      );
    });

    // Animate with stagger
    Animated.stagger(400, animations).start(() => {
      // After all lines fade in, show the footer
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });
  }, [showFullText, insightsList.length, recommendationsList.length]);

  const lineOpacities = [
    line1Opacity,
    line2Opacity,
    line3Opacity,
    line4Opacity,
    line5Opacity,
    line6Opacity,
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
          {latestEntry ? (
            <>
              {/* Insights Section */}
              {insightsList.length > 0 && (
                <>
                  <Animated.View
                    style={{ opacity: insightsHeaderOpacity, marginBottom: 16 }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 20,
                        fontWeight: "700",
                        color: colorScheme === "dark" ? "#fff" : "#000",
                      }}
                    >
                      Key Insights
                    </ThemedText>
                  </Animated.View>

                  {insightsList.map((insight, index) => (
                    <Animated.View
                      key={`insight-${index}`}
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
                        • {insight}
                      </ThemedText>
                    </Animated.View>
                  ))}
                </>
              )}

              {/* Recommendations Section */}
              {recommendationsList.length > 0 && (
                <>
                  <Animated.View
                    style={{
                      opacity: recommendationsHeaderOpacity,
                      marginTop: 24,
                      marginBottom: 16,
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 20,
                        fontWeight: "700",
                        color: colorScheme === "dark" ? "#fff" : "#000",
                      }}
                    >
                      Recommendations
                    </ThemedText>
                  </Animated.View>

                  {recommendationsList.map((recommendation, index) => (
                    <Animated.View
                      key={`recommendation-${index}`}
                      style={{
                        opacity:
                          lineOpacities[insightsList.length + index] || 0,
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
                        • {recommendation}
                      </ThemedText>
                    </Animated.View>
                  ))}
                </>
              )}
            </>
          ) : (
            <ThemedView>
              <ThemedText
                style={{
                  fontSize: 17,
                  lineHeight: 28,
                  color: colorScheme === "dark" ? "#ccc" : "#444",
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                • No journal entries yet
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 17,
                  lineHeight: 28,
                  color: colorScheme === "dark" ? "#ccc" : "#444",
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                • Complete your first entry to see AI insights
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 17,
                  lineHeight: 28,
                  color: colorScheme === "dark" ? "#ccc" : "#444",
                  textAlign: "center",
                }}
              >
                • Track your mood and emotional patterns
              </ThemedText>
            </ThemedView>
          )}
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

import { Image } from "expo-image";
import {
  Platform,
  StyleSheet,
  useColorScheme,
  Animated,
  RefreshControl,
} from "react-native";
import { Collapsible } from "@/components/ui/collapsible";
import { ExternalLink } from "@/components/external-link";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { Colors } from "@/constants/theme";
import React, { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView } from "react-native";

type JournalEntryCardProps = {
  title: string;
  aiSummary: string;
  date: string;
  moodScore: number;
  onRefresh?: () => void;
};

function getMoodColor(score: number): string {
  if (score <= 3) return "#EF4444";
  if (score <= 6) return "#F97316";
  if (score < 9) return "#10B981";
  return "#FFD700";
}

export function JournalEntryCard({
  title,
  aiSummary,
  date,
  moodScore,
}: JournalEntryCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const iconColor = Colors[colorScheme].icon;
  const moodColor = getMoodColor(moodScore);

  const glowAnim = useRef(new Animated.Value(0)).current;
  const isGoldMood = moodScore >= 9;

  useEffect(() => {
    if (isGoldMood) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [isGoldMood]);

  const borderColor = isGoldMood
    ? glowAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [
          "rgba(255, 215, 0, 0.4)",
          "rgba(255, 215, 0, 1)",
          "rgba(255, 215, 0, 0.4)",
        ],
      })
    : colorScheme === "dark"
    ? "rgba(255, 255, 255, 0.15)"
    : "rgba(0, 0, 0, 0.1)";

  const shadowOpacity = isGoldMood
    ? glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.9],
      })
    : 0.08;

  const shadowRadius = isGoldMood
    ? glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [8, 20],
      })
    : 4;

  const goldGradient = ["#FFD700", "#FFA500", "#FFD700"];

  return (
    <Animated.View
      style={[
        styles.journalCard,
        {
          borderColor: borderColor,
          borderWidth: isGoldMood ? 3 : 1.5,
          shadowColor: isGoldMood ? "#FFD700" : "#000",
          shadowOffset: { width: 0, height: isGoldMood ? 0 : 2 },
          shadowOpacity: shadowOpacity,
          shadowRadius: shadowRadius,
          elevation: isGoldMood ? 10 : 2,
          overflow: "hidden",
        },
      ]}
    >
      {/* Gold gradient background for 9-10 scores */}
      {isGoldMood && (
        <LinearGradient
          colors={goldGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            opacity: 0.15,
          }}
        />
      )}

      {/* Accent bar on the left with mood color */}
      <Animated.View
        style={[
          styles.accentBar,
          {
            backgroundColor: moodColor,
            ...(isGoldMood && {
              shadowColor: "#FFD700",
              shadowOpacity: 0.9,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 0 },
              elevation: 5,
            }),
          },
        ]}
      />

      {/* Header with Title and Mood Score Badge */}
      <ThemedView style={styles.cardHeader}>
        <ThemedText
          type="defaultSemiBold"
          style={[
            styles.journalTitle,
            isGoldMood && {
              color: colorScheme === "dark" ? "#FFD700" : "#B8860B",
            },
          ]}
        >
          {title}
        </ThemedText>

        {/* Mood Score Badge */}
        <Animated.View
          style={[
            styles.moodBadge,
            {
              backgroundColor: moodColor,
              ...(isGoldMood && {
                shadowColor: "#FFD700",
                shadowOpacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 1],
                }),
                shadowRadius: 15,
                shadowOffset: { width: 0, height: 0 },
                elevation: 8,
              }),
            },
          ]}
        >
          <ThemedText style={styles.moodText}>
            {moodScore}
            {isGoldMood && " ✨"}
          </ThemedText>
        </Animated.View>
      </ThemedView>

      {/* AI Summary */}
      <ThemedText
        style={[
          styles.journalSummary,
          isGoldMood && {
            color: colorScheme === "dark" ? "#E6C200" : "#8B6914",
          },
        ]}
      >
        {aiSummary}
      </ThemedText>

      {/* Footer with Date and Arrow */}
      <ThemedView style={styles.cardFooter}>
        <ThemedText
          style={[
            styles.dateText,
            isGoldMood && {
              color: colorScheme === "dark" ? "#D4AF37" : "#9A7B2E",
            },
          ]}
        >
          {date}
        </ThemedText>
        <IconSymbol
          name="arrow.right.circle"
          size={20}
          color={
            isGoldMood
              ? colorScheme === "dark"
                ? "#FFD700"
                : "#B8860B"
              : iconColor
          }
        />
      </ThemedView>
    </Animated.View>
  );
}

// Example wrapper component showing how to use pull-to-refresh
type JournalListProps = {
  entries: Array<{
    id: string;
    title: string;
    aiSummary: string;
    date: string;
    moodScore: number;
  }>;
  onRefresh?: () => Promise<void>;
};

export function JournalList({ entries, onRefresh }: JournalListProps) {
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? "light";

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setRefreshing(false);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colorScheme === "dark" ? "#fff" : "#000"}
          colors={["#007AFF"]} // Android
          progressBackgroundColor={colorScheme === "dark" ? "#333" : "#fff"} // Android
        />
      }
      contentContainerStyle={styles.scrollContainer}
    >
      {entries.map((entry) => (
        <JournalEntryCard
          key={entry.id}
          title={entry.title}
          aiSummary={entry.aiSummary}
          date={entry.date}
          moodScore={entry.moodScore}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  scrollContainer: {
    padding: 16,
  },
  // --- Card Styles ---
  journalCard: {
    padding: 16,
    paddingLeft: 20,
    marginVertical: 8,
    borderRadius: 12,
    position: "relative",
    backgroundColor: "transparent",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "transparent",
  },
  journalTitle: {
    fontSize: 18,
    flex: 1,
    marginRight: 12,
  },
  moodBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  moodText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  journalSummary: {
    marginBottom: 12,
    fontSize: 12,
    lineHeight: 15,
    color: "#666",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  dateText: {
    fontSize: 14,
    color: "#999",
  },
  // --- End of Card Styles ---
});

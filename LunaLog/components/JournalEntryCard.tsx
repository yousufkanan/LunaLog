import { Image } from "expo-image";
import { Platform, StyleSheet, useColorScheme } from "react-native";
import { Collapsible } from "@/components/ui/collapsible";
import { ExternalLink } from "@/components/external-link";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { Colors } from "@/constants/theme";

// --- New Component Based on Your Image ---
type JournalEntryCardProps = {
  title: string;
  aiSummary: string;
  date: string;
  moodScore: number; // 1-10
};

/**
 * Get color based on mood score (1-10)
 */
function getMoodColor(score: number): string {
  if (score <= 3) return "#EF4444"; // Red - Low mood
  if (score <= 5) return "#F59E0B"; // Orange - Below average
  if (score <= 7) return "#EAB308"; // Yellow - Average
  if (score <= 9) return "#10B981"; // Green - Good mood
  return "#06B6D4"; // Cyan - Excellent mood
}

/**
 * A component to display a summary of a journal entry, based on your drawing.
 */
export function JournalEntryCard({
  title,
  aiSummary,
  date,
  moodScore,
}: JournalEntryCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const iconColor = Colors[colorScheme].icon;
  const moodColor = getMoodColor(moodScore);

  // Border color based on theme
  const borderColor =
    colorScheme === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)";

    /**
     * If the mood Score is over 9 it needs to have a gloweffect to make it stand out more
    */
   const glowStyle = moodScore > 9 ? { shadowColor: "#06B6D4", shadowRadius: 10, elevation: 5 } : {};

  return (
    <ThemedView style={[styles.journalCard, { borderColor }]}>
      {/* Accent bar on the left with mood color */}
      <ThemedView style={[styles.accentBar, { backgroundColor: moodColor }]} />

      {/* Header with Title and Mood Score Badge */}
      <ThemedView style={styles.cardHeader}>
        <ThemedText type="defaultSemiBold" style={styles.journalTitle}>
          {title}
        </ThemedText>

        {/* Mood Score Badge */}
        <ThemedView style={[styles.moodBadge, { backgroundColor: moodColor }]}>
          <ThemedText style={styles.moodText}>{moodScore}</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* AI Summary */}
      <ThemedText style={styles.journalSummary}>{aiSummary}</ThemedText>

      {/* Footer with Date and Arrow */}
      <ThemedView style={styles.cardFooter}>
        <ThemedText style={styles.dateText}>{date}</ThemedText>
        <IconSymbol name="arrow.right.circle" size={20} color={iconColor} />
      </ThemedView>
    </ThemedView>
  );
}
// --- End of New Component ---

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
  // --- Card Styles ---
  journalCard: {
    padding: 16,
    paddingLeft: 20,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
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
    lineHeight: 20,
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

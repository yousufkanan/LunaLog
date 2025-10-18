import { Image } from 'expo-image';
import { Platform, StyleSheet, useColorScheme } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { Colors } from '@/constants/theme';
// --- New Component Based on Your Image ---
type JournalEntryCardProps = {
  title: string;
  aiSummary: string;
  date: string;
  moodScore: number;
};

/**
 * A component to display a summary of a journal entry, based on your drawing.
 */
export function JournalEntryCard({ title, aiSummary, date, moodScore }: JournalEntryCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = Colors[colorScheme].icon; // Use theme-aware color

  return (
    // The main card/box, using ThemedView and a dynamic border color
    <ThemedView style={[styles.journalCard, { borderColor: iconColor }]}>
      {/* Top Row: Title and Mood Score */}
      <ThemedView style={styles.journalRow}>
        <ThemedText type="defaultSemiBold" style={styles.journalTitle}>
          {title}
        </ThemedText>
        <ThemedText>Mood Score: {moodScore}</ThemedText>
      </ThemedView>

      {/* Middle Content: AI Summary */}
      <ThemedText style={styles.journalSummary}>{aiSummary}</ThemedText>

      {/* Bottom Row: Date and Icon */}
      <ThemedView style={styles.journalRow}>
        <ThemedText type="subtitle">{date}</ThemedText>
        <IconSymbol name="arrow.right.circle" size={24} color={iconColor} />
      </ThemedView>
    </ThemedView>
  );
}
// --- End of New Component ---



const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  // --- Added styles for the journal card ---
  journalCard: {
    padding: 16,
    marginVertical: 12,
    borderWidth: 2, // Thick border like your drawing
    borderRadius: 10, // Rounded corners
  },
  journalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent', // Ensure nested ThemedViews don't show a background
  },
  journalTitle: {
    fontSize: 18,
  },
  journalSummary: {
    marginVertical: 12,
    fontStyle: 'italic',
    color: '#808080', // Gray color for the placeholder "AI Summary"
  },
  // --- End of added styles ---
});
import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Platform, StyleSheet } from "react-native";
import { Collapsible } from "@/components/ui/collapsible";
import { ExternalLink } from "@/components/external-link";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { JournalEntryCard } from "@/components/JournalEntryCard";
import { getJournalEntries } from "@/scripts/journalService";
import { ScrollView } from "react-native";

export default function TabTwoScreen() {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getJournalEntries();
        if (mounted) setEntries(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setEntries([]);
        // optionally log error
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const humanDate = (ts: any) => {
    if (ts === undefined || ts === null || ts === "") return "";
    const asNumber = typeof ts === "number" ? ts : Number(ts);
    let date: Date;

    if (!isNaN(asNumber)) {
      const ms = asNumber < 1e12 ? asNumber * 1000 : asNumber;
      date = new Date(ms);
    } else {
      date = new Date(String(ts));
    }

    if (isNaN(date.getTime())) return String(ts);
    return date.toLocaleDateString();
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView
        style={{
          paddingTop: Platform.OS === "android" ? 48 : 64,
          paddingHorizontal: 20,
          paddingBottom: 12,
        }}
      >
        {/* Changed title to "Entries" from your image */}
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Entries</ThemedText>
        </ThemedView>

        <ScrollView>
          {/* Render JournalEntryCard instances from getJournalEntries */}
          {entries.map((entry) => (
            <JournalEntryCard
              key={entry.id ?? entry.timestamp ?? Math.random().toString()}
              title={"Journal Entry #" + (entry.id ?? "")}
              aiSummary={entry.journalEntry ?? "A brief summary of this entry."}
              date={humanDate(entry.timestamp)}
              moodScore={
                typeof entry.moodScore === "number" ? entry.moodScore : 5
              }
            />
          ))}
        </ScrollView>
      </ThemedView>
    </ThemedView>
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
});

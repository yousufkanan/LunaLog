import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Platform, StyleSheet, RefreshControl, ScrollView } from "react-native";
import { Collapsible } from "@/components/ui/collapsible";
import { ExternalLink } from "@/components/external-link";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { JournalEntryCard } from "@/components/JournalEntryCard";
import { getJournalEntries } from "@/scripts/journalService";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabTwoScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();

  const fetchEntries = async () => {
    try {
      const data = await getJournalEntries();
      setEntries(Array.isArray(data) ? data : []);
    } catch (e) {
      setEntries([]);
      // optionally log error
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getJournalEntries();
        if (mounted) setEntries(Array.isArray(data) ? data : []);
        console.log("Fetched entries:", entries);
      } catch (e) {
        if (mounted) setEntries([]);
        // optionally log error
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
  };

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
        <ThemedText
          type="defaultSemiBold"
          style={{
            fontSize: 16,
            color: "#999",
            marginTop: 24,
          }}
        >
          AI Overview:
        </ThemedText>
        <ThemedText
          type="default"
          style={{
            fontSize: 14,
            color: "#999",
            marginBottom: 24,
          }}
        >
          Looking at your recent entries, it seems you're doing well — happy and
          in good spirits.
        </ThemedText>
      </ThemedView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colorScheme === "dark" ? "#fff" : "#000"}
            colors={["#007AFF"]} // Android
            progressBackgroundColor={colorScheme === "dark" ? "#333" : "#fff"} // Android
          />
        }
      >
        {/* Render JournalEntryCard instances from getJournalEntries */}
        {entries.map((entry) => (
          <JournalEntryCard
            key={entry.entry_id ?? Math.random().toString()}
            title={`Journal Entry #${entry.entry_id}`}
            aiSummary={entry.insights[0] ?? "A brief summary of this entry."}
            date={humanDate(entry.entry_date)}
            moodScore={
              typeof entry.moodScore === "number"
                ? Math.round(entry.moodScore)
                : 5
            }
          />
        ))}
      </ScrollView>
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

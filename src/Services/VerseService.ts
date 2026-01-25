import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import versesData from "../../assets/bible/verses.json";
import { saveVerseForWidget } from "./ScreenTimeService";

const VERSE_KEY = "@verse_of_day";
const VERSE_DATE_KEY = "@verse_date";

interface StoredVerse {
  verse: string;
  reference: string;
}

interface VerseEntry {
  ref: string;
  text: string;
}

// Get a deterministic "random" index based on the date
// This ensures the same verse is shown all day, but changes at midnight
const getDailyVerseIndex = (): number => {
  const today = new Date();
  // Create a seed from the date (year * 1000 + dayOfYear)
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const seed = today.getFullYear() * 1000 + dayOfYear;

  // Use the seed to pick an index from the verses array
  const verses = versesData as VerseEntry[];
  return seed % verses.length;
};

const getVerseForToday = (): StoredVerse => {
  const verses = versesData as VerseEntry[];
  const index = getDailyVerseIndex();
  const selected = verses[index];

  return {
    verse: selected.text,
    reference: selected.ref,
  };
};

// Sync verse to iOS widget
const syncToWidget = async (verse: StoredVerse): Promise<void> => {
  if (Platform.OS === "ios") {
    try {
      await saveVerseForWidget(verse.verse, verse.reference);
    } catch (error) {
      console.log("Error syncing verse to widget:", error);
    }
  }
};

export const VerseService = {
  async getVerseOfDay(): Promise<StoredVerse> {
    try {
      const storedDate = await AsyncStorage.getItem(VERSE_DATE_KEY);
      const storedVerse = await AsyncStorage.getItem(VERSE_KEY);

      const today = new Date().toDateString();

      // If we have a verse from today, return it
      if (storedDate === today && storedVerse) {
        const verse = JSON.parse(storedVerse);
        // Sync to widget in case it wasn't synced before
        await syncToWidget(verse);
        return verse;
      }

      // Get today's verse based on the date
      const newVerse = getVerseForToday();

      // Save it
      await AsyncStorage.setItem(VERSE_DATE_KEY, today);
      await AsyncStorage.setItem(VERSE_KEY, JSON.stringify(newVerse));

      // Sync to widget
      await syncToWidget(newVerse);

      return newVerse;
    } catch (error) {
      console.error("Error getting verse of day:", error);
      return {
        verse: "Be still, and know that I am God.",
        reference: "Psalm 46:10",
      };
    }
  },

  // Force get a new verse (for testing)
  async getNewVerse(): Promise<StoredVerse> {
    const newVerse = getVerseForToday();
    const today = new Date().toDateString();

    await AsyncStorage.setItem(VERSE_DATE_KEY, today);
    await AsyncStorage.setItem(VERSE_KEY, JSON.stringify(newVerse));

    // Sync to widget
    await syncToWidget(newVerse);

    return newVerse;
  },
};

export default VerseService;

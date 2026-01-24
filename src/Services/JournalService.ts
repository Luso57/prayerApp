import AsyncStorage from "@react-native-async-storage/async-storage";

export interface JournalEntry {
  id: string;
  mood: string;
  moodEmoji: string;
  content: string;
  date: string;
  time: string;
  timestamp: number;
  prayerCategory?: string;
}

const JOURNAL_STORAGE_KEY = "@prayer_journal_entries";
const ENTRIES_PER_PAGE = 20;
const MONTHS_TO_KEEP = 6;

export interface Mood {
  id: string;
  label: string;
  emoji: string;
}

export interface FilterOptions {
  mood?: string;
  startDate?: number;
  endDate?: number;
}

export const MOODS: Mood[] = [
  { id: "grateful", label: "Grateful", emoji: "🙏" },
  { id: "peaceful", label: "Peaceful", emoji: "😌" },
  { id: "joyful", label: "Joyful", emoji: "😊" },
  { id: "hopeful", label: "Hopeful", emoji: "✨" },
  { id: "reflective", label: "Reflective", emoji: "🤔" },
  { id: "anxious", label: "Anxious", emoji: "😰" },
  { id: "sad", label: "Sad", emoji: "😢" },
  { id: "struggling", label: "Struggling", emoji: "😔" },
];

class JournalService {
  private entries: JournalEntry[] = [];
  private isLoaded: boolean = false;

  async loadEntries(): Promise<JournalEntry[]> {
    try {
      const stored = await AsyncStorage.getItem(JOURNAL_STORAGE_KEY);
      if (stored) {
        this.entries = JSON.parse(stored);
      }
      this.isLoaded = true;
      return this.entries;
    } catch (error) {
      console.error("Error loading journal entries:", error);
      return [];
    }
  }

  async saveEntry(
    entry: Omit<JournalEntry, "id" | "date" | "time" | "timestamp">,
  ): Promise<JournalEntry> {
    if (!this.isLoaded) {
      await this.loadEntries();
    }

    const now = new Date();
    const newEntry: JournalEntry = {
      id: `journal_${Date.now()}`,
      ...entry,
      date: now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      timestamp: now.getTime(),
    };

    this.entries.unshift(newEntry);

    // Auto-cleanup old entries
    await this.cleanupOldEntries();

    await this.persistEntries();
    return newEntry;
  }

  async deleteEntry(id: string): Promise<void> {
    this.entries = this.entries.filter((entry) => entry.id !== id);
    await this.persistEntries();
  }

  getEntries(): JournalEntry[] {
    return this.entries;
  }

  getFilteredEntries(filters?: FilterOptions): JournalEntry[] {
    let filtered = [...this.entries];

    if (filters?.mood) {
      filtered = filtered.filter((entry) => entry.mood === filters.mood);
    }

    if (filters?.startDate) {
      filtered = filtered.filter(
        (entry) => entry.timestamp >= filters.startDate!,
      );
    }

    if (filters?.endDate) {
      filtered = filtered.filter(
        (entry) => entry.timestamp <= filters.endDate!,
      );
    }

    return filtered;
  }

  getPaginatedEntries(
    page: number = 0,
    filters?: FilterOptions,
  ): JournalEntry[] {
    const filtered = this.getFilteredEntries(filters);
    const start = page * ENTRIES_PER_PAGE;
    const end = start + ENTRIES_PER_PAGE;
    return filtered.slice(start, end);
  }

  getTotalPages(filters?: FilterOptions): number {
    const filtered = this.getFilteredEntries(filters);
    return Math.ceil(filtered.length / ENTRIES_PER_PAGE);
  }

  getEntriesCount(filters?: FilterOptions): number {
    return this.getFilteredEntries(filters).length;
  }

  private async cleanupOldEntries(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - MONTHS_TO_KEEP);
    const cutoffTimestamp = cutoffDate.getTime();

    const beforeCount = this.entries.length;
    this.entries = this.entries.filter(
      (entry) => entry.timestamp >= cutoffTimestamp,
    );
    const afterCount = this.entries.length;

    if (beforeCount !== afterCount) {
      console.log(`Cleaned up ${beforeCount - afterCount} old journal entries`);
    }
  }

  async deleteOldEntries(
    monthsToKeep: number = MONTHS_TO_KEEP,
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);
    const cutoffTimestamp = cutoffDate.getTime();

    const beforeCount = this.entries.length;
    this.entries = this.entries.filter(
      (entry) => entry.timestamp >= cutoffTimestamp,
    );
    const deletedCount = beforeCount - this.entries.length;

    if (deletedCount > 0) {
      await this.persistEntries();
    }

    return deletedCount;
  }

  private async persistEntries(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        JOURNAL_STORAGE_KEY,
        JSON.stringify(this.entries),
      );
    } catch (error) {
      console.error("Error saving journal entries:", error);
    }
  }
}

export default new JournalService();

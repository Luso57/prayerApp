import AsyncStorage from "@react-native-async-storage/async-storage";

const STREAK_KEY = "@prayer_streak";
const LAST_PRAYER_DATE_KEY = "@last_prayer_date";
const LONGEST_STREAK_KEY = "@longest_streak";
const LAST_PRAYER_TIMESTAMP_KEY = "@last_prayer_timestamp";
const PRAYER_HISTORY_KEY = "@prayer_history";

interface StreakData {
  currentStreak: number;
  lastPrayerDate: string | null; // ISO date string (YYYY-MM-DD)
  longestStreak: number;
}

/**
 * Get the start of a day (midnight) for a given date
 */
const getDateString = (date: Date): string => {
  return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
};

/**
 * Check if two dates are consecutive days
 */
const areConsecutiveDays = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

/**
 * Check if two date strings represent the same day
 */
const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};

export const StreakService = {
  /**
   * Get the current streak data
   */
  async getStreakData(): Promise<StreakData> {
    try {
      const [streakStr, lastPrayerDate, longestStreakStr] = await Promise.all([
        AsyncStorage.getItem(STREAK_KEY),
        AsyncStorage.getItem(LAST_PRAYER_DATE_KEY),
        AsyncStorage.getItem(LONGEST_STREAK_KEY),
      ]);

      const currentStreak = streakStr ? parseInt(streakStr, 10) : 0;
      const longestStreak = longestStreakStr
        ? parseInt(longestStreakStr, 10)
        : 0;

      return {
        currentStreak,
        lastPrayerDate,
        longestStreak,
      };
    } catch (error) {
      console.error("Error getting streak data:", error);
      return { currentStreak: 0, lastPrayerDate: null, longestStreak: 0 };
    }
  },

  /**
   * Get the current streak, checking if it should be reset due to missed days
   */
  async getCurrentStreak(): Promise<number> {
    try {
      const { currentStreak, lastPrayerDate } = await this.getStreakData();

      if (!lastPrayerDate || currentStreak === 0) {
        return 0;
      }

      const today = getDateString(new Date());

      // If last prayer was today, streak is still valid
      if (isSameDay(lastPrayerDate, today)) {
        return currentStreak;
      }

      // If last prayer was yesterday, streak is still valid (they can still pray today)
      if (areConsecutiveDays(lastPrayerDate, today)) {
        return currentStreak;
      }

      // If more than 1 day has passed, streak is broken - reset it
      await this.resetStreak();
      return 0;
    } catch (error) {
      console.error("Error getting current streak:", error);
      return 0;
    }
  },

  /**
   * Record a completed prayer and update the streak
   * Returns the new streak value
   */
  async recordPrayerCompletion(): Promise<number> {
    try {
      const { currentStreak, lastPrayerDate, longestStreak } =
        await this.getStreakData();
      const today = getDateString(new Date());
      const timestamp = new Date().toISOString();

      // If already prayed today, just update the timestamp and return current streak
      if (lastPrayerDate && isSameDay(lastPrayerDate, today)) {
        await AsyncStorage.setItem(LAST_PRAYER_TIMESTAMP_KEY, timestamp);
        // Still add to history even if praying multiple times today
        await this.addPrayerToHistory(today);
        return currentStreak;
      }

      let newStreak: number;

      if (!lastPrayerDate) {
        // First prayer ever - start streak at 1
        newStreak = 1;
      } else if (areConsecutiveDays(lastPrayerDate, today)) {
        // Consecutive day - increment streak
        newStreak = currentStreak + 1;
      } else if (isSameDay(lastPrayerDate, today)) {
        // Same day - keep streak
        newStreak = currentStreak;
      } else {
        // Missed days - start fresh at 1
        newStreak = 1;
      }

      // Update longest streak if needed
      const newLongestStreak = Math.max(longestStreak, newStreak);

      // Save the new data
      await Promise.all([
        AsyncStorage.setItem(STREAK_KEY, newStreak.toString()),
        AsyncStorage.setItem(LAST_PRAYER_DATE_KEY, today),
        AsyncStorage.setItem(LONGEST_STREAK_KEY, newLongestStreak.toString()),
        AsyncStorage.setItem(LAST_PRAYER_TIMESTAMP_KEY, timestamp),
      ]);

      // Add to prayer history
      await this.addPrayerToHistory(today);

      return newStreak;
    } catch (error) {
      console.error("Error recording prayer completion:", error);
      return 0;
    }
  },

  /**
   * Get the last prayer timestamp
   */
  async getLastPrayerTimestamp(): Promise<Date | null> {
    try {
      const timestamp = await AsyncStorage.getItem(LAST_PRAYER_TIMESTAMP_KEY);
      return timestamp ? new Date(timestamp) : null;
    } catch (error) {
      console.error("Error getting last prayer timestamp:", error);
      return null;
    }
  },

  /**
   * Get the longest streak ever achieved
   */
  async getLongestStreak(): Promise<number> {
    try {
      const longestStreakStr = await AsyncStorage.getItem(LONGEST_STREAK_KEY);
      return longestStreakStr ? parseInt(longestStreakStr, 10) : 0;
    } catch (error) {
      console.error("Error getting longest streak:", error);
      return 0;
    }
  },

  /**
   * Check if the user has prayed today
   */
  async hasPrayedToday(): Promise<boolean> {
    try {
      const lastPrayerDate = await AsyncStorage.getItem(LAST_PRAYER_DATE_KEY);
      if (!lastPrayerDate) return false;

      const today = getDateString(new Date());
      return isSameDay(lastPrayerDate, today);
    } catch (error) {
      console.error("Error checking if prayed today:", error);
      return false;
    }
  },

  /**
   * Get the last prayer date
   */
  async getLastPrayerDate(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(LAST_PRAYER_DATE_KEY);
    } catch (error) {
      console.error("Error getting last prayer date:", error);
      return null;
    }
  },

  /**
   * Reset the streak to 0
   */
  async resetStreak(): Promise<void> {
    try {
      await AsyncStorage.setItem(STREAK_KEY, "0");
      // Don't clear lastPrayerDate - we keep it for reference
    } catch (error) {
      console.error("Error resetting streak:", error);
    }
  },

  /**
   * Clear all streak data (for testing/debugging)
   */
  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STREAK_KEY),
        AsyncStorage.removeItem(LAST_PRAYER_DATE_KEY),
        AsyncStorage.removeItem(LONGEST_STREAK_KEY),
        AsyncStorage.removeItem(PRAYER_HISTORY_KEY),
      ]);
    } catch (error) {
      console.error("Error clearing streak data:", error);
    }
  },

  /**
   * Add a prayer date to history
   */
  async addPrayerToHistory(dateString: string): Promise<void> {
    try {
      const historyStr = await AsyncStorage.getItem(PRAYER_HISTORY_KEY);
      const history: string[] = historyStr ? JSON.parse(historyStr) : [];

      // Only add if not already in history
      if (!history.includes(dateString)) {
        history.push(dateString);
        // Keep only last 30 days of history
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoffDate = getDateString(thirtyDaysAgo);

        const recentHistory = history.filter((date) => date >= cutoffDate);
        await AsyncStorage.setItem(
          PRAYER_HISTORY_KEY,
          JSON.stringify(recentHistory),
        );
      }
    } catch (error) {
      console.error("Error adding prayer to history:", error);
    }
  },

  /**
   * Get prayer history for the current week (Monday to Sunday)
   */
  async getWeekPrayerHistory(): Promise<Set<string>> {
    try {
      const historyStr = await AsyncStorage.getItem(PRAYER_HISTORY_KEY);
      const history: string[] = historyStr ? JSON.parse(historyStr) : [];

      // Get Monday of current week
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 6 days from Monday

      const monday = new Date(today);
      monday.setDate(today.getDate() - daysFromMonday);
      const mondayStr = getDateString(monday);

      // Filter history for this week
      const weekHistory = history.filter((date) => date >= mondayStr);
      return new Set(weekHistory);
    } catch (error) {
      console.error("Error getting week prayer history:", error);
      return new Set();
    }
  },
};

export default StreakService;

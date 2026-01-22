import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = '@prayer_streak';
const LAST_OPEN_KEY = '@last_open_date';

interface StreakData {
  streak: number;
  lastOpenDate: string;
}

export const StreakService = {
  /**
   * Get the current streak and update it based on last open date
   * - If opened within 24-48 hours: increment streak
   * - If opened within 24 hours: keep streak (already counted today)
   * - If more than 48 hours: reset to 1
   */
  async getAndUpdateStreak(): Promise<number> {
    try {
      const streakData = await AsyncStorage.getItem(STREAK_KEY);
      const lastOpenData = await AsyncStorage.getItem(LAST_OPEN_KEY);

      const now = new Date();
      const today = now.toDateString();

      if (!streakData || !lastOpenData) {
        // First time user - start streak at 1
        await this.saveStreak(1, today);
        return 1;
      }

      const currentStreak = parseInt(streakData, 10);
      const lastOpenDate = new Date(lastOpenData);
      const lastOpenDay = lastOpenDate.toDateString();

      // Same day - don't increment, just return current streak
      if (today === lastOpenDay) {
        return currentStreak;
      }

      // Calculate hours since last open
      const hoursSinceLastOpen = (now.getTime() - lastOpenDate.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastOpen < 48) {
        // Opened within 48 hours on a new day - increment streak
        const newStreak = currentStreak + 1;
        await this.saveStreak(newStreak, today);
        return newStreak;
      } else {
        // More than 48 hours - reset streak to 1
        await this.saveStreak(1, today);
        return 1;
      }
    } catch (error) {
      console.error('Error getting streak:', error);
      return 1;
    }
  },

  async saveStreak(streak: number, dateString: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STREAK_KEY, streak.toString());
      await AsyncStorage.setItem(LAST_OPEN_KEY, dateString);
    } catch (error) {
      console.error('Error saving streak:', error);
    }
  },

  async resetStreak(): Promise<void> {
    try {
      const today = new Date().toDateString();
      await this.saveStreak(1, today);
    } catch (error) {
      console.error('Error resetting streak:', error);
    }
  },

  async getCurrentStreak(): Promise<number> {
    try {
      const streakData = await AsyncStorage.getItem(STREAK_KEY);
      return streakData ? parseInt(streakData, 10) : 0;
    } catch (error) {
      console.error('Error getting current streak:', error);
      return 0;
    }
  },
};

export default StreakService;

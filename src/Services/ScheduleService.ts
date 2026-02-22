import AsyncStorage from "@react-native-async-storage/async-storage";

const SCHEDULES_KEY = "@prayer_schedules";

export interface PrayerSchedule {
  id: string;
  name: string;
  time: Date; // Stored as ISO string, converted to Date
  daysOfWeek: number[]; // 0 = Sunday, 6 = Saturday
  enabled: boolean;
  appTokens: string[]; // Will store app selection tokens
  notifyBefore?: number; // Minutes before lock
  isCustom: boolean; // true for custom times, false for presets
  icon?: string; // Emoji icon
}

export interface StoredSchedule {
  id: string;
  name: string;
  time: string; // ISO string for storage
  daysOfWeek: number[];
  enabled: boolean;
  appTokens: string[];
  notifyBefore?: number;
  isCustom: boolean;
  icon?: string;
}

class ScheduleService {
  private schedules: PrayerSchedule[] = [];
  private isLoaded: boolean = false;

  async loadSchedules(): Promise<PrayerSchedule[]> {
    try {
      const data = await AsyncStorage.getItem(SCHEDULES_KEY);
      if (data) {
        const stored: StoredSchedule[] = JSON.parse(data);
        this.schedules = stored.map((s) => ({
          ...s,
          time: new Date(s.time),
        }));
      }
      this.isLoaded = true;
      return this.schedules;
    } catch (error) {
      console.error("Error loading schedules:", error);
      return [];
    }
  }

  async saveSchedule(
    schedule: Omit<PrayerSchedule, "id"> & { id?: string },
  ): Promise<PrayerSchedule> {
    if (!this.isLoaded) {
      await this.loadSchedules();
    }

    const newSchedule: PrayerSchedule = {
      id: schedule.id || `schedule_${Date.now()}`,
      ...schedule,
    };

    const existingIndex = this.schedules.findIndex(
      (s) => s.id === newSchedule.id,
    );

    if (existingIndex >= 0) {
      this.schedules[existingIndex] = newSchedule;
    } else {
      this.schedules.push(newSchedule);
    }

    await this.persistSchedules();
    return newSchedule;
  }

  async deleteSchedule(id: string): Promise<void> {
    if (!this.isLoaded) {
      await this.loadSchedules();
    }

    this.schedules = this.schedules.filter((s) => s.id !== id);
    await this.persistSchedules();
  }

  async updateScheduleApps(id: string, appTokens: string[]): Promise<void> {
    if (!this.isLoaded) {
      await this.loadSchedules();
    }

    const schedule = this.schedules.find((s) => s.id === id);
    if (schedule) {
      schedule.appTokens = appTokens;
      await this.persistSchedules();
    }
  }

  async toggleSchedule(id: string, enabled: boolean): Promise<void> {
    if (!this.isLoaded) {
      await this.loadSchedules();
    }

    const schedule = this.schedules.find((s) => s.id === id);
    if (schedule) {
      schedule.enabled = enabled;
      await this.persistSchedules();
    }
  }

  getSchedules(): PrayerSchedule[] {
    return this.schedules;
  }

  getEnabledSchedules(): PrayerSchedule[] {
    return this.schedules.filter((s) => s.enabled);
  }

  getNextScheduledTime(): { schedule: PrayerSchedule; time: Date } | null {
    const enabled = this.getEnabledSchedules();
    if (enabled.length === 0) return null;

    const now = new Date();
    let next: { schedule: PrayerSchedule; time: Date } | null = null;

    for (const schedule of enabled) {
      const scheduleDate = new Date(schedule.time);
      const scheduleHour = scheduleDate.getHours();
      const scheduleMinute = scheduleDate.getMinutes();

      for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
        const candidate = new Date(now);
        candidate.setDate(now.getDate() + dayOffset);

        // Keep Sunday=0 ... Saturday=6 to match stored schedule days.
        const candidateWeekday = candidate.getDay();
        if (!schedule.daysOfWeek.includes(candidateWeekday)) {
          continue;
        }

        candidate.setHours(scheduleHour, scheduleMinute, 0, 0);

        // "Next" must be in the future.
        if (candidate <= now) {
          continue;
        }

        if (!next || candidate < next.time) {
          next = { schedule, time: candidate };
        }

        // Found the earliest valid day for this schedule.
        break;
      }
    }

    return next;
  }

  async clearAllSchedules(): Promise<void> {
    this.schedules = [];
    await this.persistSchedules();
  }

  private async persistSchedules(): Promise<void> {
    try {
      const stored: StoredSchedule[] = this.schedules.map((s) => ({
        ...s,
        time: s.time.toISOString(),
      }));
      await AsyncStorage.setItem(SCHEDULES_KEY, JSON.stringify(stored));
    } catch (error) {
      console.error("Error saving schedules:", error);
    }
  }
}

export default new ScheduleService();

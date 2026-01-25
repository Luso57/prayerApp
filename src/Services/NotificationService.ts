import { Platform, Linking, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import type { PrayerSchedule } from "./ScheduleService";

const PRAYER_REMINDER_IDS_KEY = "@prayer_reminder_notification_ids";
const PRAYER_REMINDER_DEEPLINK = "prayerlock://pray";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the user.
 * This MUST be called from the main app before using shield actions,
 * as extensions cannot reliably request permissions.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== "ios") {
    return true; // Android handles this differently
  }

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permission not granted");
      return false;
    }

    console.log("Notification permission granted");
    return true;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
}

/**
 * Check if notification permissions are granted.
 */
export async function hasNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== "ios") {
    return true;
  }

  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/**
 * Ensure notification permission is granted.
 * Shows an alert if permission is denied.
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  const hasPermission = await hasNotificationPermission();

  if (!hasPermission) {
    const granted = await requestNotificationPermission();

    if (!granted) {
      Alert.alert(
        "Notifications Required",
        "To receive reminders when your apps are locked, please enable notifications in Settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
          },
        ],
      );
      return false;
    }
  }

  return true;
}

/**
 * Add a listener for notification responses (when user taps notification).
 * Returns a subscription that should be removed when component unmounts.
 */
export function addNotificationResponseListener(
  callback: (url: string) => void,
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    const deeplink = data?.deeplink as string | undefined;

    if (deeplink) {
      callback(deeplink);
    }
  });
}

/**
 * Get the notification response that launched the app (if any).
 * Returns the deeplink URL if the app was opened via notification.
 */
export async function getInitialNotificationDeeplink(): Promise<string | null> {
  const response = await Notifications.getLastNotificationResponseAsync();

  if (response) {
    const data = response.notification.request.content.data;
    return (data?.deeplink as string) || null;
  }

  return null;
}

const buildWeeklyTrigger = (
  dayOfWeek: number,
  time: Date,
  notifyBeforeMinutes?: number,
): Notifications.WeeklyTriggerInput => {
  const baseSunday = new Date(2020, 0, 5); // Sunday
  const triggerDate = new Date(baseSunday);
  triggerDate.setDate(baseSunday.getDate() + dayOfWeek);
  triggerDate.setHours(time.getHours(), time.getMinutes(), 0, 0);

  if (notifyBeforeMinutes && notifyBeforeMinutes > 0) {
    triggerDate.setMinutes(triggerDate.getMinutes() - notifyBeforeMinutes);
  }

  const weekday = triggerDate.getDay() + 1; // Expo: 1=Sunday ... 7=Saturday
  return {
    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
    weekday,
    hour: triggerDate.getHours(),
    minute: triggerDate.getMinutes(),
  };
};

const getStoredReminderIds = async (): Promise<string[]> => {
  const stored = await AsyncStorage.getItem(PRAYER_REMINDER_IDS_KEY);
  return stored ? (JSON.parse(stored) as string[]) : [];
};

const setStoredReminderIds = async (ids: string[]): Promise<void> => {
  await AsyncStorage.setItem(PRAYER_REMINDER_IDS_KEY, JSON.stringify(ids));
};

/**
 * Cancel previously scheduled prayer reminder notifications.
 */
export async function cancelPrayerReminders(): Promise<void> {
  const ids = await getStoredReminderIds();
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
  await setStoredReminderIds([]);
}

/**
 * Schedule weekly prayer reminders based on enabled schedules.
 */
export async function syncPrayerReminders(
  schedules: PrayerSchedule[],
): Promise<void> {
  await cancelPrayerReminders();

  const hasPermission = await hasNotificationPermission();
  if (!hasPermission) return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("prayer-reminders", {
      name: "Prayer Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
    });
  }

  const enabledSchedules = schedules.filter(
    (schedule) => schedule.enabled && schedule.daysOfWeek.length > 0,
  );

  if (enabledSchedules.length === 0) {
    await setStoredReminderIds([]);
    return;
  }

  const scheduledIds: string[] = [];

  for (const schedule of enabledSchedules) {
    for (const day of schedule.daysOfWeek) {
      const trigger = buildWeeklyTrigger(
        day,
        schedule.time,
        schedule.notifyBefore,
      );

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to Pray 🙏",
          body: "Take a moment to pray and keep your streak alive.",
          data: { deeplink: PRAYER_REMINDER_DEEPLINK },
          sound: "default",
        },
        trigger,
      });

      scheduledIds.push(id);
    }
  }

  await setStoredReminderIds(scheduledIds);
}

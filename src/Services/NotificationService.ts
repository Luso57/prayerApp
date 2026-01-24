import { Platform, Linking, Alert } from "react-native";
import * as Notifications from "expo-notifications";

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

import { NativeModules, Platform } from "react-native";
import { ensureNotificationPermission } from "./NotificationService";

const { AppLockModule } = NativeModules;

function assertIOS() {
  if (Platform.OS !== "ios") {
    throw new Error("App Lock is only supported on iOS (FamilyControls).");
  }
  if (!AppLockModule) {
    throw new Error("AppLockModule not found. Did you rebuild the iOS app?");
  }
}

export async function requestScreenTimePermission(): Promise<boolean> {
  assertIOS();

  // Also ensure notification permission for shield action callbacks
  await ensureNotificationPermission();

  return AppLockModule.requestAuthorization();
}

export async function pickAppsToLock(): Promise<boolean> {
  assertIOS();
  return AppLockModule.pickApps();
}

export async function lockPickedApps(): Promise<boolean> {
  assertIOS();
  return AppLockModule.lockApps();
}

export async function unlockAllApps(): Promise<boolean> {
  assertIOS();
  return AppLockModule.unlockAll();
}

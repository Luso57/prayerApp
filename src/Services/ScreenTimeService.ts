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

export async function pickAppsForSchedule(scheduleId: string): Promise<number> {
  assertIOS();
  return AppLockModule.pickAppsForSchedule(scheduleId);
}

// MARK: - DeviceActivity Schedule Methods

/**
 * Start a DeviceActivity schedule that will automatically lock apps
 * at the specified times (even when app is closed)
 */
export async function startSchedule(
  scheduleId: string,
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
  daysOfWeek: number[],
): Promise<boolean> {
  assertIOS();
  return AppLockModule.startSchedule(
    scheduleId,
    startHour,
    startMinute,
    endHour,
    endMinute,
    daysOfWeek,
  );
}

/**
 * Stop a specific schedule by ID
 */
export async function stopSchedule(scheduleId: string): Promise<boolean> {
  assertIOS();
  return AppLockModule.stopSchedule(scheduleId);
}

/**
 * Stop all active schedules
 */
export async function stopAllSchedules(): Promise<boolean> {
  assertIOS();
  return AppLockModule.stopAllSchedules();
}

/**
 * Get list of currently active schedule IDs
 */
export async function getActiveSchedules(): Promise<string[]> {
  assertIOS();
  return AppLockModule.getActiveSchedules();
}

/**
 * Get current lock status including whether apps are locked and when
 */
export interface LockStatus {
  isLocked: boolean;
  lockedAt?: number; // Unix timestamp in milliseconds
  scheduleId?: string;
}

export async function getLockStatus(): Promise<LockStatus> {
  assertIOS();
  return AppLockModule.getLockStatus();
}

// MARK: - Immediate Lock/Unlock (for testing or manual control)

export async function lockPickedApps(): Promise<boolean> {
  assertIOS();
  return AppLockModule.lockApps();
}

export async function unlockAllApps(): Promise<boolean> {
  assertIOS();
  return AppLockModule.unlockAll();
}

// MARK: - Verse Widget Methods

/**
 * Save verse to App Group for widget access and refresh the widget
 */
export async function saveVerseForWidget(
  text: string,
  reference: string,
): Promise<boolean> {
  assertIOS();
  return AppLockModule.saveVerseForWidget(text, reference);
}

/**
 * Refresh the verse widget
 */
export async function refreshVerseWidget(): Promise<boolean> {
  assertIOS();
  return AppLockModule.refreshVerseWidget();
}

// MARK: - Theme Methods

/**
 * Save the current theme to App Group for Shield extension access
 */
export async function saveThemeForShield(themeName: string): Promise<boolean> {
  assertIOS();
  return AppLockModule.saveThemeForShield(themeName);
}

import { NativeModules, Platform } from "react-native";

const { ScreenTimeModule } = NativeModules;

export interface AppPickerResult {
  success: boolean;
  appsSelected: number;
  categoriesSelected: number;
}

export interface LockedAppsCount {
  appsCount: number;
  categoriesCount: number;
}

/**
 * Service for managing iOS Screen Time app restrictions
 * Note: This only works on iOS 16+ with Family Controls capability
 */
export const ScreenTimeService = {
  /**
   * Check if Screen Time is available on this device
   */
  isAvailable(): boolean {
    return Platform.OS === "ios" && ScreenTimeModule != null;
  },

  /**
   * Request authorization to use Screen Time features
   * User will be prompted to allow the app to manage Screen Time
   */
  async requestAuthorization(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn("Screen Time is not available on this device");
      return false;
    }

    try {
      return await ScreenTimeModule.requestAuthorization();
    } catch (error) {
      console.error("Failed to request Screen Time authorization:", error);
      return false;
    }
  },

  /**
   * Check if the app has Screen Time authorization
   */
  async isAuthorized(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      return await ScreenTimeModule.isAuthorized();
    } catch (error) {
      console.error("Failed to check Screen Time authorization:", error);
      return false;
    }
  },

  /**
   * Present the iOS app picker to select apps to lock
   * Returns the result with number of apps and categories selected
   */
  async presentAppPicker(): Promise<AppPickerResult | null> {
    if (!this.isAvailable()) {
      console.warn("Screen Time is not available on this device");
      return null;
    }

    try {
      const result = await ScreenTimeModule.presentAppPicker();
      return result as AppPickerResult;
    } catch (error) {
      console.error("Failed to present app picker:", error);
      return null;
    }
  },

  /**
   * Clear all app restrictions (unlock all apps)
   */
  async clearRestrictions(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      return await ScreenTimeModule.clearRestrictions();
    } catch (error) {
      console.error("Failed to clear restrictions:", error);
      return false;
    }
  },

  /**
   * Get the count of currently locked apps and categories
   */
  async getLockedAppsCount(): Promise<LockedAppsCount> {
    if (!this.isAvailable()) {
      return { appsCount: 0, categoriesCount: 0 };
    }

    try {
      return await ScreenTimeModule.getLockedAppsCount();
    } catch (error) {
      console.error("Failed to get locked apps count:", error);
      return { appsCount: 0, categoriesCount: 0 };
    }
  },
};

export default ScreenTimeService;

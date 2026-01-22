/**
 * RevenueCat Service
 * Centralized service for handling all RevenueCat SDK operations
 * including initialization, purchases, entitlements, and customer info.
 */

import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  PurchasesError,
} from "react-native-purchases";
import { Platform } from "react-native";

// RevenueCat Configuration
const REVENUECAT_CONFIG = {
  // API Keys - Use iOS key for iOS, Android key for Android
  // For testing, you can use the same key for both platforms
  IOS_API_KEY: "test_ynmKBaotnZMYqFcmDDQFqrgYwsR",
  ANDROID_API_KEY: "test_ynmKBaotnZMYqFcmDDQFqrgYwsR", // Replace with Android key when available

  // Entitlement identifier configured in RevenueCat dashboard
  ENTITLEMENT_ID: "Prayfirst Pro",

  // Product identifiers (should match what's configured in App Store Connect / Google Play Console)
  PRODUCTS: {
    MONTHLY: "monthly",
    YEARLY: "yearly",
  },
} as const;

// Error types for better error handling
export interface RevenueCatError {
  code: PURCHASES_ERROR_CODE | string;
  message: string;
  underlyingErrorMessage?: string;
}

// Subscription status interface
export interface SubscriptionStatus {
  isSubscribed: boolean;
  activeEntitlements: string[];
  expirationDate: Date | null;
  willRenew: boolean;
  productIdentifier: string | null;
}

/**
 * RevenueCat Service - Handles all RevenueCat SDK operations
 */
export const RevenueCatService = {
  /**
   * Initialize RevenueCat SDK
   * Should be called once when app starts, typically in App.tsx
   */
  async initialize(): Promise<void> {
    try {
      // Enable debug logs in development
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      // Configure RevenueCat with the appropriate API key
      const apiKey =
        Platform.OS === "ios"
          ? REVENUECAT_CONFIG.IOS_API_KEY
          : REVENUECAT_CONFIG.ANDROID_API_KEY;

      await Purchases.configure({ apiKey });

      console.log("[RevenueCat] SDK initialized successfully");
    } catch (error) {
      console.error("[RevenueCat] Failed to initialize SDK:", error);
      throw error;
    }
  },

  /**
   * Get the current customer info
   * Contains entitlements, active subscriptions, and purchase history
   */
  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error("[RevenueCat] Failed to get customer info:", error);
      throw this.handleError(error);
    }
  },

  /**
   * Check if user has the Prayfirst Pro entitlement
   */
  async isPro(): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo();
      return this.checkProEntitlement(customerInfo);
    } catch (error) {
      console.error("[RevenueCat] Failed to check pro status:", error);
      return false;
    }
  },

  /**
   * Check if customer info has the Pro entitlement
   */
  checkProEntitlement(customerInfo: CustomerInfo): boolean {
    const entitlement =
      customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID];
    return entitlement !== undefined && entitlement.isActive;
  },

  /**
   * Get detailed subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const customerInfo = await this.getCustomerInfo();
      const entitlement =
        customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID];

      return {
        isSubscribed: entitlement !== undefined && entitlement.isActive,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
        expirationDate: entitlement?.expirationDate
          ? new Date(entitlement.expirationDate)
          : null,
        willRenew: entitlement?.willRenew ?? false,
        productIdentifier: entitlement?.productIdentifier ?? null,
      };
    } catch (error) {
      console.error("[RevenueCat] Failed to get subscription status:", error);
      return {
        isSubscribed: false,
        activeEntitlements: [],
        expirationDate: null,
        willRenew: false,
        productIdentifier: null,
      };
    }
  },

  /**
   * Get available offerings (products) from RevenueCat
   */
  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();

      if (offerings.current !== null) {
        console.log(
          "[RevenueCat] Current offering:",
          offerings.current.identifier,
        );
        return offerings.current;
      }

      console.log("[RevenueCat] No current offering available");
      return null;
    } catch (error) {
      console.error("[RevenueCat] Failed to get offerings:", error);
      throw this.handleError(error);
    }
  },

  /**
   * Purchase a package
   * @param pkg - The package to purchase
   * @returns CustomerInfo after successful purchase
   */
  async purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      console.log("[RevenueCat] Purchase successful");
      return customerInfo;
    } catch (error) {
      const revenueCatError = error as PurchasesError;

      // User cancelled - not an error
      if (
        revenueCatError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
      ) {
        console.log("[RevenueCat] User cancelled purchase");
        throw { code: "CANCELLED", message: "Purchase cancelled by user" };
      }

      console.error("[RevenueCat] Purchase failed:", error);
      throw this.handleError(error);
    }
  },

  /**
   * Restore previous purchases
   * Useful for users who reinstall the app or switch devices
   */
  async restorePurchases(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      console.log("[RevenueCat] Purchases restored successfully");
      return customerInfo;
    } catch (error) {
      console.error("[RevenueCat] Failed to restore purchases:", error);
      throw this.handleError(error);
    }
  },

  /**
   * Log in a user with their app user ID
   * Use this to identify users across devices
   * @param userId - Your app's user identifier
   */
  async logIn(userId: string): Promise<CustomerInfo> {
    try {
      const { customerInfo } = await Purchases.logIn(userId);
      console.log("[RevenueCat] User logged in:", userId);
      return customerInfo;
    } catch (error) {
      console.error("[RevenueCat] Failed to log in user:", error);
      throw this.handleError(error);
    }
  },

  /**
   * Log out the current user
   * This will create a new anonymous user
   */
  async logOut(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.logOut();
      console.log("[RevenueCat] User logged out");
      return customerInfo;
    } catch (error) {
      console.error("[RevenueCat] Failed to log out:", error);
      throw this.handleError(error);
    }
  },

  /**
   * Get the current app user ID
   */
  async getAppUserId(): Promise<string> {
    try {
      const appUserId = await Purchases.getAppUserID();
      return appUserId;
    } catch (error) {
      console.error("[RevenueCat] Failed to get app user ID:", error);
      throw this.handleError(error);
    }
  },

  /**
   * Add a listener for customer info updates
   * Call this to react to subscription changes in real-time
   * @returns A function to remove the listener
   */
  addCustomerInfoListener(
    listener: (customerInfo: CustomerInfo) => void,
  ): () => void {
    Purchases.addCustomerInfoUpdateListener(listener);
    // Return a no-op function since the SDK handles cleanup internally
    return () => {};
  },

  /**
   * Handle and normalize errors from RevenueCat
   */
  handleError(error: unknown): RevenueCatError {
    if (error && typeof error === "object" && "code" in error) {
      const purchasesError = error as unknown as PurchasesError;
      return {
        code: purchasesError.code || "UNKNOWN",
        message: purchasesError.message || "An unknown error occurred",
        underlyingErrorMessage: purchasesError.underlyingErrorMessage,
      };
    }
    if (error instanceof Error) {
      return {
        code: "UNKNOWN",
        message: error.message || "An unknown error occurred",
      };
    }
    return {
      code: "UNKNOWN",
      message: "An unknown error occurred",
    };
  },

  /**
   * Get human-readable error message
   */
  getErrorMessage(error: RevenueCatError): string {
    switch (error.code) {
      case PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR:
        return "Purchase was cancelled.";
      case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
        return "Purchases are not allowed on this device.";
      case PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR:
        return "The purchase was invalid.";
      case PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
        return "This product is not available for purchase.";
      case PURCHASES_ERROR_CODE.NETWORK_ERROR:
        return "Network error. Please check your connection.";
      case PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR:
        return "This receipt is already in use by another user.";
      case PURCHASES_ERROR_CODE.INVALID_CREDENTIALS_ERROR:
        return "Invalid credentials. Please try again.";
      case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
        return "There was a problem with the store. Please try again.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  },

  // Export configuration for use in other parts of the app
  config: REVENUECAT_CONFIG,
};

export default RevenueCatService;

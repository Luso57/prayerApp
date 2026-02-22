import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
} from "react-native-purchases";

// RevenueCat API Keys
const API_KEYS = {
  ios: "appl_iGhWlGbnoskoUolqxliVFHglypX",
  android: "test_ynmKBaotnZMYqFcmDDQFqrgYwsR",
};

// Entitlement identifiers configured in RevenueCat dashboard
export const ENTITLEMENTS = {
  PRO: "Prayfirst Pro",
} as const;

// Product identifiers
export const PRODUCTS = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export type EntitlementKey = keyof typeof ENTITLEMENTS;

/**
 * Initialize RevenueCat SDK
 * Should be called once at app startup
 */
export async function initializeRevenueCat(appUserId?: string): Promise<void> {
  try {
    // Enable debug logging in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    const apiKey = Platform.OS === "ios" ? API_KEYS.ios : API_KEYS.android;
    if (!__DEV__ && apiKey.startsWith("test_")) {
      throw new Error(
        "RevenueCat is configured with a test API key in a non-development build.",
      );
    }

    await Purchases.configure({
      apiKey,
      appUserID: appUserId ?? null,
    });

    console.log("RevenueCat initialized successfully");
  } catch (error) {
    console.error("Failed to initialize RevenueCat:", error);
    throw error;
  }
}

/**
 * Get current customer info including entitlements
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error("Failed to get customer info:", error);
    throw error;
  }
}

/**
 * Check if user has an active entitlement
 */
export async function checkEntitlement(
  entitlementId: string = ENTITLEMENTS.PRO,
): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return (
      typeof customerInfo.entitlements.active[entitlementId] !== "undefined"
    );
  } catch (error) {
    console.error("Failed to check entitlement:", error);
    return false;
  }
}

/**
 * Check if user has Prayfirst Pro access
 */
export async function hasPrayfirstPro(): Promise<boolean> {
  return checkEntitlement(ENTITLEMENTS.PRO);
}

/**
 * Get all available offerings
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current && offerings.current.availablePackages.length > 0) {
      return offerings.current;
    }
    return null;
  } catch (error) {
    console.error("Failed to get offerings:", error);
    throw error;
  }
}

/**
 * Get specific packages (monthly, yearly) from the current offering
 */
export async function getSubscriptionPackages(): Promise<{
  monthly: PurchasesPackage | null;
  yearly: PurchasesPackage | null;
  all: PurchasesPackage[];
}> {
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;

    if (!current) {
      return { monthly: null, yearly: null, all: [] };
    }

    return {
      monthly: current.monthly ?? null,
      yearly: current.annual ?? null,
      all: current.availablePackages,
    };
  } catch (error) {
    console.error("Failed to get subscription packages:", error);
    throw error;
  }
}

/**
 * Purchase a specific package
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<{
  success: boolean;
  customerInfo: CustomerInfo | null;
  error?: string;
}> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);

    // Check if purchase granted the pro entitlement
    const hasAccess =
      typeof customerInfo.entitlements.active[ENTITLEMENTS.PRO] !== "undefined";

    return {
      success: hasAccess,
      customerInfo,
    };
  } catch (error: any) {
    // Check if user cancelled
    if (error.userCancelled) {
      return {
        success: false,
        customerInfo: null,
        error: "Purchase cancelled",
      };
    }

    console.error("Purchase failed:", error);
    return {
      success: false,
      customerInfo: null,
      error: error.message || "Purchase failed",
    };
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo: CustomerInfo | null;
  error?: string;
}> {
  try {
    const customerInfo = await Purchases.restorePurchases();

    // Check if restore granted any entitlements
    const hasAccess = Object.keys(customerInfo.entitlements.active).length > 0;

    return {
      success: hasAccess,
      customerInfo,
    };
  } catch (error: any) {
    console.error("Restore failed:", error);
    return {
      success: false,
      customerInfo: null,
      error: error.message || "Restore failed",
    };
  }
}

/**
 * Add listener for customer info updates
 * Returns a function to remove the listener
 */
export function addCustomerInfoListener(
  callback: (customerInfo: CustomerInfo) => void,
): () => void {
  Purchases.addCustomerInfoUpdateListener(callback);
  // The listener is managed by RevenueCat SDK internally
  // Return empty cleanup function as the SDK handles listener lifecycle
  return () => {};
}

/**
 * Identify a user (login)
 */
export async function identifyUser(appUserId: string): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.logIn(appUserId);
    return customerInfo;
  } catch (error) {
    console.error("Failed to identify user:", error);
    throw error;
  }
}

/**
 * Logout user (reset to anonymous)
 */
export async function logoutUser(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.logOut();
    return customerInfo;
  } catch (error) {
    console.error("Failed to logout user:", error);
    throw error;
  }
}

/**
 * Get the subscription management URL
 */
export async function getManagementURL(): Promise<string | null> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.managementURL;
  } catch (error) {
    console.error("Failed to get management URL:", error);
    return null;
  }
}

/**
 * Format price for display
 */
export function formatPackagePrice(pkg: PurchasesPackage): string {
  return pkg.product.priceString;
}

/**
 * Get package duration description
 */
export function getPackageDuration(pkg: PurchasesPackage): string {
  switch (pkg.packageType) {
    case "MONTHLY":
      return "per month";
    case "ANNUAL":
      return "per year";
    case "WEEKLY":
      return "per week";
    case "LIFETIME":
      return "lifetime";
    default:
      return "";
  }
}

/**
 * Calculate savings percentage for yearly vs monthly
 */
export function calculateYearlySavings(
  monthlyPackage: PurchasesPackage | null,
  yearlyPackage: PurchasesPackage | null,
): number {
  if (!monthlyPackage || !yearlyPackage) return 0;

  const monthlyPrice = monthlyPackage.product.price;
  const yearlyPrice = yearlyPackage.product.price;
  const yearlyCostIfMonthly = monthlyPrice * 12;

  if (yearlyCostIfMonthly === 0) return 0;

  const savings =
    ((yearlyCostIfMonthly - yearlyPrice) / yearlyCostIfMonthly) * 100;
  return Math.round(savings);
}

/**
 * Get active subscription details
 */
export async function getActiveSubscriptionDetails(): Promise<{
  isActive: boolean;
  productIdentifier: string | null;
  expirationDate: string | null;
  willRenew: boolean;
} | null> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const proEntitlement = customerInfo.entitlements.active[ENTITLEMENTS.PRO];

    if (!proEntitlement) {
      return {
        isActive: false,
        productIdentifier: null,
        expirationDate: null,
        willRenew: false,
      };
    }

    return {
      isActive: true,
      productIdentifier: proEntitlement.productIdentifier,
      expirationDate: proEntitlement.expirationDate,
      willRenew: Boolean(proEntitlement.willRenew),
    };
  } catch (error) {
    console.error("Failed to get subscription details:", error);
    return null;
  }
}

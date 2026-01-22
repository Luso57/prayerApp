/**
 * Subscription Types
 * TypeScript interfaces and types for subscription management
 */

import {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";

/**
 * Subscription tier enum
 */
export enum SubscriptionTier {
  FREE = "free",
  PRO = "pro",
}

/**
 * Subscription period type
 */
export type SubscriptionPeriod = "monthly" | "yearly";

/**
 * Subscription status information
 */
export interface SubscriptionStatus {
  isSubscribed: boolean;
  tier: SubscriptionTier;
  activeEntitlements: string[];
  expirationDate: Date | null;
  willRenew: boolean;
  productIdentifier: string | null;
  isTrialing: boolean;
}

/**
 * Package information for display
 */
export interface PackageInfo {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    title: string;
    description: string;
    price: number;
    priceString: string;
    currencyCode: string;
  };
  offeringIdentifier: string;
}

/**
 * Subscription context state
 */
export interface SubscriptionState {
  isLoading: boolean;
  isInitialized: boolean;
  customerInfo: CustomerInfo | null;
  currentOffering: PurchasesOffering | null;
  status: SubscriptionStatus;
  error: string | null;
}

/**
 * Subscription context actions
 */
export interface SubscriptionActions {
  refreshCustomerInfo: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  presentPaywall: () => Promise<boolean>;
  presentPaywallIfNeeded: () => Promise<boolean>;
  presentCustomerCenter: () => Promise<void>;
  checkProAccess: () => boolean;
}

/**
 * Full subscription context type
 */
export interface SubscriptionContextType
  extends SubscriptionState, SubscriptionActions {}

/**
 * Default subscription status for unauthenticated/free users
 */
export const DEFAULT_SUBSCRIPTION_STATUS: SubscriptionStatus = {
  isSubscribed: false,
  tier: SubscriptionTier.FREE,
  activeEntitlements: [],
  expirationDate: null,
  willRenew: false,
  productIdentifier: null,
  isTrialing: false,
};

/**
 * Paywall result types
 */
export enum PaywallResult {
  NOT_PRESENTED = "NOT_PRESENTED",
  ERROR = "ERROR",
  CANCELLED = "CANCELLED",
  PURCHASED = "PURCHASED",
  RESTORED = "RESTORED",
}

/**
 * Pro features list for marketing/display purposes
 */
export const PRO_FEATURES = [
  {
    id: "unlimited_prayers",
    title: "Unlimited Prayer Requests",
    description: "Create and track unlimited prayer requests",
    icon: "🙏",
  },
  {
    id: "prayer_reminders",
    title: "Custom Prayer Reminders",
    description: "Set personalized reminders to pray",
    icon: "⏰",
  },
  {
    id: "verse_library",
    title: "Full Bible Verse Library",
    description: "Access our complete collection of encouraging verses",
    icon: "📖",
  },
  {
    id: "prayer_journal",
    title: "Prayer Journal",
    description: "Record your prayer journey and answered prayers",
    icon: "📝",
  },
  {
    id: "no_ads",
    title: "Ad-Free Experience",
    description: "Focus on prayer without interruptions",
    icon: "✨",
  },
  {
    id: "streak_insights",
    title: "Streak Insights",
    description: "Track your prayer habits with detailed analytics",
    icon: "📊",
  },
] as const;

/**
 * Subscription plan details for custom paywall display
 */
export interface SubscriptionPlan {
  id: SubscriptionPeriod;
  name: string;
  price: string;
  pricePerMonth: string;
  savings?: string;
  popular?: boolean;
  trialDays?: number;
}

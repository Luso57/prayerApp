/**
 * Subscription Context
 * React Context for managing subscription state across the app
 * Provides access to subscription status, purchase methods, and paywall display
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import RevenueCatService from "../Services/RevenueCatService";
import {
  SubscriptionContextType,
  SubscriptionStatus,
  SubscriptionTier,
  DEFAULT_SUBSCRIPTION_STATUS,
} from "../types/subscription";

// Create the context with undefined initial value
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined,
);

interface SubscriptionProviderProps {
  children: ReactNode;
}

/**
 * Subscription Provider Component
 * Wraps the app to provide subscription state and methods
 */
export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentOffering, setCurrentOffering] =
    useState<PurchasesOffering | null>(null);
  const [status, setStatus] = useState<SubscriptionStatus>(
    DEFAULT_SUBSCRIPTION_STATUS,
  );
  const [error, setError] = useState<string | null>(null);

  /**
   * Convert CustomerInfo to SubscriptionStatus
   */
  const getStatusFromCustomerInfo = useCallback(
    (info: CustomerInfo): SubscriptionStatus => {
      const entitlement =
        info.entitlements.active[RevenueCatService.config.ENTITLEMENT_ID];
      const isSubscribed = entitlement !== undefined && entitlement.isActive;

      return {
        isSubscribed,
        tier: isSubscribed ? SubscriptionTier.PRO : SubscriptionTier.FREE,
        activeEntitlements: Object.keys(info.entitlements.active),
        expirationDate: entitlement?.expirationDate
          ? new Date(entitlement.expirationDate)
          : null,
        willRenew: entitlement?.willRenew ?? false,
        productIdentifier: entitlement?.productIdentifier ?? null,
        isTrialing: entitlement?.periodType === "TRIAL",
      };
    },
    [],
  );

  /**
   * Initialize RevenueCat SDK
   */
  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize the SDK
        await RevenueCatService.initialize();

        // Get initial customer info and offerings
        const [info, offering] = await Promise.all([
          RevenueCatService.getCustomerInfo(),
          RevenueCatService.getOfferings(),
        ]);

        setCustomerInfo(info);
        setCurrentOffering(offering);
        setStatus(getStatusFromCustomerInfo(info));
        setIsInitialized(true);

        console.log("[SubscriptionContext] Initialized successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to initialize subscriptions";
        console.error("[SubscriptionContext] Initialization error:", err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeRevenueCat();
  }, [getStatusFromCustomerInfo]);

  /**
   * Listen for customer info updates
   */
  useEffect(() => {
    if (!isInitialized) return;

    const removeListener = RevenueCatService.addCustomerInfoListener((info) => {
      console.log("[SubscriptionContext] Customer info updated");
      setCustomerInfo(info);
      setStatus(getStatusFromCustomerInfo(info));
    });

    return () => {
      removeListener();
    };
  }, [isInitialized, getStatusFromCustomerInfo]);

  /**
   * Refresh customer info manually
   */
  const refreshCustomerInfo = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const [info, offering] = await Promise.all([
        RevenueCatService.getCustomerInfo(),
        RevenueCatService.getOfferings(),
      ]);

      setCustomerInfo(info);
      setCurrentOffering(offering);
      setStatus(getStatusFromCustomerInfo(info));
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to refresh subscription info";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getStatusFromCustomerInfo]);

  /**
   * Purchase a package
   */
  const purchasePackage = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const info = await RevenueCatService.purchasePackage(pkg);
        setCustomerInfo(info);
        setStatus(getStatusFromCustomerInfo(info));

        return RevenueCatService.checkProEntitlement(info);
      } catch (err: unknown) {
        if (
          err &&
          typeof err === "object" &&
          "code" in err &&
          err.code === "CANCELLED"
        ) {
          // User cancelled - not an error
          return false;
        }
        const errorMessage =
          err instanceof Error ? err.message : "Purchase failed";
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [getStatusFromCustomerInfo],
  );

  /**
   * Restore previous purchases
   */
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const info = await RevenueCatService.restorePurchases();
      setCustomerInfo(info);
      setStatus(getStatusFromCustomerInfo(info));

      return RevenueCatService.checkProEntitlement(info);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to restore purchases";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getStatusFromCustomerInfo]);

  /**
   * Present the RevenueCat paywall
   */
  const presentPaywall = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const result = await RevenueCatUI.presentPaywall();

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          // Refresh customer info after successful purchase/restore
          await refreshCustomerInfo();
          return true;
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
        case PAYWALL_RESULT.CANCELLED:
        default:
          return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to present paywall";
      setError(errorMessage);
      return false;
    }
  }, [refreshCustomerInfo]);

  /**
   * Present paywall only if user doesn't have the entitlement
   */
  const presentPaywallIfNeeded = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: RevenueCatService.config.ENTITLEMENT_ID,
      });

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          await refreshCustomerInfo();
          return true;
        case PAYWALL_RESULT.NOT_PRESENTED:
          // User already has the entitlement
          return true;
        case PAYWALL_RESULT.ERROR:
        case PAYWALL_RESULT.CANCELLED:
        default:
          return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to present paywall";
      setError(errorMessage);
      return false;
    }
  }, [refreshCustomerInfo]);

  /**
   * Present the Customer Center for subscription management
   */
  const presentCustomerCenter = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await RevenueCatUI.presentCustomerCenter();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to present customer center";
      setError(errorMessage);
    }
  }, []);

  /**
   * Check if user has Pro access (synchronous check from current state)
   */
  const checkProAccess = useCallback((): boolean => {
    return status.isSubscribed;
  }, [status.isSubscribed]);

  // Context value
  const contextValue: SubscriptionContextType = {
    // State
    isLoading,
    isInitialized,
    customerInfo,
    currentOffering,
    status,
    error,
    // Actions
    refreshCustomerInfo,
    purchasePackage,
    restorePurchases,
    presentPaywall,
    presentPaywallIfNeeded,
    presentCustomerCenter,
    checkProAccess,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

/**
 * Hook to access subscription context
 * Must be used within a SubscriptionProvider
 */
export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);

  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }

  return context;
}

/**
 * Hook to check if user is Pro (convenience hook)
 */
export function useIsPro(): boolean {
  const { status } = useSubscription();
  return status.isSubscribed;
}

/**
 * Hook to get subscription tier
 */
export function useSubscriptionTier(): SubscriptionTier {
  const { status } = useSubscription();
  return status.tier;
}

export default SubscriptionContext;

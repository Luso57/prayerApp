import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  JSX,
} from "react";
import { CustomerInfo, PurchasesPackage } from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import {
  initializeRevenueCat,
  getCustomerInfo,
  hasPrayfirstPro,
  getSubscriptionPackages,
  purchasePackage,
  restorePurchases,
  addCustomerInfoListener,
  getManagementURL,
  getActiveSubscriptionDetails,
  ENTITLEMENTS,
} from "../Services/RevenueCatService";

interface SubscriptionState {
  isInitialized: boolean;
  isLoading: boolean;
  isPro: boolean;
  customerInfo: CustomerInfo | null;
  packages: {
    monthly: PurchasesPackage | null;
    yearly: PurchasesPackage | null;
    all: PurchasesPackage[];
  };
  error: string | null;
}

interface SubscriptionContextValue extends SubscriptionState {
  // Actions
  refreshCustomerInfo: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
  presentPaywall: () => Promise<boolean>;
  presentPaywallIfNeeded: () => Promise<boolean>;
  presentCustomerCenter: () => Promise<void>;
  openManageSubscriptions: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(
  undefined,
);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({
  children,
}: SubscriptionProviderProps): JSX.Element {
  const [state, setState] = useState<SubscriptionState>({
    isInitialized: false,
    isLoading: true,
    isPro: false,
    customerInfo: null,
    packages: { monthly: null, yearly: null, all: [] },
    error: null,
  });

  // Initialize RevenueCat on mount
  useEffect(() => {
    let listenerCleanup: (() => void) | null = null;

    async function initialize() {
      try {
        await initializeRevenueCat();

        // Get initial customer info and packages
        const [customerInfo, packages] = await Promise.all([
          getCustomerInfo(),
          getSubscriptionPackages(),
        ]);

        const isPro =
          typeof customerInfo.entitlements.active[ENTITLEMENTS.PRO] !==
          "undefined";

        setState((prev) => ({
          ...prev,
          isInitialized: true,
          isLoading: false,
          isPro,
          customerInfo,
          packages,
          error: null,
        }));

        // Listen for updates
        listenerCleanup = addCustomerInfoListener((info) => {
          const hasAccess =
            typeof info.entitlements.active[ENTITLEMENTS.PRO] !== "undefined";
          setState((prev) => ({
            ...prev,
            isPro: hasAccess,
            customerInfo: info,
          }));
        });
      } catch (error: any) {
        console.error("Failed to initialize subscriptions:", error);
        setState((prev) => ({
          ...prev,
          isInitialized: true,
          isLoading: false,
          error: error.message || "Failed to initialize",
        }));
      }
    }

    initialize();

    return () => {
      if (listenerCleanup) {
        listenerCleanup();
      }
    };
  }, []);

  // Refresh customer info
  const refreshCustomerInfo = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const customerInfo = await getCustomerInfo();
      const isPro =
        typeof customerInfo.entitlements.active[ENTITLEMENTS.PRO] !==
        "undefined";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isPro,
        customerInfo,
        error: null,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to refresh",
      }));
    }
  }, []);

  // Purchase a package
  const purchase = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const result = await purchasePackage(pkg);

        if (result.success && result.customerInfo) {
          const isPro =
            typeof result.customerInfo.entitlements.active[ENTITLEMENTS.PRO] !==
            "undefined";
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isPro,
            customerInfo: result.customerInfo,
          }));
          return true;
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: result.error || null,
          }));
          return false;
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || "Purchase failed",
        }));
        return false;
      }
    },
    [],
  );

  // Restore purchases
  const restore = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const result = await restorePurchases();

      if (result.customerInfo) {
        const isPro =
          typeof result.customerInfo.entitlements.active[ENTITLEMENTS.PRO] !==
          "undefined";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isPro,
          customerInfo: result.customerInfo,
        }));
        return result.success;
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: result.error || "No purchases to restore",
        }));
        return false;
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Restore failed",
      }));
      return false;
    }
  }, []);

  // Present paywall using RevenueCatUI
  const presentPaywall = useCallback(async (): Promise<boolean> => {
    try {
      const result = await RevenueCatUI.presentPaywall();

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          await refreshCustomerInfo();
          return true;
        case PAYWALL_RESULT.CANCELLED:
        case PAYWALL_RESULT.ERROR:
        case PAYWALL_RESULT.NOT_PRESENTED:
        default:
          return false;
      }
    } catch (error) {
      console.error("Failed to present paywall:", error);
      return false;
    }
  }, [refreshCustomerInfo]);

  // Present paywall only if user doesn't have pro
  const presentPaywallIfNeeded = useCallback(async (): Promise<boolean> => {
    try {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: ENTITLEMENTS.PRO,
      });

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          await refreshCustomerInfo();
          return true;
        case PAYWALL_RESULT.NOT_PRESENTED:
          // User already has pro
          return true;
        case PAYWALL_RESULT.CANCELLED:
        case PAYWALL_RESULT.ERROR:
        default:
          return false;
      }
    } catch (error) {
      console.error("Failed to present paywall:", error);
      return false;
    }
  }, [refreshCustomerInfo]);

  // Present Customer Center for subscription management
  const presentCustomerCenter = useCallback(async () => {
    try {
      await RevenueCatUI.presentCustomerCenter();
      // Refresh customer info after Customer Center is closed
      await refreshCustomerInfo();
    } catch (error) {
      console.error("Failed to present Customer Center:", error);
      // Fallback to opening management URL in browser
      try {
        const url = await getManagementURL();
        if (url) {
          const { Linking } = await import("react-native");
          await Linking.openURL(url);
        }
      } catch (fallbackError) {
        console.error("Fallback to management URL also failed:", fallbackError);
      }
    }
  }, [refreshCustomerInfo]);

  // Open subscription management
  const openManageSubscriptions = useCallback(async () => {
    try {
      const url = await getManagementURL();
      if (url) {
        const { Linking } = await import("react-native");
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Failed to open management URL:", error);
    }
  }, []);

  const value: SubscriptionContextValue = {
    ...state,
    refreshCustomerInfo,
    purchase,
    restore,
    presentPaywall,
    presentPaywallIfNeeded,
    presentCustomerCenter,
    openManageSubscriptions,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

/**
 * Hook to access subscription state and actions
 */
export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }
  return context;
}

/**
 * Hook to check if user has pro access (shorthand)
 */
export function useIsPro(): boolean {
  const { isPro } = useSubscription();
  return isPro;
}

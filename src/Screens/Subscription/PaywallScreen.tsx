/**
 * PaywallScreen
 * A screen that displays the RevenueCat paywall for subscription purchases.
 * Can be used standalone or integrated into navigation.
 */

import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import RevenueCatUI from "react-native-purchases-ui";
import { useSubscription } from "../../contexts/SubscriptionContext";
import {
  colors,
  typography,
  spacing,
  borderRadius,
} from "../../constants/theme";
import { PRO_FEATURES } from "../../types/subscription";

interface PaywallScreenProps {
  onClose?: () => void;
  onPurchaseComplete?: () => void;
}

/**
 * PaywallScreen Component
 * Displays the RevenueCat paywall with custom styling and callbacks
 */
export default function PaywallScreen({
  onClose,
  onPurchaseComplete,
}: PaywallScreenProps) {
  const { isLoading, error, presentPaywall, restorePurchases, status } =
    useSubscription();

  /**
   * Handle showing the paywall
   */
  const handleShowPaywall = useCallback(async () => {
    const success = await presentPaywall();
    if (success && onPurchaseComplete) {
      onPurchaseComplete();
    }
  }, [presentPaywall, onPurchaseComplete]);

  /**
   * Handle restore purchases
   */
  const handleRestore = useCallback(async () => {
    const success = await restorePurchases();
    if (success && onPurchaseComplete) {
      onPurchaseComplete();
    }
  }, [restorePurchases, onPurchaseComplete]);

  // If already subscribed, show success state
  if (status.isSubscribed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>You're a Pro Member!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for subscribing to Prayfirst Pro. Enjoy all premium
            features!
          </Text>
          {onClose && (
            <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Upgrade to Pro</Text>
        <View style={styles.closeButton} /> {/* Spacer for alignment */}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>✨</Text>
          <Text style={styles.heroTitle}>Prayfirst Pro</Text>
          <Text style={styles.heroSubtitle}>
            Deepen your prayer life with premium features
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          {PRO_FEATURES.slice(0, 4).map((feature) => (
            <View key={feature.id} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleShowPaywall}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.ui.white} />
            ) : (
              <Text style={styles.primaryButtonText}>View Plans</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleRestore}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          Subscription automatically renews unless canceled at least 24 hours
          before the end of the current period.
        </Text>
      </View>
    </SafeAreaView>
  );
}

/**
 * Hook to easily present the paywall from anywhere in the app
 */
export function usePaywall() {
  const { presentPaywall, presentPaywallIfNeeded } = useSubscription();

  return {
    showPaywall: presentPaywall,
    showPaywallIfNeeded: presentPaywallIfNeeded,
  };
}

/**
 * Simple function to present paywall using RevenueCat UI directly
 * Can be called from anywhere without needing the context
 */
export async function showRevenueCatPaywall(): Promise<boolean> {
  try {
    const result = await RevenueCatUI.presentPaywall();
    return result === "PURCHASED" || result === "RESTORED";
  } catch (error) {
    console.error("[PaywallScreen] Error presenting paywall:", error);
    return false;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: typography.size["2xl"],
    color: colors.text.secondary,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  hero: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: typography.size["3xl"],
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    textAlign: "center",
  },
  featuresContainer: {
    backgroundColor: colors.ui.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: spacing.sm,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: "#DC2626",
    fontSize: typography.size.sm,
    textAlign: "center",
  },
  ctaContainer: {
    marginBottom: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  primaryButtonText: {
    color: colors.ui.white,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.primary.main,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
  },
  termsText: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    textAlign: "center",
    lineHeight: typography.size.xs * typography.lineHeight.relaxed,
  },
  successEmoji: {
    fontSize: 80,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: typography.size["3xl"],
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
});

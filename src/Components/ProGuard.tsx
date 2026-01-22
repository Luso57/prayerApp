/**
 * ProGuard Component
 * A wrapper component that gates premium content behind subscription
 * Shows either the premium content or a prompt to upgrade
 */

import React, { ReactNode } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSubscription, useIsPro } from "../contexts/SubscriptionContext";
import { colors, typography, spacing, borderRadius } from "../constants/theme";

interface ProGuardProps {
  children: ReactNode;
  /** Custom fallback component when not subscribed */
  fallback?: ReactNode;
  /** Whether to show a simple lock icon or full upgrade prompt */
  variant?: "simple" | "full";
  /** Feature name to display in the upgrade prompt */
  featureName?: string;
}

/**
 * ProGuard Component
 * Wraps premium content and shows upgrade prompt if user is not subscribed
 *
 * @example
 * <ProGuard featureName="Prayer Journal">
 *   <PrayerJournalContent />
 * </ProGuard>
 */
export function ProGuard({
  children,
  fallback,
  variant = "full",
  featureName = "this feature",
}: ProGuardProps) {
  const isPro = useIsPro();
  const { presentPaywall } = useSubscription();

  // If user is Pro, show the premium content
  if (isPro) {
    return <>{children}</>;
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Simple variant - just shows a lock
  if (variant === "simple") {
    return (
      <TouchableOpacity style={styles.simpleLock} onPress={presentPaywall}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.lockText}>Pro</Text>
      </TouchableOpacity>
    );
  }

  // Full variant - shows upgrade prompt
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>Unlock {featureName}</Text>
        <Text style={styles.description}>
          This is a premium feature. Upgrade to Prayfirst Pro to access{" "}
          {featureName} and more.
        </Text>
        <TouchableOpacity style={styles.upgradeButton} onPress={presentPaywall}>
          <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Higher-order component version of ProGuard
 * Wraps a component to make it Pro-only
 */
export function withProGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: { featureName?: string; variant?: "simple" | "full" },
) {
  return function ProGuardedComponent(props: P) {
    return (
      <ProGuard featureName={options?.featureName} variant={options?.variant}>
        <WrappedComponent {...props} />
      </ProGuard>
    );
  };
}

/**
 * Hook to check pro status and get upgrade function
 * Useful for conditional rendering in components
 */
export function useProFeature() {
  const isPro = useIsPro();
  const { presentPaywall, presentPaywallIfNeeded } = useSubscription();

  return {
    isPro,
    requestUpgrade: presentPaywall,
    requirePro: presentPaywallIfNeeded,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.cream,
    padding: spacing.xl,
  },
  content: {
    alignItems: "center",
    backgroundColor: colors.ui.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    maxWidth: 320,
    width: "100%",
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
  },
  upgradeButton: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    width: "100%",
    alignItems: "center",
  },
  upgradeButtonText: {
    color: colors.ui.white,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },
  simpleLock: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.soft,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  lockIcon: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  lockText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.primary.main,
  },
});

export default ProGuard;

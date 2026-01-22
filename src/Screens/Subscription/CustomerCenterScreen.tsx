/**
 * CustomerCenterScreen
 * A screen for managing subscriptions using RevenueCat's Customer Center
 * Allows users to view, cancel, and manage their subscriptions
 */

import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useSubscription } from "../../contexts/SubscriptionContext";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../../constants/theme";

interface CustomerCenterScreenProps {
  onClose?: () => void;
}

/**
 * CustomerCenterScreen Component
 * Displays subscription management options and allows access to RevenueCat Customer Center
 */
export default function CustomerCenterScreen({
  onClose,
}: CustomerCenterScreenProps) {
  const {
    status,
    isLoading,
    error,
    presentCustomerCenter,
    presentPaywall,
    restorePurchases,
  } = useSubscription();

  /**
   * Open RevenueCat Customer Center
   */
  const handleOpenCustomerCenter = useCallback(async () => {
    await presentCustomerCenter();
  }, [presentCustomerCenter]);

  /**
   * Handle upgrade to Pro
   */
  const handleUpgrade = useCallback(async () => {
    await presentPaywall();
  }, [presentPaywall]);

  /**
   * Handle restore purchases
   */
  const handleRestore = useCallback(async () => {
    await restorePurchases();
  }, [restorePurchases]);

  /**
   * Format expiration date for display
   */
  const formatExpirationDate = (date: Date | null): string => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Status Card */}
        <View style={[styles.card, styles.statusCard]}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusEmoji}>
              {status.isSubscribed ? "✨" : "🙏"}
            </Text>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>
                {status.isSubscribed ? "Prayfirst Pro" : "Free Plan"}
              </Text>
              <Text style={styles.statusSubtitle}>
                {status.isSubscribed
                  ? "Active Subscription"
                  : "Limited Features"}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                status.isSubscribed ? styles.proBadge : styles.freeBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  status.isSubscribed
                    ? styles.proBadgeText
                    : styles.freeBadgeText,
                ]}
              >
                {status.isSubscribed ? "PRO" : "FREE"}
              </Text>
            </View>
          </View>

          {/* Subscription Details */}
          {status.isSubscribed && (
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Product</Text>
                <Text style={styles.detailValue}>
                  {status.productIdentifier || "Unknown"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Renews</Text>
                <Text style={styles.detailValue}>
                  {formatExpirationDate(status.expirationDate)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Auto-Renew</Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color: status.willRenew
                        ? colors.accent.green
                        : colors.text.muted,
                    },
                  ]}
                >
                  {status.willRenew ? "On" : "Off"}
                </Text>
              </View>
              {status.isTrialing && (
                <View style={styles.trialBanner}>
                  <Text style={styles.trialText}>
                    🎁 You're on a free trial
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Manage Subscription</Text>

          {status.isSubscribed ? (
            <>
              {/* Manage Subscription Button */}
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryAction]}
                onPress={handleOpenCustomerCenter}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.ui.white} />
                ) : (
                  <>
                    <Text style={styles.actionIcon}>⚙️</Text>
                    <View style={styles.actionTextContainer}>
                      <Text style={styles.actionButtonText}>
                        Manage Subscription
                      </Text>
                      <Text style={styles.actionDescription}>
                        Cancel, change plans, or view billing
                      </Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Upgrade Button */}
              <TouchableOpacity
                style={[styles.actionButton, styles.upgradeAction]}
                onPress={handleUpgrade}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.ui.white} />
                ) : (
                  <>
                    <Text style={styles.actionIcon}>⭐</Text>
                    <View style={styles.actionTextContainer}>
                      <Text style={styles.upgradeButtonText}>
                        Upgrade to Pro
                      </Text>
                      <Text style={styles.upgradeDescription}>
                        Unlock all premium features
                      </Text>
                    </View>
                    <Text style={styles.upgradeArrow}>›</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Restore Purchases */}
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={handleRestore}
            disabled={isLoading}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.secondaryActionText}>Restore Purchases</Text>
              <Text style={styles.actionDescription}>
                Recover a previous subscription
              </Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            If you're having trouble with your subscription, try restoring
            purchases first. For billing issues, use "Manage Subscription" to
            access your payment settings through the App Store or Google Play.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Hook to easily open Customer Center from anywhere
 */
export function useCustomerCenter() {
  const { presentCustomerCenter } = useSubscription();
  return { openCustomerCenter: presentCustomerCenter };
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.ui.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  statusCard: {
    overflow: "hidden",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusEmoji: {
    fontSize: 48,
    marginRight: spacing.md,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  statusSubtitle: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  proBadge: {
    backgroundColor: colors.primary.soft,
  },
  freeBadge: {
    backgroundColor: colors.background.peach,
  },
  statusBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  proBadgeText: {
    color: colors.primary.main,
  },
  freeBadgeText: {
    color: colors.text.secondary,
  },
  detailsContainer: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
  trialBanner: {
    backgroundColor: colors.primary.soft,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  trialText: {
    fontSize: typography.size.sm,
    color: colors.primary.main,
    textAlign: "center",
    fontWeight: typography.weight.medium,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: "#DC2626",
    fontSize: typography.size.sm,
    textAlign: "center",
  },
  actionsContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  primaryAction: {
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  upgradeAction: {
    backgroundColor: colors.primary.main,
  },
  secondaryAction: {},
  actionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.primary.main,
  },
  upgradeButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.ui.white,
  },
  secondaryActionText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
  actionDescription: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  upgradeDescription: {
    fontSize: typography.size.sm,
    color: colors.ui.overlay,
    marginTop: 2,
  },
  actionArrow: {
    fontSize: typography.size["2xl"],
    color: colors.text.muted,
  },
  upgradeArrow: {
    fontSize: typography.size["2xl"],
    color: colors.ui.white,
  },
  helpSection: {
    backgroundColor: colors.background.warmWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  helpTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  helpText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
  },
});

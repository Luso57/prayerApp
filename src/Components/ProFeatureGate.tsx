import React, { ReactNode, JSX } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSubscription } from '../contexts/SubscriptionContext';
import { colors, typography, spacing } from '../constants/theme';

interface ProFeatureGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

/**
 * Component that gates content behind Pro subscription
 * Shows upgrade prompt if user doesn't have Pro access
 */
export function ProFeatureGate({
  children,
  fallback,
  showUpgradePrompt = true,
}: ProFeatureGateProps): JSX.Element {
  const { isPro, isLoading, presentPaywall } = useSubscription();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary.main} />
      </View>
    );
  }

  if (isPro) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>✨</Text>
        <Text style={styles.title}>Pro Feature</Text>
        <Text style={styles.description}>
          Upgrade to PrayerFirst Pro to unlock this feature
        </Text>
        <TouchableOpacity style={styles.button} onPress={presentPaywall}>
          <Text style={styles.buttonText}>Upgrade Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <></>;
}

/**
 * Hook to check if a pro feature should be accessible
 * Returns methods to check access and prompt for upgrade
 */
export function useProFeature() {
  const { isPro, isLoading, presentPaywall, presentPaywallIfNeeded } = useSubscription();

  const requirePro = async (): Promise<boolean> => {
    if (isPro) return true;
    return presentPaywallIfNeeded();
  };

  const checkAccess = (): boolean => {
    return isPro;
  };

  return {
    isPro,
    isLoading,
    checkAccess,
    requirePro,
    presentPaywall,
  };
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.cream,
  },

  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },

  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  description: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  button: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
  },

  buttonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.ui.white,
  },
});

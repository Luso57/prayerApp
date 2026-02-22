import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { PurchasesPackage } from "react-native-purchases";
import { colors, typography, spacing } from "../constants/theme";
import { useSubscription } from "../contexts/SubscriptionContext";

interface PaywallScreenProps {
  onPurchaseComplete: () => void;
}

const PaywallScreen: React.FC<PaywallScreenProps> = ({
  onPurchaseComplete,
}) => {
  const { packages, purchase, restore, isLoading } = useSubscription();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedPackage, setSelectedPackage] =
    useState<PurchasesPackage | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Auto-select yearly package by default (best value)
  useEffect(() => {
    if (packages.yearly) {
      setSelectedPackage(packages.yearly);
    } else if (packages.monthly) {
      setSelectedPackage(packages.monthly);
    }
  }, [packages]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert(
        "Please select a plan",
        "Choose a subscription plan to continue.",
      );
      return;
    }

    setIsPurchasing(true);
    const success = await purchase(selectedPackage);
    setIsPurchasing(false);

    if (success) {
      onPurchaseComplete();
    } else {
      Alert.alert(
        "Purchase Not Completed",
        "Your purchase was not completed. Please try again to access PrayerFirst.",
      );
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    const success = await restore();
    setIsRestoring(false);

    if (success) {
      Alert.alert(
        "Purchases Restored!",
        "Your subscription has been restored. Welcome back!",
        [{ text: "Continue", onPress: onPurchaseComplete }],
      );
    } else {
      Alert.alert(
        "No Purchases Found",
        "We couldn't find any previous purchases associated with your account. If you believe this is an error, please contact support.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.icon}>✨</Text>
            <Text style={styles.title}>Welcome to PrayerFirst</Text>
            <Text style={styles.subtitle}>
              To access your personalized prayer journey, unlock PrayerFirst Pro
            </Text>
          </View>

          {/* Dove Image */}
          <View style={styles.imageContainer}>
            <Animated.Image
              source={require("../../assets/DoveHandOutLeft.png")}
              style={[
                styles.doveImage,
                {
                  opacity: fadeAnim,
                },
              ]}
              resizeMode="contain"
            />
          </View>

          {/* Features */}
          <View style={styles.features}>
            <FeatureItem
              icon="🙏"
              title="Guided Prayer Journey"
              description="Personalized prayers based on your faith journey"
            />
            <FeatureItem
              icon="📖"
              title="Daily Verse Inspiration"
              description="Curated Bible verses to encourage your day"
            />
            <FeatureItem
              icon="🔥"
              title="Prayer Streak Tracking"
              description="Build consistency and stay motivated"
            />
            <FeatureItem
              icon="🔒"
              title="App Lock Features"
              description="Stay focused on what matters most"
            />
          </View>

          {/* Pricing */}
          {!isLoading && packages.all.length > 0 && (
            <View style={styles.pricing}>
              <Text style={styles.pricingTitle}>Choose Your Plan</Text>
              {packages.yearly && (
                <TouchableOpacity
                  style={[
                    styles.priceCard,
                    styles.priceCardPopular,
                    selectedPackage?.identifier ===
                      packages.yearly.identifier && styles.priceCardSelected,
                  ]}
                  onPress={() => setSelectedPackage(packages.yearly)}
                >
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Best Value</Text>
                  </View>
                  <Text style={styles.priceLabel}>Yearly</Text>
                  <Text style={styles.priceAmount}>
                    {packages.yearly.product.priceString}
                  </Text>
                  {selectedPackage?.identifier ===
                    packages.yearly.identifier && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              {packages.monthly && (
                <TouchableOpacity
                  style={[
                    styles.priceCard,
                    selectedPackage?.identifier ===
                      packages.monthly.identifier && styles.priceCardSelected,
                  ]}
                  onPress={() => setSelectedPackage(packages.monthly)}
                >
                  <Text style={styles.priceLabel}>Monthly</Text>
                  <Text style={styles.priceAmount}>
                    {packages.monthly.product.priceString}
                  </Text>
                  {selectedPackage?.identifier ===
                    packages.monthly.identifier && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handlePurchase}
            disabled={isPurchasing || isLoading || isRestoring}
          >
            {isPurchasing || isLoading ? (
              <ActivityIndicator color={colors.ui.white} />
            ) : (
              <Text style={styles.ctaButtonText}>Start Your Journey</Text>
            )}
          </TouchableOpacity>

          {/* Restore Purchases Button */}
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isPurchasing || isLoading || isRestoring}
          >
            {isRestoring ? (
              <ActivityIndicator color={colors.primary.main} size="small" />
            ) : (
              <Text style={styles.restoreButtonText}>Restore Purchases</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footer}>
            Auto-renewable subscription. Cancel anytime.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const FeatureItem: React.FC<{
  icon: string;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },

  scrollContent: {
    flexGrow: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },

  header: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },

  title: {
    fontSize: typography.size["3xl"],
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },

  subtitle: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: typography.size.base * 1.5,
  },

  imageContainer: {
    alignItems: "center",
    marginVertical: spacing.lg,
  },

  doveImage: {
    width: 200,
    height: 150,
  },

  features: {
    marginBottom: spacing.md,
    gap: 2,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
    backgroundColor: colors.ui.white,
    padding: spacing.md,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  featureIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },

  featureContent: {
    flex: 1,
  },

  featureTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  featureDescription: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.size.sm * 1.4,
  },

  pricing: {
    marginBottom: spacing.xl,
  },

  pricingTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.md,
  },

  priceCard: {
    backgroundColor: colors.ui.white,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.ui.border,
  },

  priceCardPopular: {
    borderColor: colors.primary.main,
    position: "relative",
  },

  priceCardSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.soft,
    borderWidth: 3,
  },

  popularBadge: {
    position: "absolute",
    top: -12,
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },

  checkmark: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary.main,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  checkmarkText: {
    color: colors.ui.white,
    fontSize: 16,
    fontWeight: typography.weight.bold,
  },

  popularText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.ui.white,
  },

  priceLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  priceAmount: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.bold,
    color: colors.primary.main,
  },

  ctaButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.md,
  },

  ctaButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.ui.white,
  },

  restoreButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.sm,
  },

  restoreButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.primary.main,
    textDecorationLine: "underline",
  },

  footer: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
});

export default PaywallScreen;

import {
  borderRadius,
  colors,
  spacing,
  typography,
} from "../../constants/theme";
import {
  lockPickedApps,
  pickAppsToLock,
  requestScreenTimePermission,
  unlockAllApps,
} from "../../Services/ScreenTimeService";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LockListScreen: React.FC = () => {
  const [lockedAppsCount, setLockedAppsCount] = useState(0);
  const [lockedCategoriesCount, setLockedCategoriesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const bounceAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bounceAnim, {
        toValue: 0,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLockApps = async () => {
    setIsLoading(true);
    try {
      // Step 1: Request Screen Time authorization
      await requestScreenTimePermission();

      // Step 2: Show Apple's app picker UI
      await pickAppsToLock();

      // Step 3: Apply the shield (lock the apps)
      await lockPickedApps();

      // Update local state (you could also track this in AsyncStorage)
      setLockedAppsCount((prev) => prev + 1);

      Alert.alert(
        "Apps Locked! 🔒",
        "Selected apps will be locked until you complete your daily prayer.",
      );
    } catch (error: any) {
      if (error.message?.includes("CANCELLED")) {
        // User cancelled the picker - no error needed
        return;
      }
      console.error("Lock apps error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to lock apps. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlockAll = () => {
    Alert.alert(
      "Unlock All Apps?",
      "Are you sure you want to remove all app restrictions?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlock All",
          style: "destructive",
          onPress: async () => {
            try {
              await unlockAllApps();
              setLockedAppsCount(0);
              setLockedCategoriesCount(0);
              Alert.alert("Success", "All apps have been unlocked.");
            } catch (error: any) {
              Alert.alert("Error", "Failed to unlock apps.");
            }
          },
        },
      ],
    );
  };

  const totalLocked = lockedAppsCount + lockedCategoriesCount;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Apps on hold</Text>
          <Text style={styles.subtitle}>
            these apps wait until you've prayed 🙏
          </Text>
          <Animated.View
            style={[
              styles.doveContainer,
              {
                opacity: opacityAnim,
                transform: [{ translateY: bounceAnim }],
              },
            ]}
          >
            <Image
              source={require("../../../assets/FlyingDoveLeft.png")}
              style={styles.doveImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Locked Apps Card */}
        <View style={styles.appsCard}>
          {totalLocked === 0 ? (
            // Empty State
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>📱</Text>
              </View>
              <Text style={styles.emptyTitle}>no apps locked yet</Text>
              <Text style={styles.emptySubtitle}>
                select apps to lock until you pray
              </Text>
            </View>
          ) : (
            // Locked apps summary
            <View style={styles.lockedSummary}>
              <View style={styles.lockedIcon}>
                <Text style={styles.lockedIconText}>🔒</Text>
              </View>
              <Text style={styles.lockedTitle}>
                {lockedAppsCount} app{lockedAppsCount !== 1 ? "s" : ""}
                {lockedCategoriesCount > 0 &&
                  ` & ${lockedCategoriesCount} categor${lockedCategoriesCount !== 1 ? "ies" : "y"}`}{" "}
                locked
              </Text>
              <Text style={styles.lockedSubtitle}>
                Complete your daily prayer to unlock
              </Text>
              <TouchableOpacity
                style={styles.unlockButton}
                onPress={handleUnlockAll}
              >
                <Text style={styles.unlockButtonText}>Unlock All</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoEmoji}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              Selected apps will be locked until you complete your daily prayer.
              Start your day with intention!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            isLoading && styles.primaryButtonDisabled,
          ]}
          onPress={handleLockApps}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading
              ? "Loading..."
              : totalLocked > 0
                ? "edit locked apps"
                : "lock apps"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    overflow: "visible",
  },

  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    overflow: "visible",
    zIndex: 1,
  },

  doveContainer: {
    position: "absolute",
    top: -50,
    right: -50,
    zIndex: 10,
  },

  doveImage: {
    width: 180,
    height: 180,
  },

  title: {
    fontSize: typography.size["3xl"],
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },

  subtitle: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  appsCard: {
    backgroundColor: colors.ui.white,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 200,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl,
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.warmWhite,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  emptyIconText: {
    fontSize: 36,
  },

  emptyTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  emptySubtitle: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    textAlign: "center",
  },

  lockedSummary: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl,
  },

  lockedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.soft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  lockedIconText: {
    fontSize: 36,
  },

  lockedTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },

  lockedSubtitle: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },

  unlockButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },

  unlockButtonText: {
    fontSize: typography.size.sm,
    color: colors.primary.main,
    fontWeight: typography.weight.medium,
  },

  appsList: {
    gap: spacing.sm,
  },

  appItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.warmWhite,
    borderRadius: 12,
    padding: spacing.md,
  },

  appIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },

  appName: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },

  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.cream,
    justifyContent: "center",
    alignItems: "center",
  },

  removeButtonText: {
    fontSize: 14,
    color: colors.text.secondary,
  },

  infoCard: {
    flexDirection: "row",
    backgroundColor: colors.primary.soft,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },

  infoEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  infoText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  bottomContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.cream,
  },

  primaryButton: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },

  primaryButtonDisabled: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: colors.ui.white,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },
});

export default LockListScreen;

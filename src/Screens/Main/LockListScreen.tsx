import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
} from "react-native";
import {
  colors,
  typography,
  spacing,
  borderRadius,
} from "../../constants/theme";
import Button from "../../Components/Button";
import ScreenTimeService from "../../Services/ScreenTimeService";

const LockListScreen: React.FC = () => {
  const [lockedAppsCount, setLockedAppsCount] = useState(0);
  const [lockedCategoriesCount, setLockedCategoriesCount] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const bounceAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Check authorization status and locked apps on mount
  useEffect(() => {
    checkAuthorizationAndLoadApps();
  }, []);

  const checkAuthorizationAndLoadApps = async () => {
    if (Platform.OS !== "ios") return;

    const authorized = await ScreenTimeService.isAuthorized();
    setIsAuthorized(authorized);

    if (authorized) {
      const counts = await ScreenTimeService.getLockedAppsCount();
      setLockedAppsCount(counts.appsCount);
      setLockedCategoriesCount(counts.categoriesCount);
    }
  };

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

  const handleLockApps = useCallback(async () => {
    if (Platform.OS !== "ios") {
      Alert.alert(
        "Not Available",
        "App locking is only available on iOS devices.",
      );
      return;
    }

    // Check if Screen Time is available
    if (!ScreenTimeService.isAvailable()) {
      Alert.alert(
        "Not Available",
        "Screen Time features are not available on this device.",
      );
      return;
    }

    // Request authorization if not already authorized
    if (!isAuthorized) {
      const authorized = await ScreenTimeService.requestAuthorization();
      if (!authorized) {
        Alert.alert(
          "Authorization Required",
          "Please allow PrayerFirst to access Screen Time in your device settings to lock apps.",
        );
        return;
      }
      setIsAuthorized(true);
    }

    // Present the app picker
    const result = await ScreenTimeService.presentAppPicker();

    if (result && result.success) {
      setLockedAppsCount(result.appsSelected);
      setLockedCategoriesCount(result.categoriesSelected);

      if (result.appsSelected > 0 || result.categoriesSelected > 0) {
        Alert.alert(
          "Apps Locked! 🔒",
          `${result.appsSelected} app(s) and ${result.categoriesSelected} category(ies) will be locked until you complete your daily prayer.`,
        );
      }
    }
  }, [isAuthorized]);

  const handleUnlockAll = useCallback(async () => {
    Alert.alert(
      "Unlock All Apps?",
      "Are you sure you want to remove all app restrictions?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlock All",
          style: "destructive",
          onPress: async () => {
            await ScreenTimeService.clearRestrictions();
            setLockedAppsCount(0);
            setLockedCategoriesCount(0);
          },
        },
      ],
    );
  }, []);

  const totalLocked = lockedAppsCount + lockedCategoriesCount;

  return (
    <SafeAreaView style={styles.container}>
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
          <Animated.Image
            source={require("../../../assets/FlyingDoveLeft.png")}
            style={[
              styles.doveImage,
              {
                opacity: opacityAnim,
                transform: [{ translateY: bounceAnim }],
              },
            ]}
            resizeMode="contain"
          />
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
        <Button
          title={totalLocked > 0 ? "edit locked apps" : "lock apps"}
          onPress={handleLockApps}
          variant="primary"
          size="lg"
          fullWidth
        />
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

  doveImage: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    zIndex: 10,
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
});

export default LockListScreen;

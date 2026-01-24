import { spacing, typography } from "../../constants/theme";
import { useTheme } from "../../contexts/ThemeContext";
import {
  lockPickedApps,
  pickAppsToLock,
  requestScreenTimePermission,
  unlockAllApps,
} from "../../Services/ScreenTimeService";
import ScheduleModal from "./components/ScheduleModal";
import React, { useEffect, useRef, useState, useMemo } from "react";
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
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [lockedAppsCount, setLockedAppsCount] = useState(0);
  const [lockedCategoriesCount, setLockedCategoriesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
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
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>App Limits</Text>
            <Text style={styles.title}>Lock Screen 🔐</Text>
          </View>
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

        {/* Status Card - shows different state based on locked apps */}
        {totalLocked > 0 ? (
          <View style={styles.lockedCard}>
            <View style={styles.lockedCardHeader}>
              <Text style={styles.lockedCardLabel}>Currently Locked</Text>
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedBadgeText}>{totalLocked}</Text>
              </View>
            </View>
            <Text style={styles.lockedCardTitle}>
              {lockedAppsCount} App{lockedAppsCount !== 1 ? "s" : ""}
              {lockedCategoriesCount > 0 &&
                ` & ${lockedCategoriesCount} categor${lockedCategoriesCount !== 1 ? "ies" : "y"}`}
            </Text>
            <Text style={styles.lockedCardSubtext}>
              Complete your daily prayer to unlock
            </Text>
            <View style={styles.lockedCardButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleLockApps}
                disabled={isLoading}
              >
                <Text style={styles.editButtonText}>
                  {isLoading ? "Loading..." : "Edit Apps"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.unlockAllButton}
                onPress={handleUnlockAll}
              >
                <Text style={styles.unlockAllButtonText}>Unlock All</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>📱</Text>
            </View>
            <Text style={styles.emptyTitle}>No apps locked yet</Text>
            <Text style={styles.emptySubtitle}>
              Choose apps to pause until you've completed your prayer
            </Text>
            <TouchableOpacity
              style={styles.lockAppsButton}
              onPress={handleLockApps}
              disabled={isLoading}
            >
              <Text style={styles.lockAppsButtonText}>
                {isLoading ? "Loading..." : "Choose Apps to Lock"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setShowScheduleModal(true)}
          >
            <Text style={styles.actionIcon}>⏰</Text>
            <Text style={styles.actionTitle}>Schedule</Text>
            <Text style={styles.actionSubtext}>Set lock times</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionTitle}>Usage</Text>
            <Text style={styles.actionSubtext}>View screen time</Text>
          </TouchableOpacity>
        </View>

        {/* How It Works Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>How it works</Text>

          <View style={styles.infoStep}>
            <View style={styles.infoStepNumber}>
              <Text style={styles.infoStepNumberText}>1</Text>
            </View>
            <View style={styles.infoStepContent}>
              <Text style={styles.infoStepTitle}>Select apps</Text>
              <Text style={styles.infoStepText}>
                Choose which apps you want to pause during prayer time
              </Text>
            </View>
          </View>

          <View style={styles.infoStep}>
            <View style={styles.infoStepNumber}>
              <Text style={styles.infoStepNumberText}>2</Text>
            </View>
            <View style={styles.infoStepContent}>
              <Text style={styles.infoStepTitle}>Apps get locked</Text>
              <Text style={styles.infoStepText}>
                A gentle reminder screen appears when you try to open them
              </Text>
            </View>
          </View>

          <View style={styles.infoStep}>
            <View style={styles.infoStepNumber}>
              <Text style={styles.infoStepNumberText}>3</Text>
            </View>
            <View style={styles.infoStepContent}>
              <Text style={styles.infoStepTitle}>Complete your prayer</Text>
              <Text style={styles.infoStepText}>
                Apps unlock automatically after your daily prayer
              </Text>
            </View>
          </View>
        </View>

        {/* Tip Card */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            <Text style={styles.tipBold}>Pro tip:</Text> Start with just 2-3
            apps you find most distracting. You can always add more later!
          </Text>
        </View>
      </ScrollView>

      {/* Schedule Modal */}
      <ScheduleModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.cream,
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      overflow: "visible",
      zIndex: 1,
    },

    headerLabel: {
      fontSize: typography.size.base,
      color: colors.text.secondary,
    },

    title: {
      fontSize: typography.size["3xl"],
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
    },

    doveContainer: {
      position: "absolute",
      top: -20,
      right: -40,
      zIndex: 10,
    },

    doveImage: {
      width: 140,
      height: 140,
    },

    // Locked State Card
    lockedCard: {
      backgroundColor: colors.primary.main,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },

    lockedCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },

    lockedCardLabel: {
      fontSize: typography.size.sm,
      color: colors.ui.white,
      opacity: 0.9,
    },

    lockedBadge: {
      backgroundColor: "rgba(255, 255, 255, 0.25)",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
    },

    lockedBadgeText: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.bold,
      color: colors.ui.white,
    },

    lockedCardTitle: {
      fontSize: typography.size["2xl"],
      fontWeight: typography.weight.bold,
      color: colors.ui.white,
      marginBottom: spacing.xs,
    },

    lockedCardSubtext: {
      fontSize: typography.size.sm,
      color: colors.ui.white,
      opacity: 0.9,
      marginBottom: spacing.md,
    },

    lockedCardButtons: {
      flexDirection: "row",
      gap: spacing.sm,
    },

    editButton: {
      flex: 1,
      backgroundColor: colors.ui.white,
      borderRadius: 12,
      paddingVertical: spacing.md,
      alignItems: "center",
    },

    editButtonText: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
    },

    unlockAllButton: {
      flex: 1,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: 12,
      paddingVertical: spacing.md,
      alignItems: "center",
    },

    unlockAllButtonText: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.semibold,
      color: colors.ui.white,
    },

    // Empty State Card
    emptyCard: {
      backgroundColor: colors.ui.white,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.sm,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    emptyIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.background.cream,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.sm,
    },

    emptyIcon: {
      fontSize: 32,
    },

    emptyTitle: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: 4,
    },

    emptySubtitle: {
      fontSize: typography.size.sm,
      color: colors.text.secondary,
      textAlign: "center",
      marginBottom: spacing.md,
      lineHeight: 18,
    },

    lockAppsButton: {
      backgroundColor: colors.primary.main,
      borderRadius: 12,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      width: "100%",
      alignItems: "center",
    },

    lockAppsButtonText: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.semibold,
      color: colors.ui.white,
    },

    // Quick Actions Row
    actionsRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },

    actionCard: {
      flex: 1,
      backgroundColor: colors.ui.white,
      borderRadius: 14,
      padding: spacing.md,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    actionIcon: {
      fontSize: 24,
      marginBottom: spacing.xs,
    },

    actionTitle: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: 2,
    },

    actionSubtext: {
      fontSize: typography.size.xs,
      color: colors.text.secondary,
    },

    // Info Section
    infoSection: {
      backgroundColor: colors.ui.white,
      borderRadius: 14,
      padding: spacing.md,
      marginBottom: spacing.sm,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    infoSectionTitle: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },

    infoStep: {
      flexDirection: "row",
      marginBottom: spacing.sm,
    },

    infoStepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary.soft,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.sm,
    },

    infoStepNumberText: {
      fontSize: typography.size.xs,
      fontWeight: typography.weight.bold,
      color: colors.primary.main,
    },

    infoStepContent: {
      flex: 1,
    },

    infoStepTitle: {
      fontSize: typography.size.xs,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
      marginBottom: 1,
    },

    infoStepText: {
      fontSize: 12,
      color: colors.text.secondary,
      lineHeight: 16,
    },

    // Tip Card
    tipCard: {
      flexDirection: "row",
      backgroundColor: colors.primary.soft,
      borderRadius: 12,
      padding: spacing.sm,
      alignItems: "flex-start",
    },

    tipIcon: {
      fontSize: 16,
      marginRight: spacing.sm,
    },

    tipText: {
      flex: 1,
      fontSize: 12,
      color: colors.text.secondary,
      lineHeight: 17,
    },

    tipBold: {
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
    },
  });

export default LockListScreen;

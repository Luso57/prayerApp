import { spacing, typography } from "../../constants/theme";
import { useTheme } from "../../contexts/ThemeContext";
import {
  lockPickedApps,
  pickAppsToLock,
  requestScreenTimePermission,
  unlockAllApps,
  startSchedule,
  stopSchedule,
  stopAllSchedules,
} from "../../Services/ScreenTimeService";
import ScheduleService, {
  PrayerSchedule,
} from "../../Services/ScheduleService";
import ScheduleModal from "./components/ScheduleModal";
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Alert,
  Modal,
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
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [schedules, setSchedules] = useState<PrayerSchedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null,
  );

  const loadSchedules = async () => {
    const loaded = await ScheduleService.loadSchedules();
    setSchedules(loaded);
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleChooseAppsForSchedule = async (scheduleId: string) => {
    setIsLoading(true);
    setSelectedScheduleId(scheduleId);
    try {
      await requestScreenTimePermission();
      await pickAppsToLock();

      // Find the schedule to get its time
      const schedule = schedules.find((s) => s.id === scheduleId);
      if (schedule) {
        // Mark schedule as having apps selected
        schedule.appTokens = ["selected"]; // The actual tokens are stored in App Group
        await ScheduleService.saveSchedule(schedule);

        // Start the DeviceActivity schedule
        // This will work even when the app is closed!
        const scheduleTime = new Date(schedule.time);
        const startHour = scheduleTime.getHours();
        const startMinute = scheduleTime.getMinutes();

        // End time is 1 hour after start (or until they pray)
        const endHour = (startHour + 1) % 24;
        const endMinute = startMinute;

        await startSchedule(
          scheduleId,
          startHour,
          startMinute,
          endHour,
          endMinute,
        );

        console.log(
          `[Schedule] Started DeviceActivity: ${startHour}:${startMinute} - ${endHour}:${endMinute}`,
        );
        await loadSchedules();
      }

      Alert.alert(
        "Schedule Active! 🙏",
        "Apps will automatically lock at the scheduled time, even if you close this app.",
      );
    } catch (error: any) {
      if (error.message?.includes("CANCELLED")) return;
      console.error("Schedule error:", error);
      Alert.alert("Error", "Failed to set up schedule. Please try again.");
    } finally {
      setIsLoading(false);
      setSelectedScheduleId(null);
    }
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    Alert.alert(
      "Delete Schedule?",
      "Are you sure you want to delete this prayer schedule?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Stop the DeviceActivity schedule first
            try {
              await stopSchedule(scheduleId);
            } catch (e) {
              console.log("No active schedule to stop");
            }
            await ScheduleService.deleteSchedule(scheduleId);
            await loadSchedules();
          },
        },
      ],
    );
  };

  const handleToggleSchedule = async (scheduleId: string, enabled: boolean) => {
    const schedule = schedules.find((s) => s.id === scheduleId);

    // Start or stop DeviceActivity based on toggle
    if (schedule && schedule.appTokens && schedule.appTokens.length > 0) {
      try {
        if (enabled) {
          const scheduleTime = new Date(schedule.time);
          const startHour = scheduleTime.getHours();
          const startMinute = scheduleTime.getMinutes();
          const endHour = (startHour + 1) % 24;
          const endMinute = startMinute;

          await startSchedule(
            scheduleId,
            startHour,
            startMinute,
            endHour,
            endMinute,
          );
          console.log(`[Schedule] Re-enabled schedule: ${scheduleId}`);
        } else {
          await stopSchedule(scheduleId);
          console.log(`[Schedule] Disabled schedule: ${scheduleId}`);
        }
      } catch (e) {
        console.error("Toggle schedule error:", e);
      }
    }

    await ScheduleService.toggleSchedule(scheduleId, enabled);
    await loadSchedules();
  };

  const formatScheduleDays = (days: number[]): string => {
    if (days.length === 7) return "Every day";
    if (days.length === 5 && !days.includes(0) && !days.includes(6))
      return "Weekdays";
    if (days.length === 2 && days.includes(0) && days.includes(6))
      return "Weekends";

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days
      .sort()
      .map((d) => dayNames[d])
      .join(", ");
  };

  const formatScheduleTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getNextLockInfo = () => {
    const next = ScheduleService.getNextScheduledTime();
    if (!next) return null;

    const now = new Date();
    const diff = next.time.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let timeString = "";
    if (hours > 24) {
      timeString = next.time.toLocaleDateString("en-US", {
        weekday: "long",
        hour: "numeric",
        minute: "2-digit",
      });
    } else if (hours > 0) {
      timeString = `in ${hours}h ${minutes}m`;
    } else {
      timeString = `in ${minutes}m`;
    }

    return {
      schedule: next.schedule,
      timeString,
    };
  };

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
            <Text style={styles.title}>Lock Schedule 🔐</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => setShowHelpModal(true)}
            >
              <Text style={styles.helpButtonText}>?</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Empty State - Show only when no schedules */}
        {schedules.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>⏰</Text>
            </View>
            <Text style={styles.emptyTitle}>Create Your Prayer Schedule</Text>
            <Text style={styles.emptySubtitle}>
              Set your prayer times first, then choose which apps to lock during
              those times
            </Text>
            <TouchableOpacity
              style={styles.lockAppsButton}
              onPress={() => setShowScheduleModal(true)}
            >
              <Text style={styles.lockAppsButtonText}>Create Schedule</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Next Lock Indicator */}
        {schedules.length > 0 &&
          (() => {
            const nextLock = getNextLockInfo();
            return nextLock ? (
              <View style={styles.nextLockCard}>
                <Text style={styles.nextLockIcon}>🔔</Text>
                <View style={styles.nextLockInfo}>
                  <Text style={styles.nextLockLabel}>Next lock</Text>
                  <Text style={styles.nextLockTime}>
                    {nextLock.schedule.name} • {nextLock.timeString}
                  </Text>
                </View>
              </View>
            ) : null;
          })()}

        {/* Schedules Section */}
        {schedules.length > 0 && (
          <View style={styles.schedulesSection}>
            <View style={styles.schedulesSectionHeader}>
              <Text style={styles.schedulesSectionTitle}>
                Your Prayer Schedule
              </Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(true)}>
                <Text style={styles.addScheduleButton}>+ Add</Text>
              </TouchableOpacity>
            </View>

            {schedules.map((schedule) => (
              <View key={schedule.id} style={styles.scheduleCard}>
                <View style={styles.scheduleCardHeader}>
                  <View style={styles.scheduleCardTitle}>
                    <Text style={styles.scheduleIcon}>
                      {schedule.icon || "⏰"}
                    </Text>
                    <View style={styles.scheduleInfo}>
                      <Text style={styles.scheduleName}>{schedule.name}</Text>
                      <Text style={styles.scheduleTime}>
                        {formatScheduleTime(schedule.time)} •{" "}
                        {formatScheduleDays(schedule.daysOfWeek)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.scheduleToggle}
                    onPress={() =>
                      handleToggleSchedule(schedule.id, !schedule.enabled)
                    }
                  >
                    <View
                      style={[
                        styles.toggleSwitch,
                        schedule.enabled && styles.toggleSwitchActive,
                      ]}
                    >
                      <View
                        style={[
                          styles.toggleKnob,
                          schedule.enabled && styles.toggleKnobActive,
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.scheduleCardBody}>
                  <Text style={styles.scheduleAppsCount}>
                    {schedule.appTokens.length === 0
                      ? "No apps selected"
                      : `${schedule.appTokens.length} app${schedule.appTokens.length !== 1 ? "s" : ""} selected`}
                  </Text>

                  <View style={styles.scheduleActions}>
                    <TouchableOpacity
                      style={styles.scheduleActionButton}
                      onPress={() => handleChooseAppsForSchedule(schedule.id)}
                      disabled={isLoading && selectedScheduleId === schedule.id}
                    >
                      <Text style={styles.scheduleActionText}>
                        {isLoading && selectedScheduleId === schedule.id
                          ? "Loading..."
                          : schedule.appTokens.length === 0
                            ? "Choose Apps"
                            : "Edit Apps"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.scheduleDeleteButton}
                      onPress={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Text style={styles.scheduleDeleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Schedule Modal */}
      <ScheduleModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSave={loadSchedules}
      />

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowHelpModal(false)}
        >
          <TouchableOpacity
            style={styles.helpModalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.helpModalHeader}>
              <Text style={styles.helpModalTitle}>How Prayer Lock Works</Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <Text style={styles.helpModalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.helpModalScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* How It Works Steps */}
              <View style={styles.helpSection}>
                <View style={styles.infoStep}>
                  <View style={styles.infoStepNumber}>
                    <Text style={styles.infoStepNumberText}>1</Text>
                  </View>
                  <View style={styles.infoStepContent}>
                    <Text style={styles.infoStepTitle}>Create a schedule</Text>
                    <Text style={styles.infoStepText}>
                      Choose your prayer times and which days they repeat
                    </Text>
                  </View>
                </View>

                <View style={styles.infoStep}>
                  <View style={styles.infoStepNumber}>
                    <Text style={styles.infoStepNumberText}>2</Text>
                  </View>
                  <View style={styles.infoStepContent}>
                    <Text style={styles.infoStepTitle}>Select apps</Text>
                    <Text style={styles.infoStepText}>
                      Choose which apps to lock for each prayer time
                    </Text>
                  </View>
                </View>

                <View style={styles.infoStep}>
                  <View style={styles.infoStepNumber}>
                    <Text style={styles.infoStepNumberText}>3</Text>
                  </View>
                  <View style={styles.infoStepContent}>
                    <Text style={styles.infoStepTitle}>
                      Apps lock automatically
                    </Text>
                    <Text style={styles.infoStepText}>
                      At your scheduled time, a gentle reminder appears when you
                      try to open locked apps
                    </Text>
                  </View>
                </View>

                <View style={styles.infoStep}>
                  <View style={styles.infoStepNumber}>
                    <Text style={styles.infoStepNumberText}>4</Text>
                  </View>
                  <View style={styles.infoStepContent}>
                    <Text style={styles.infoStepTitle}>
                      Complete your prayer
                    </Text>
                    <Text style={styles.infoStepText}>
                      Apps unlock automatically after your prayer session
                    </Text>
                  </View>
                </View>
              </View>

              {/* Pro Tip */}
              <View style={styles.helpTipCard}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>
                  <Text style={styles.tipBold}>Pro tip:</Text> Start with just
                  2-3 apps you find most distracting. You can always add more
                  schedules or apps later!
                </Text>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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

    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },

    helpButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.ui.white,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      zIndex: 2,
    },

    helpButtonText: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: colors.primary.main,
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

    // Next Lock Card
    nextLockCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.ui.white,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary.main,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    nextLockIcon: {
      fontSize: 24,
      marginRight: spacing.sm,
    },

    nextLockInfo: {
      flex: 1,
    },

    nextLockLabel: {
      fontSize: typography.size.xs,
      color: colors.text.secondary,
      marginBottom: 2,
    },

    nextLockTime: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
    },

    // Schedules Section
    schedulesSection: {
      marginBottom: spacing.md,
    },

    schedulesSectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },

    schedulesSectionTitle: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
    },

    addScheduleButton: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.semibold,
      color: colors.primary.main,
    },

    scheduleCard: {
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

    scheduleCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },

    scheduleCardTitle: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    scheduleIcon: {
      fontSize: 24,
      marginRight: spacing.sm,
    },

    scheduleInfo: {
      flex: 1,
    },

    scheduleName: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: 2,
    },

    scheduleTime: {
      fontSize: typography.size.xs,
      color: colors.text.secondary,
    },

    scheduleToggle: {
      padding: spacing.xs,
    },

    toggleSwitch: {
      width: 44,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.ui.border,
      justifyContent: "center",
      padding: 2,
    },

    toggleSwitchActive: {
      backgroundColor: colors.primary.main,
    },

    toggleKnob: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.ui.white,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },

    toggleKnobActive: {
      alignSelf: "flex-end",
    },

    scheduleCardBody: {
      borderTopWidth: 1,
      borderTopColor: colors.ui.border,
      paddingTop: spacing.sm,
    },

    scheduleAppsCount: {
      fontSize: typography.size.sm,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
    },

    scheduleActions: {
      flexDirection: "row",
      gap: spacing.sm,
    },

    scheduleActionButton: {
      flex: 1,
      backgroundColor: colors.primary.main,
      borderRadius: 10,
      paddingVertical: spacing.sm,
      alignItems: "center",
    },

    scheduleActionText: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.semibold,
      color: colors.ui.white,
    },

    scheduleDeleteButton: {
      backgroundColor: colors.background.cream,
      borderRadius: 10,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      alignItems: "center",
    },

    scheduleDeleteText: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.semibold,
      color: colors.text.secondary,
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

    // Help Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.lg,
    },

    helpModalContent: {
      backgroundColor: colors.ui.white,
      borderRadius: 20,
      width: "100%",
      maxWidth: 450,
      maxHeight: "85%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },

    helpModalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.ui.border,
    },

    helpModalTitle: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
    },

    helpModalClose: {
      fontSize: 24,
      color: colors.text.muted,
      paddingHorizontal: spacing.xs,
    },

    helpModalScroll: {
      padding: spacing.lg,
    },

    helpSection: {
      marginBottom: spacing.md,
    },

    helpTipCard: {
      flexDirection: "row",
      backgroundColor: colors.primary.soft,
      borderRadius: 12,
      padding: spacing.md,
      alignItems: "flex-start",
    },
  });

export default LockListScreen;

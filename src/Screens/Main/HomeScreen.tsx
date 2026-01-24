import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  Modal,
  AppState,
  AppStateStatus,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typography, spacing } from "../../constants/theme";
import { useTheme } from "../../contexts/ThemeContext";
import VerseService from "../../Services/VerseService";
import StreakService from "../../Services/StreakService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_NAME_KEY = "@user_name";

interface HomeScreenProps {
  userName?: string;
  onStartPrayer?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  userName = "Friend",
  onStartPrayer,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [verse, setVerse] = useState({ verse: "", reference: "" });
  const [displayName, setDisplayName] = useState(userName);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastPrayerTime, setLastPrayerTime] = useState<string>("Never");
  const [weekDays, setWeekDays] = useState<
    Array<{ day: string; completed: boolean; isToday: boolean }>
  >([]);
  const bounceAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Stats data - streak is real, others are mock for now
  const stats = {
    totalPrayers: 47,
    totalTimeMinutes: 142,
    currentStreak: currentStreak,
    longestStreak: longestStreak,
    weeklyCompleted: 3,
    weeklyGoal: 7,
    averageDuration: "3 min",
    favoriteTime: "Morning",
  };

  // Mock data - will be replaced with real data later
  const isAppsLocked = true;
  const lockedSinceTime = "9:12 PM";
  const prayerFocus = "Morning Gratitude";
  const suggestedDuration = "2 minutes";

  // Generate week days (Mon-Sun) with completion status
  const generateWeekDays = useCallback((prayerHistory: Set<string>) => {
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Get Monday of current week
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const monday = new Date(today);
    monday.setDate(today.getDate() - daysFromMonday);

    return dayNames.map((day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const dateStr = date.toISOString().split("T")[0];

      return {
        day,
        completed: prayerHistory.has(dateStr),
        isToday: dateStr === todayStr,
      };
    });
  }, []);

  // Format last prayer time in a user-friendly way
  const formatLastPrayerTime = useCallback((date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays === 1) return `Yesterday at ${timeStr}`;
    if (diffDays < 7) return `${diffDays} days ago at ${timeStr}`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  // Load prayer-related data (can be called on mount and on focus)
  const loadPrayerData = useCallback(async () => {
    // Load streak data
    const streak = await StreakService.getCurrentStreak();
    const longest = await StreakService.getLongestStreak();
    setCurrentStreak(streak);
    setLongestStreak(longest);

    // Load last prayer time
    const lastPrayerTimestamp = await StreakService.getLastPrayerTimestamp();
    if (lastPrayerTimestamp) {
      setLastPrayerTime(formatLastPrayerTime(lastPrayerTimestamp));
    } else {
      setLastPrayerTime("Never");
    }

    // Load week calendar with prayer history
    const prayerHistory = await StreakService.getWeekPrayerHistory();
    setWeekDays(generateWeekDays(prayerHistory));
  }, [formatLastPrayerTime, generateWeekDays]);

  useEffect(() => {
    // Animate the dove
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

    const loadData = async () => {
      const dailyVerse = await VerseService.getVerseOfDay();
      setVerse(dailyVerse);

      const savedName = await AsyncStorage.getItem(USER_NAME_KEY);
      if (savedName) {
        setDisplayName(savedName);
      }

      await loadPrayerData();
    };
    loadData();
  }, [loadPrayerData]);

  // Refresh prayer data when app comes back to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          loadPrayerData();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [loadPrayerData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    if (hour < 17) return "Good afternoon,";
    return "Good evening,";
  };

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
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{displayName} 👋</Text>
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

        {/* Journal & Streak Row */}
        <View style={styles.halfCardsRow}>
          {/* Streak Card */}
          <View style={styles.halfCardStreak}>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>
              {currentStreak === 1 ? "day streak" : "day streak"} 🔥
            </Text>
            <Text style={styles.halfCardSubtext}>
              {currentStreak === 0 ? "Start praying!" : "Keep it going!"}
            </Text>
          </View>
          {/* Stats Card */}
          <TouchableOpacity
            style={styles.halfCard}
            onPress={() => setShowStatsModal(true)}
          >
            <Text style={styles.halfCardIcon}>📊</Text>
            <Text style={styles.halfCardTitle}>Stats</Text>
            <Text style={styles.halfCardSubtext}>View your progress</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Prayer Section */}
        <View style={styles.todaysPrayerCard}>
          <Text style={styles.sectionTitle}>Daily Prayer's...</Text>

          <View style={styles.prayerInfoRow}>
            <Text style={styles.prayerInfoIcon}>🕐</Text>
            <Text style={styles.prayerInfoText}>
              Last prayer: {lastPrayerTime}
            </Text>
          </View>

          {/* Week Calendar */}
          <View style={styles.weekCalendar}>
            {weekDays.map((item, index) => (
              <View key={index} style={styles.dayContainer}>
                <View
                  style={[
                    styles.dayCircle,
                    item.completed && styles.dayCircleCompleted,
                    item.isToday && !item.completed && styles.dayCircleToday,
                  ]}
                >
                  {item.completed ? (
                    <Text style={styles.checkmark}>✓</Text>
                  ) : (
                    <Text
                      style={[
                        styles.dayLetter,
                        item.isToday && styles.dayLetterToday,
                      ]}
                    >
                      {item.day.charAt(0)}
                    </Text>
                  )}
                </View>
                <Text style={styles.dayLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Apps Locked Card */}
        {isAppsLocked && (
          <View style={styles.lockedCard}>
            <Text style={styles.lockedLabel}>Your apps are locked</Text>
            <Text style={styles.startPrayerTitle}>🙏 Start Prayer</Text>
            <TouchableOpacity
              style={styles.startPrayerButton}
              onPress={onStartPrayer}
            >
              <Text style={styles.startPrayerButtonText}>Start Prayer</Text>
            </TouchableOpacity>
            <Text style={styles.lockedSubtext}>
              Complete a prayer to unlock your apps.
            </Text>
            <TouchableOpacity style={styles.lockedSinceButton}>
              <Text style={styles.lockedSinceText}>
                Locked since {lockedSinceTime} {">"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Daily Verse
        <View style={styles.verseCard}>
          <Text style={styles.verseStar}>✦</Text>
          <Text style={styles.verseText}>{verse.verse}</Text>
          <Text style={styles.verseReference}>{verse.reference}</Text>
        </View> */}
      </ScrollView>

      {/* Stats Modal */}
      <Modal
        visible={showStatsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStatsModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Prayer Stats</Text>
              <TouchableOpacity onPress={() => setShowStatsModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalPrayers}</Text>
                <Text style={styles.statLabel}>Total Prayers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalTimeMinutes}</Text>
                <Text style={styles.statLabel}>Minutes Prayed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.currentStreak}</Text>
                <Text style={styles.statLabel}>Current Streak 🔥</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.longestStreak}</Text>
                <Text style={styles.statLabel}>Longest Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {stats.weeklyCompleted}/{stats.weeklyGoal}
                </Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.averageDuration}</Text>
                <Text style={styles.statLabel}>Avg Duration</Text>
              </View>
            </View>

            <View style={styles.statHighlight}>
              <Text style={styles.statHighlightIcon}>☀️</Text>
              <Text style={styles.statHighlightText}>
                You pray most often in the{" "}
                <Text style={styles.statHighlightBold}>
                  {stats.favoriteTime}
                </Text>
              </Text>
            </View>
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
      paddingBottom: spacing.lg,
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

    greeting: {
      fontSize: typography.size.lg,
      color: colors.text.secondary,
    },

    userName: {
      fontSize: typography.size["3xl"],
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
    },

    // Locked Card Styles
    lockedCard: {
      backgroundColor: colors.primary.main,
      borderRadius: 16,
      padding: spacing.md,
      marginBottom: spacing.md,
    },

    lockedLabel: {
      fontSize: typography.size.sm,
      color: colors.ui.white,
      opacity: 0.9,
      marginBottom: spacing.xs,
    },

    startPrayerTitle: {
      fontSize: typography.size["2xl"],
      fontWeight: typography.weight.bold,
      color: colors.ui.white,
      marginBottom: spacing.md,
    },

    startPrayerButton: {
      backgroundColor: colors.ui.white,
      borderRadius: 12,
      paddingVertical: spacing.md,
      alignItems: "center",
      marginBottom: spacing.sm,
    },

    startPrayerButtonText: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
    },

    lockedSubtext: {
      fontSize: typography.size.sm,
      color: colors.ui.white,
      opacity: 0.9,
      textAlign: "center",
      marginBottom: spacing.xs,
    },

    lockedSinceButton: {
      alignItems: "center",
      paddingVertical: spacing.xs,
    },

    lockedSinceText: {
      fontSize: typography.size.sm,
      color: colors.ui.white,
      textDecorationLine: "underline",
    },

    // Today's Prayer Card
    todaysPrayerCard: {
      backgroundColor: colors.ui.white,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.md,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    sectionTitle: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },

    prayerInfoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.xs,
    },

    prayerInfoIcon: {
      fontSize: 16,
      marginRight: spacing.sm,
    },

    prayerInfoText: {
      fontSize: typography.size.sm,
      color: colors.text.secondary,
      flex: 1,
    },

    prayerInfoBold: {
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
    },

    // Week Calendar
    weekCalendar: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: spacing.md,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.background.peach,
    },

    dayContainer: {
      alignItems: "center",
    },

    dayCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.background.cream,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.xs,
    },

    dayCircleCompleted: {
      backgroundColor: colors.primary.main,
    },

    dayCircleToday: {
      borderWidth: 2,
      borderColor: colors.primary.main,
      backgroundColor: colors.ui.white,
    },

    checkmark: {
      color: colors.ui.white,
      fontSize: 16,
      fontWeight: typography.weight.bold,
    },

    dayLetter: {
      fontSize: typography.size.sm,
      color: colors.text.muted,
      fontWeight: typography.weight.medium,
    },

    dayLetterToday: {
      color: colors.primary.main,
      fontWeight: typography.weight.bold,
    },

    dayLabel: {
      fontSize: typography.size.xs,
      color: colors.text.muted,
    },

    // Half Cards Row (Journal & Streak)
    halfCardsRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },

    halfCard: {
      flex: 1,
      backgroundColor: colors.primary.soft,
      borderRadius: 16,
      padding: spacing.md,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 120,
    },

    halfCardStreak: {
      flex: 1,
      backgroundColor: colors.ui.white,
      borderRadius: 16,
      padding: spacing.md,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 120,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    halfCardIcon: {
      fontSize: 28,
      marginBottom: spacing.xs,
    },

    halfCardTitle: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },

    halfCardSubtext: {
      fontSize: typography.size.xs,
      color: colors.text.secondary,
      textAlign: "center",
    },

    streakNumber: {
      fontSize: typography.size["4xl"],
      fontWeight: typography.weight.bold,
      color: colors.primary.main,
    },

    streakLabel: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },

    // Verse Card
    verseCard: {
      backgroundColor: colors.ui.white,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.md,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    verseStar: {
      fontSize: 14,
      color: colors.primary.main,
      marginBottom: spacing.xs,
    },

    verseText: {
      fontSize: typography.size.sm,
      color: colors.text.primary,
      fontStyle: "italic",
      lineHeight: 22,
      marginBottom: spacing.xs,
    },

    verseReference: {
      fontSize: typography.size.sm,
      color: colors.text.muted,
    },

    // Stats Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.lg,
    },

    modalContent: {
      backgroundColor: colors.ui.white,
      borderRadius: 20,
      padding: spacing.lg,
      width: "100%",
      maxWidth: 360,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },

    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.lg,
    },

    modalTitle: {
      fontSize: typography.size.xl,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
    },

    modalClose: {
      fontSize: 20,
      color: colors.text.muted,
      padding: spacing.xs,
    },

    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },

    statItem: {
      width: "48%",
      backgroundColor: colors.background.cream,
      borderRadius: 12,
      padding: spacing.md,
      alignItems: "center",
    },

    statNumber: {
      fontSize: typography.size["2xl"],
      fontWeight: typography.weight.bold,
      color: colors.primary.main,
      marginBottom: spacing.xs,
    },

    statLabel: {
      fontSize: typography.size.xs,
      color: colors.text.secondary,
      textAlign: "center",
    },

    statHighlight: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary.soft,
      borderRadius: 12,
      padding: spacing.md,
    },

    statHighlightIcon: {
      fontSize: 20,
      marginRight: spacing.sm,
    },

    statHighlightText: {
      fontSize: typography.size.sm,
      color: colors.text.primary,
      flex: 1,
    },

    statHighlightBold: {
      fontWeight: typography.weight.bold,
      color: colors.primary.main,
    },
  });

export default HomeScreen;

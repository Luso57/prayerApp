import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typography, spacing } from "../../constants/theme";
import { useTheme } from "../../contexts/ThemeContext";
import PrayerService from "../../Services/PrayerService";

interface PrayerScreenProps {
  categoryId: string;
  onExit: () => void;
}

const PrayerScreen: React.FC<PrayerScreenProps> = ({ categoryId, onExit }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [prayer, setPrayer] = useState({ title: "", text: "" });
  const [timeLeft, setTimeLeft] = useState(15);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const loadPrayer = () => {
      const selectedPrayer =
        PrayerService.getRandomPrayerByCategory(categoryId);
      if (selectedPrayer) {
        setPrayer({ title: selectedPrayer.title, text: selectedPrayer.text });
      }
    };
    loadPrayer();
  }, [categoryId]);

  useEffect(() => {
    if (hasStarted && timeLeft > 0 && !isComplete) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [hasStarted, timeLeft, isComplete]);

  const handleStartPrayer = () => {
    setHasStarted(true);
  };

  const handleCompletePrayer = () => {
    // TODO: Save prayer completion, unlock apps, update streak
    onExit();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Exit Button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <Text style={styles.exitButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Let's Pray</Text>
          <View style={styles.exitButtonPlaceholder} />
        </View>

        {/* Prayer Card */}
        <View style={styles.prayerCard}>
          <Text style={styles.prayerIcon}>🙏</Text>
          <View style={styles.verseContainer}>
            <Text style={styles.prayerTitle}>{prayer.title}</Text>
            <Text style={styles.verseText}>{prayer.text}</Text>
          </View>
        </View>

        {/* Start Prayer Button, Countdown Timer, or Complete Button */}
        <View style={styles.timerContainer}>
          {!hasStarted ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartPrayer}
            >
              <Text style={styles.startButtonText}>Start Prayer</Text>
            </TouchableOpacity>
          ) : !isComplete ? (
            <>
              <Text style={styles.timerLabel}>Time Remaining</Text>
              <Text style={styles.timerText}>{timeLeft}s</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((15 - timeLeft) / 15) * 100}%` },
                  ]}
                />
              </View>
            </>
          ) : (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleCompletePrayer}
            >
              <Text style={styles.completeButtonText}>Complete Prayer</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
      flexGrow: 1,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.xl,
    },

    exitButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.ui.white,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },

    exitButtonText: {
      fontSize: 20,
      color: colors.text.secondary,
      fontWeight: typography.weight.semibold,
    },

    exitButtonPlaceholder: {
      width: 40,
      height: 40,
    },

    headerTitle: {
      fontSize: typography.size["2xl"],
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
    },

    prayerCard: {
      backgroundColor: colors.ui.white,
      borderRadius: 20,
      padding: spacing.xl,
      marginBottom: spacing.xl,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      minHeight: 500,
      justifyContent: "center",
      alignItems: "center",
    },

    prayerIcon: {
      fontSize: 48,
      marginBottom: spacing.lg,
    },

    verseContainer: {
      alignItems: "center",
    },

    prayerTitle: {
      fontSize: typography.size.xl,
      fontWeight: typography.weight.bold,
      color: colors.primary.main,
      textAlign: "center",
      marginBottom: spacing.md,
    },

    verseText: {
      fontSize: typography.size.lg,
      color: colors.text.primary,
      textAlign: "center",
      lineHeight: 28,
      fontStyle: "italic",
    },

    timerContainer: {
      flex: 1,
      justifyContent: "flex-end",
      alignItems: "center",
      paddingBottom: spacing.xl,
    },

    timerLabel: {
      fontSize: typography.size.sm,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },

    timerText: {
      fontSize: typography.size["4xl"],
      fontWeight: typography.weight.bold,
      color: colors.primary.main,
      marginBottom: spacing.md,
    },

    progressBar: {
      width: "100%",
      height: 8,
      backgroundColor: colors.background.peach,
      borderRadius: 4,
      overflow: "hidden",
    },

    progressFill: {
      height: "100%",
      backgroundColor: colors.primary.main,
      borderRadius: 4,
    },

    startButton: {
      backgroundColor: colors.primary.main,
      borderRadius: 16,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      width: "100%",
      alignItems: "center",
      shadowColor: colors.primary.main,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },

    startButtonText: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: colors.ui.white,
    },

    completeButton: {
      backgroundColor: colors.primary.main,
      borderRadius: 16,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      width: "100%",
      alignItems: "center",
      shadowColor: colors.primary.main,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },

    completeButtonText: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: colors.ui.white,
    },
  });

export default PrayerScreen;

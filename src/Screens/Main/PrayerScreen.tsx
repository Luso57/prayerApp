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
import StreakService from "../../Services/StreakService";
import JournalEntryModal from "../../Components/JournalEntryModal";
import { unlockAllApps } from "../../Services/ScreenTimeService";
import { maybeRequestReview } from "../../Services/ReviewService";

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
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    const loadPrayer = () => {
      const selectedPrayer =
        PrayerService.getRandomPrayerByCategory(categoryId);
      if (selectedPrayer) {
        setPrayer({ title: selectedPrayer.title, text: selectedPrayer.text });
      }
      // Get category name for display
      const categories = PrayerService.getAllCategories();
      const category = categories.find(
        (c: { id: string; label: string }) => c.id === categoryId,
      );
      if (category) {
        setCategoryName(category.label);
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

  const handleCompletePrayer = async () => {
    try {
      // Record the prayer completion for streak tracking
      await StreakService.recordPrayerCompletion();

      // Opportunistically ask for a review after a meaningful moment
      await maybeRequestReview();

      // Unlock all shielded apps
      try {
        await unlockAllApps();
        console.log("Apps unlocked after prayer completion");
      } catch (unlockError) {
        console.log("No apps to unlock or unlock failed:", unlockError);
      }

      // Show completion screen instead of exiting immediately
      setShowCompletionScreen(true);
    } catch (error) {
      console.error("Error in handleCompletePrayer:", error);
      // Still show completion screen even if there's an error
      setShowCompletionScreen(true);
    }
  };

  const handleJournalEntry = () => {
    setShowJournalModal(true);
  };

  const handleJournalSave = () => {
    setShowJournalModal(false);
    onExit();
  };

  const handleContinue = () => {
    onExit();
  };

  // Completion Screen
  if (showCompletionScreen) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completionContainer}>
          <View style={styles.completionContent}>
            <Text style={styles.completionIcon}>✨</Text>
            <Text style={styles.completionTitle}>Beautiful!</Text>
            <Text style={styles.completionSubtitle}>
              You've deepened your relationship with God
            </Text>
            <Text style={styles.completionMessage}>
              Taking time to pray shows your commitment to your spiritual
              journey. Keep nurturing this sacred connection.
            </Text>
          </View>

          <View style={styles.completionActions}>
            <TouchableOpacity
              style={styles.journalButton}
              onPress={handleJournalEntry}
            >
              <Text style={styles.journalButtonIcon}>📓</Text>
              <View style={styles.journalButtonTextContainer}>
                <Text style={styles.journalButtonTitle}>
                  Reflect in Journal
                </Text>
                <Text style={styles.journalButtonSubtitle}>
                  Capture your thoughts from this prayer
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Journal Entry Modal */}
        <JournalEntryModal
          visible={showJournalModal}
          onClose={() => setShowJournalModal(false)}
          onSave={handleJournalSave}
          prayerCategory={categoryName}
          prefillText={`Just finished praying about ${categoryName.toLowerCase()}. ${prayer.title}: "${prayer.text.substring(0, 100)}..."\n\nMy reflection: `}
        />
      </SafeAreaView>
    );
  }

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
          <ScrollView
            style={styles.verseScrollContainer}
            contentContainerStyle={styles.verseContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.prayerTitle}>{prayer.title}</Text>
            <Text style={styles.verseText}>{prayer.text}</Text>
          </ScrollView>
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
      maxHeight: 500,
    },

    prayerIcon: {
      fontSize: 48,
      marginBottom: spacing.lg,
      textAlign: "center",
    },

    verseScrollContainer: {
      maxHeight: 380,
      width: "100%",
    },

    verseContainer: {
      alignItems: "center",
      paddingBottom: spacing.md,
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

    // Completion Screen Styles
    completionContainer: {
      flex: 1,
      justifyContent: "space-between",
      padding: spacing.lg,
    },

    completionContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
    },

    completionIcon: {
      fontSize: 80,
      marginBottom: spacing.xl,
    },

    completionTitle: {
      fontSize: typography.size["4xl"],
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: spacing.sm,
      textAlign: "center",
    },

    completionSubtitle: {
      fontSize: typography.size.xl,
      fontWeight: typography.weight.semibold,
      color: colors.primary.main,
      marginBottom: spacing.lg,
      textAlign: "center",
    },

    completionMessage: {
      fontSize: typography.size.base,
      color: colors.text.secondary,
      textAlign: "center",
      lineHeight: 24,
      paddingHorizontal: spacing.md,
    },

    completionActions: {
      paddingBottom: spacing.xl,
    },

    journalButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.ui.white,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 2,
      borderColor: colors.primary.main,
    },

    journalButtonIcon: {
      fontSize: 36,
      marginRight: spacing.md,
    },

    journalButtonTextContainer: {
      flex: 1,
    },

    journalButtonTitle: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
      marginBottom: 2,
    },

    journalButtonSubtitle: {
      fontSize: typography.size.sm,
      color: colors.text.secondary,
    },

    continueButton: {
      backgroundColor: colors.primary.main,
      borderRadius: 16,
      paddingVertical: spacing.lg,
      alignItems: "center",
      shadowColor: colors.primary.main,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },

    continueButtonText: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: colors.ui.white,
    },
  });

export default PrayerScreen;

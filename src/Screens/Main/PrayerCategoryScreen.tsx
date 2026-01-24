import React, { useMemo } from "react";
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
import PrayerService, { PrayerCategory } from "../../Services/PrayerService";

interface PrayerCategoryScreenProps {
  onSelectCategory: (categoryId: string) => void;
  onExit: () => void;
}

const PrayerCategoryScreen: React.FC<PrayerCategoryScreenProps> = ({
  onSelectCategory,
  onExit,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const categories = PrayerService.getAllCategories();

  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    gratitude: "🙏",
    anxiety: "😌",
    work: "💼",
    guidance: "🧭",
    family: "👨‍👩‍👧‍👦",
    friends: "🤝",
    health: "❤️",
    discipline: "💪",
    forgiveness: "🕊️",
    sleep: "😴",
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Exit Button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <Text style={styles.exitButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Prayer</Text>
          <View style={styles.exitButtonPlaceholder} />
        </View>

        <Text style={styles.subtitle}>What's on your heart today?</Text>

        {/* 2x5 Grid of Categories */}
        <View style={styles.categoryGrid}>
          {categories.map((category: PrayerCategory) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => onSelectCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>
                {categoryIcons[category.id] || "🙏"}
              </Text>
              <Text style={styles.categoryLabel}>{category.label}</Text>
            </TouchableOpacity>
          ))}
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
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
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

    subtitle: {
      fontSize: typography.size.base,
      color: colors.text.secondary,
      textAlign: "center",
      marginBottom: spacing.lg,
    },

    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },

    categoryCard: {
      width: "48%",
      backgroundColor: colors.ui.white,
      borderRadius: 16,
      padding: spacing.lg,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 120,
      marginBottom: spacing.md,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    categoryIcon: {
      fontSize: 36,
      marginBottom: spacing.sm,
    },

    categoryLabel: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
      textAlign: "center",
    },
  });

export default PrayerCategoryScreen;

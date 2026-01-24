import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { typography, spacing } from "../../constants/theme";
import { useTheme } from "../../contexts/ThemeContext";
import HomeScreen from "./HomeScreen";
import LockListScreen from "./LockListScreen";
import SettingsScreen from "./SettingsScreen";
import PrayerScreen from "./PrayerScreen";
import PrayerCategoryScreen from "./PrayerCategoryScreen";
import JournalScreen from "./JournalScreen";

type TabName = "home" | "journal" | "lockList" | "settings";

interface TabConfig {
  name: TabName;
  label: string;
  icon: string;
  activeIcon: string;
}

const TABS: TabConfig[] = [
  { name: "home", label: "home", icon: "🏠", activeIcon: "🏠" },
  { name: "journal", label: "journal", icon: "📓", activeIcon: "📓" },
  { name: "lockList", label: "lock list", icon: "🔒", activeIcon: "🔓" },
  { name: "settings", label: "settings", icon: "⚙️", activeIcon: "⚙️" },
];

interface MainNavigatorProps {
  userName?: string;
}

const MainNavigator: React.FC<MainNavigatorProps> = ({ userName }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [activeTab, setActiveTab] = useState<TabName>("home");
  const [showPrayerCategoryScreen, setShowPrayerCategoryScreen] =
    useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [homeRefreshKey, setHomeRefreshKey] = useState(0);

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeScreen
            key={homeRefreshKey}
            userName={userName}
            onStartPrayer={() => setShowPrayerCategoryScreen(true)}
          />
        );
      case "journal":
        return <JournalScreen />;
      case "lockList":
        return <LockListScreen />;
      case "settings":
        return <SettingsScreen />;
      default:
        return (
          <HomeScreen
            key={homeRefreshKey}
            userName={userName}
            onStartPrayer={() => setShowPrayerCategoryScreen(true)}
          />
        );
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowPrayerCategoryScreen(false);
  };

  const handlePrayerExit = () => {
    setSelectedCategory(null);
    // Increment refresh key to force HomeScreen to reload data
    setHomeRefreshKey((prev) => prev + 1);
  };

  // If category is selected, show PrayerScreen
  if (selectedCategory) {
    return (
      <PrayerScreen categoryId={selectedCategory} onExit={handlePrayerExit} />
    );
  }

  // If PrayerCategoryScreen is active, show it full screen
  if (showPrayerCategoryScreen) {
    return (
      <PrayerCategoryScreen
        onSelectCategory={handleCategorySelect}
        onExit={() => setShowPrayerCategoryScreen(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Screen Content */}
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.name;

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.name)}
            >
              {/* Orange circle highlight for active tab */}
              <View
                style={[
                  styles.iconContainer,
                  isActive && styles.iconContainerActive,
                ]}
              >
                <Text
                  style={[styles.tabIcon, isActive && styles.tabIconActive]}
                >
                  {isActive ? tab.activeIcon : tab.icon}
                </Text>
              </View>
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.cream,
    },

    screenContainer: {
      flex: 1,
    },

    tabBar: {
      flexDirection: "row",
      backgroundColor: colors.ui.white,
      borderTopWidth: 1,
      borderTopColor: colors.ui.border,
      paddingBottom: spacing.lg, // Extra padding for home indicator
      paddingTop: spacing.sm,
    },

    tabItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xs,
    },

    tabItemCenter: {
      marginTop: -20, // Lift the center button
    },

    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 2,
    },

    iconContainerActive: {
      backgroundColor: colors.primary.main,
      shadowColor: colors.primary.main,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },

    tabIcon: {
      fontSize: 24,
      opacity: 0.5,
    },

    tabIconActive: {
      opacity: 1,
    },

    tabLabel: {
      fontSize: typography.size.xs,
      color: colors.text.muted,
    },

    tabLabelActive: {
      color: colors.primary.main,
      fontWeight: typography.weight.medium,
    },
  });

export default MainNavigator;

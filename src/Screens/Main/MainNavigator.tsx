import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import HomeScreen from './HomeScreen';
import LockListScreen from './LockListScreen';
import SettingsScreen from './SettingsScreen';

type TabName = 'home' | 'lockList' | 'settings';

interface TabConfig {
  name: TabName;
  label: string;
  icon: string;
  activeIcon: string;
}

const TABS: TabConfig[] = [
  { name: 'home', label: 'home', icon: '🏠', activeIcon: '🏠' },
  { name: 'lockList', label: 'lock list', icon: '🔒', activeIcon: '🔓' },
  { name: 'settings', label: 'settings', icon: '⚙️', activeIcon: '⚙️' },
];

interface MainNavigatorProps {
  userName?: string;
}

const MainNavigator: React.FC<MainNavigatorProps> = ({ userName }) => {
  const [activeTab, setActiveTab] = useState<TabName>('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen userName={userName} />;
      case 'lockList':
        return <LockListScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen userName={userName} />;
    }
  };

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
              <View style={[
                styles.iconContainer,
                isActive && styles.iconContainerActive,
              ]}>
                <Text style={[
                  styles.tabIcon,
                  isActive && styles.tabIconActive,
                ]}>
                  {isActive ? tab.activeIcon : tab.icon}
                </Text>
              </View>
              <Text style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },

  screenContainer: {
    flex: 1,
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.ui.white,
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
    paddingBottom: spacing.lg, // Extra padding for home indicator
    paddingTop: spacing.sm,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },

  tabItemCenter: {
    marginTop: -20, // Lift the center button
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
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

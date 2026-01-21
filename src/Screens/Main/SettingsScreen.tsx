import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [dailyReminder, setDailyReminder] = React.useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>settings</Text>
          <Text style={styles.subtitle}>customize your experience ⚙️</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.card}>
            <SettingsItem
              icon="👤"
              title="Edit Profile"
              onPress={() => console.log('Edit profile')}
            />
            <SettingsItem
              icon="🙏"
              title="Prayer Preferences"
              onPress={() => console.log('Prayer preferences')}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <SettingsToggle
              icon="🔔"
              title="Push Notifications"
              value={notificationsEnabled}
              onToggle={setNotificationsEnabled}
            />
            <SettingsToggle
              icon="⏰"
              title="Daily Prayer Reminder"
              value={dailyReminder}
              onToggle={setDailyReminder}
            />
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.card}>
            <SettingsItem
              icon="📱"
              title="Manage Locked Apps"
              onPress={() => console.log('Manage apps')}
            />
            <SettingsItem
              icon="🎨"
              title="Appearance"
              onPress={() => console.log('Appearance')}
            />
            <SettingsItem
              icon="🔒"
              title="Privacy"
              onPress={() => console.log('Privacy')}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <SettingsItem
              icon="❓"
              title="Help & FAQ"
              onPress={() => console.log('Help')}
            />
            <SettingsItem
              icon="💬"
              title="Contact Us"
              onPress={() => console.log('Contact')}
            />
            <SettingsItem
              icon="⭐"
              title="Rate the App"
              onPress={() => console.log('Rate')}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <SettingsItem
              icon="💳"
              title="Subscription"
              subtitle="Premium Active"
              onPress={() => console.log('Subscription')}
            />
            <SettingsItem
              icon="🔄"
              title="Restore Purchases"
              onPress={() => console.log('Restore')}
            />
          </View>
        </View>

        {/* Version */}
        <Text style={styles.version}>PrayerFirst v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// Settings Item Component
const SettingsItem: React.FC<{
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
}> = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
    <Text style={styles.settingsIcon}>{icon}</Text>
    <View style={styles.settingsContent}>
      <Text style={styles.settingsTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
    </View>
    <Text style={styles.settingsArrow}>›</Text>
  </TouchableOpacity>
);

// Settings Toggle Component
const SettingsToggle: React.FC<{
  icon: string;
  title: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}> = ({ icon, title, value, onToggle }) => (
  <View style={styles.settingsItem}>
    <Text style={styles.settingsIcon}>{icon}</Text>
    <View style={styles.settingsContent}>
      <Text style={styles.settingsTitle}>{title}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: colors.ui.border, true: colors.primary.light }}
      thumbColor={value ? colors.primary.main : colors.ui.white}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },

  title: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },

  subtitle: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  section: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },

  card: {
    backgroundColor: colors.ui.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.cream,
  },

  settingsIcon: {
    fontSize: 22,
    marginRight: spacing.md,
  },

  settingsContent: {
    flex: 1,
  },

  settingsTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },

  settingsSubtitle: {
    fontSize: typography.size.sm,
    color: colors.primary.main,
    marginTop: 2,
  },

  settingsArrow: {
    fontSize: 22,
    color: colors.text.muted,
  },

  version: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
    textAlign: 'center',
    marginVertical: spacing.xl,
  },
});

export default SettingsScreen;

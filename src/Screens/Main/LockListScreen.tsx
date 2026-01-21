import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import Button from '../../Components/Button';

interface LockedApp {
  id: string;
  name: string;
  icon: string;
}

const LockListScreen: React.FC = () => {
  const [lockedApps, setLockedApps] = useState<LockedApp[]>([]);

  const handleLockApps = () => {
    // TODO: Implement app selection modal
    console.log('Open app selector');
  };

  const removeApp = (id: string) => {
    setLockedApps(lockedApps.filter(app => app.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>your distracting apps</Text>
          <Text style={styles.subtitle}>choose apps to lock until you pray 🙏</Text>
        </View>

        {/* Locked Apps Card */}
        <View style={styles.appsCard}>
          {lockedApps.length === 0 ? (
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
            // List of locked apps
            <View style={styles.appsList}>
              {lockedApps.map((app) => (
                <View key={app.id} style={styles.appItem}>
                  <Text style={styles.appIcon}>{app.icon}</Text>
                  <Text style={styles.appName}>{app.name}</Text>
                  <TouchableOpacity
                    onPress={() => removeApp(app.id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
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
          title="lock apps"
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

  appsCard: {
    backgroundColor: colors.ui.white,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 200,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.warmWhite,
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
  },

  appsList: {
    gap: spacing.sm,
  },

  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },

  removeButtonText: {
    fontSize: 14,
    color: colors.text.secondary,
  },

  infoCard: {
    flexDirection: 'row',
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

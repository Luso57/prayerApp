import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';

interface HomeScreenProps {
  userName?: string;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ userName = 'Friend' }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.userName}>{userName} 👋</Text>
        </View>

        {/* Daily Verse Card */}
        <View style={styles.verseCard}>
          <Text style={styles.verseLabel}>📖 Verse of the Day</Text>
          <Text style={styles.verseText}>
            "Be still, and know that I am God."
          </Text>
          <Text style={styles.verseReference}>— Psalm 46:10</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start Your Day</Text>
          <View style={styles.quickActions}>
            <QuickActionCard
              emoji="🙏"
              title="Morning Prayer"
              subtitle="5 min"
            />
            <QuickActionCard
              emoji="📿"
              title="Guided Prayer"
              subtitle="10 min"
            />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsContainer}>
            <StatCard number="7" label="Day Streak 🔥" />
            <StatCard number="23" label="Prayers" />
            <StatCard number="4" label="Hours Saved" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Quick Action Card Component
const QuickActionCard: React.FC<{
  emoji: string;
  title: string;
  subtitle: string;
}> = ({ emoji, title, subtitle }) => (
  <View style={styles.quickActionCard}>
    <Text style={styles.quickActionEmoji}>{emoji}</Text>
    <Text style={styles.quickActionTitle}>{title}</Text>
    <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
  </View>
);

// Stat Card Component
const StatCard: React.FC<{ number: string; label: string }> = ({
  number,
  label,
}) => (
  <View style={styles.statCard}>
    <Text style={styles.statNumber}>{number}</Text>
    <Text style={styles.statLabel}>{label}</Text>
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

  greeting: {
    fontSize: typography.size.lg,
    color: colors.text.secondary,
  },

  userName: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },

  verseCard: {
    backgroundColor: colors.primary.soft,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },

  verseLabel: {
    fontSize: typography.size.sm,
    color: colors.primary.main,
    marginBottom: spacing.sm,
  },

  verseText: {
    fontSize: typography.size.lg,
    fontStyle: 'italic',
    color: colors.text.primary,
    lineHeight: 28,
    marginBottom: spacing.sm,
  },

  verseReference: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    textAlign: 'right',
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  quickActionCard: {
    flex: 1,
    backgroundColor: colors.ui.white,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  quickActionEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },

  quickActionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  quickActionSubtitle: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },

  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.ui.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  statNumber: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.primary.main,
  },

  statLabel: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default HomeScreen;

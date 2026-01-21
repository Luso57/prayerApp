import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';

const InsightsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>insights</Text>
          <Text style={styles.subtitle}>track your prayer journey 📊</Text>
        </View>

        {/* Weekly Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>This Week</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryNumber}>5</Text>
              <Text style={styles.summaryLabel}>Days Prayed</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryNumber}>45</Text>
              <Text style={styles.summaryLabel}>Minutes</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryNumber}>3h</Text>
              <Text style={styles.summaryLabel}>Screen Saved</Text>
            </View>
          </View>
        </View>

        {/* Chart Placeholder */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Prayer Activity</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>📈</Text>
            <Text style={styles.chartPlaceholderLabel}>Chart coming soon</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <ActivityItem
            emoji="🙏"
            title="Morning Prayer"
            time="Today, 7:30 AM"
            duration="5 min"
          />
          <ActivityItem
            emoji="📿"
            title="Guided Prayer"
            time="Yesterday, 8:00 AM"
            duration="10 min"
          />
          <ActivityItem
            emoji="🙏"
            title="Evening Reflection"
            time="Yesterday, 9:00 PM"
            duration="3 min"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Activity Item Component
const ActivityItem: React.FC<{
  emoji: string;
  title: string;
  time: string;
  duration: string;
}> = ({ emoji, title, time, duration }) => (
  <View style={styles.activityItem}>
    <View style={styles.activityEmoji}>
      <Text style={styles.activityEmojiText}>{emoji}</Text>
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
    <Text style={styles.activityDuration}>{duration}</Text>
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

  summaryCard: {
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  summaryTitle: {
    fontSize: typography.size.base,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.md,
  },

  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  summaryStat: {
    alignItems: 'center',
  },

  summaryNumber: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.ui.white,
  },

  summaryLabel: {
    fontSize: typography.size.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },

  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  chartCard: {
    backgroundColor: colors.ui.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  chartTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  chartPlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.warmWhite,
    borderRadius: 12,
  },

  chartPlaceholderText: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },

  chartPlaceholderLabel: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
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

  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ui.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },

  activityEmoji: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.soft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  activityEmojiText: {
    fontSize: 20,
  },

  activityContent: {
    flex: 1,
  },

  activityTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },

  activityTime: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },

  activityDuration: {
    fontSize: typography.size.sm,
    color: colors.primary.main,
    fontWeight: typography.weight.medium,
  },
});

export default InsightsScreen;

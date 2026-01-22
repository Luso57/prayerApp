import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../../constants/theme';

interface PrayerStreakCardProps {
  streak: number;
  motivation?: string;
}

const getMotivationText = (streak: number): string => {
  if (streak === 0) return "Start your journey!";
  if (streak === 1) return "Great start!";
  if (streak < 7) return "Keep it up!";
  if (streak < 14) return "You're on fire!";
  if (streak < 30) return "Amazing progress!";
  return "Incredible dedication!";
};

const PrayerStreakCard: React.FC<PrayerStreakCardProps> = ({ 
  streak, 
  motivation 
}) => {
  const motivationText = motivation || getMotivationText(streak);
  const dayLabel = streak === 1 ? 'day' : 'days';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>prayer streak</Text>
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={styles.emoji}>🙏</Text>
          <View style={styles.numberContainer}>
            <Text style={styles.number}>{streak}</Text>
            <Text style={styles.label}>{dayLabel}</Text>
          </View>
        </View>
        <Text style={styles.motivation}>{motivationText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5A462',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: typography.size.sm,
    color: colors.background.cream,
    marginBottom: spacing.xs,
  },

  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  emoji: {
    fontSize: 28,
    marginRight: spacing.xs,
  },

  numberContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  number: {
    fontSize: 36,
    fontWeight: typography.weight.bold,
    color: colors.background.cream,
    marginRight: spacing.xs,
  },

  label: {
    fontSize: typography.size.sm,
    color: colors.background.cream,
    opacity: 0.9,
  },

  motivation: {
    fontSize: typography.size.sm,
    color: colors.background.cream,
    opacity: 0.9,
  },
});

export default PrayerStreakCard;

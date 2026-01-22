import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../../constants/theme';

export interface Prayer {
  id: string;
  title: string;
  content: string;
  date: Date;
  category?: string;
}

interface PrayerCardProps {
  prayer: Prayer;
}

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const PrayerCard: React.FC<PrayerCardProps> = ({ prayer }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{prayer.title}</Text>
        <Text style={styles.date}>{formatDate(prayer.date)}</Text>
      </View>
      <Text style={styles.content} numberOfLines={2}>
        {prayer.content}
      </Text>
      {prayer.category && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{prayer.category}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.cream,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  title: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    flex: 1,
  },

  date: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
  },

  content: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary.soft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },

  categoryText: {
    fontSize: typography.size.xs,
    color: colors.primary.main,
    fontWeight: typography.weight.medium,
  },
});

export default PrayerCard;

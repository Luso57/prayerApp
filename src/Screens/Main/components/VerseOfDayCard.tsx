import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../../constants/theme';

interface VerseOfDayCardProps {
  verse: string;
  reference: string;
}

const VerseOfDayCard: React.FC<VerseOfDayCardProps> = ({ verse, reference }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>📖 Verse of the Day</Text>
      <Text style={styles.verse}>"{verse}"</Text>
      <Text style={styles.reference}>— {reference}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary.soft,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  label: {
    fontSize: typography.size.xs,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },

  verse: {
    fontSize: typography.size.sm,
    fontStyle: 'italic',
    color: colors.text.primary,
    lineHeight: 24,
    marginBottom: spacing.xs,
  },

  reference: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
    textAlign: 'right',
  },
});

export default VerseOfDayCard;

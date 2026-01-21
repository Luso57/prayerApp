import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../../constants/theme';

interface OptionCardProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  variant?: 'single' | 'multi'; // single = radio, multi = checkbox
}

const OptionCard: React.FC<OptionCardProps> = ({
  emoji,
  title,
  subtitle,
  selected,
  onPress,
  variant = 'single',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.containerSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Emoji */}
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}

      {/* Text content */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* Selection indicator */}
      <View style={styles.indicatorContainer}>
        {variant === 'single' ? (
          // Radio button style
          <View style={[styles.radio, selected && styles.radioSelected]}>
            {selected && <View style={styles.radioInner} />}
          </View>
        ) : (
          // Checkbox style
          <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
            {selected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },

  containerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  emoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.background.cream,
    marginBottom: 2,
  },

  subtitle: {
    fontSize: typography.size.sm,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  indicatorContainer: {
    marginLeft: spacing.sm,
  },

  // Radio button styles
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioSelected: {
    borderColor: colors.background.cream,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.background.cream,
  },

  // Checkbox styles
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },

  checkmark: {
    fontSize: 14,
    color: colors.background.cream,
    fontWeight: typography.weight.bold,
  },
});

export default OptionCard;
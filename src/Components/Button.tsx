import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, borderRadius, shadows, spacing } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? colors.primary.main : colors.ui.white}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },

  // Variants
  primary: {
    backgroundColor: colors.ui.buttonDark,
    ...shadows.md,
  },
  secondary: {
    backgroundColor: colors.primary.main,
    ...shadows.md,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.main,
  },

  // Sizes
  size_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  size_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  size_lg: {
    paddingVertical: spacing.lg - 4,
    paddingHorizontal: spacing.xl,
  },

  // Full width
  fullWidth: {
    width: '100%',
  },

  // Disabled
  disabled: {
    opacity: 0.5,
  },

  // Text base
  text: {
    fontWeight: typography.weight.semibold,
  },

  // Text variants
  text_primary: {
    color: colors.ui.white,
  },
  text_secondary: {
    color: colors.ui.white,
  },
  text_outline: {
    color: colors.primary.main,
  },

  // Text sizes
  textSize_sm: {
    fontSize: typography.size.sm,
  },
  textSize_md: {
    fontSize: typography.size.base,
  },
  textSize_lg: {
    fontSize: typography.size.lg,
  },

  // Text disabled
  textDisabled: {
    opacity: 0.7,
  },
});

export default Button;
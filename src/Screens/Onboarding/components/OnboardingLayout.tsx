import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../../constants/theme';

const { width } = Dimensions.get('window');

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  titleHighlight?: string;       
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  showBack?: boolean;
  headerContent?: React.ReactNode;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  titleHighlight,
  subtitle,
  currentStep,
  totalSteps,
  onBack,
  showBack = true,
  headerContent,
}) => {
  // Split title to highlight specific words
  const renderTitle = () => {
    if (!titleHighlight) {
      return <Text style={styles.title}>{title}</Text>;
    }

    const parts = title.split(titleHighlight);
    return (
      <Text style={styles.title}>
        {parts[0]}
        <Text style={styles.titleHighlight}>{titleHighlight}</Text>
        {parts[1]}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background decorative circles */}
      <View style={styles.circleOne} />
      <View style={styles.circleTwo} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header with back button and progress */}
        <View style={styles.header}>
          {showBack && onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(currentStep / totalSteps) * 100}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.backPlaceholder} />
        </View>

        {/* Optional content above title */}
        {headerContent}

        {/* Title Section */}
        <View style={styles.titleSection}>
          {renderTitle()}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CC6F35', // Peachy orange background
  },

  // Decorative circles
  circleOne: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: colors.ui.overlayLight,
    top: -width * 0.3,
    right: -width * 0.3,
  },
  circleTwo: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: colors.ui.overlayLight,
    bottom: -width * 0.2,
    left: -width * 0.2,
  },

  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 0,
    paddingBottom: spacing.xs,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    fontSize: 28,
    color: colors.background.cream,
    marginTop: -2,
  },

  backPlaceholder: {
    width: 40,
  },

  // Progress bar
  progressContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.background.cream,
    borderRadius: 2,
  },

  // Title section
  titleSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },

  title: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.regular,
    color: colors.background.cream,
    textAlign: 'center',
    lineHeight: typography.size['3xl'] * 1.3,
  },

  titleHighlight: {
    fontWeight: typography.weight.bold,
  },

  subtitle: {
    fontSize: typography.size.base,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: typography.size.base * 1.5,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});

export default OnboardingLayout;
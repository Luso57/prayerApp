import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import Button from '../Components/Button';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  // Animation value - starts below the screen
  const bounceAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    // Start the bounce animation when component mounts
    Animated.spring(bounceAnim, {
      toValue: 0,
      friction: 4,        // Controls bounciness (lower = more bouncy)
      tension: 50,        // Controls speed (higher = faster)
      useNativeDriver: true,
    }).start();
  }, [bounceAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Section - Orange Background */}
      <View style={styles.topSection}>
        {/* SafeArea just for top content positioning */}
        <SafeAreaView style={styles.topContent}>
          {/* Decorative background circles */}
          <View style={styles.circleOne} />
          <View style={styles.circleTwo} />

          {/* Dove Mascot with bounce animation */}
          <Animated.View 
            style={[
              styles.mascotContainer,
              {
                transform: [{ translateY: bounceAnim }],
              },
            ]}
          >
            <Image
              source={require('../../assets/DoveWaving.png')}
              style={styles.mascotImage}
              resizeMode="contain"
            />
          </Animated.View>
        </SafeAreaView>
      </View>

      {/* Bottom Section - Cream Background */}
      <View style={styles.bottomSection}>
        {/* Curved edge overlay */}
        <View style={styles.curvedEdge} />

        {/* Content with SafeArea for bottom */}
        <View style={styles.content}>
          <Text style={styles.heading}>Hey, I'm Selah!</Text>

          <Text style={styles.subtitle}>I'm here to bring you closer to god!</Text>

          <Text style={styles.description}>
            PrayFrist will help you bring your heart back to God through daily prayers
          </Text>

          <Button
            title="Get Started"
            onPress={onGetStarted}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>

        {/* Bottom safe area spacer */}
        <SafeAreaView style={styles.bottomSafeArea} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },

  // ============ TOP SECTION ============
  topSection: {
    height: height * 0.52,
    backgroundColor: colors.primary.main,
    overflow: 'hidden',
  },

  topContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Decorative circles
  circleOne: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: colors.ui.overlayLight,
    top: -width * 0.6,
    left: -width * 0.25,
  },
  circleTwo: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: colors.ui.overlayLight,
    bottom: -width * 0.15,
    right: -width * 0.15,
  },

  // Mascot
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  mascotImage: {
    width: width * 2,
    height: width * 1,
  },
  mascotPlaceholder: {
    width: width * 0.5,
    height: width * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 140,
  },

  // ============ BOTTOM SECTION ============
  bottomSection: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },

  curvedEdge: {
    position: 'absolute',
    top: -35,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: colors.background.cream,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    bottom: spacing.lg,
    width: '100%',
  },

  bottomSafeArea: {
    backgroundColor: colors.background.cream,
  },

  heading: {
    fontSize: 45,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    bottom: spacing.sm,
  },

  subtitle: {
    fontSize: 20,
    fontWeight: typography.weight.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  description: {
    fontSize: 20,
    fontWeight: typography.weight.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xl,
  },
});

export default WelcomeScreen;
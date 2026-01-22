import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import OnboardingLayout from '../components/OnboardingLayout';
import OptionCard from '../components/OptionCard';
import Button from '../../../Components/Button';
import { PrayerStyleOption, prayerStyleOptions } from '../../../types/onboarding';
import { spacing } from '../../../constants/theme';

interface PrayerStyleStepProps {
  value: PrayerStyleOption | null;
  onNext: (value: PrayerStyleOption) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

const PrayerStyleStep: React.FC<PrayerStyleStepProps> = ({
  value,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}) => {
  const [selected, setSelected] = React.useState<PrayerStyleOption | null>(value);
  const bounceAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bounceAnim, {
        toValue: 0,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    if (selected) {
      onNext(selected);
    }
  };

  return (
    <OnboardingLayout
      title="How Often Do You Pray?"
      titleHighlight="Often"
      subtitle="Let us know your current rhythm so we can help you grow."
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerContent={
        <View style={styles.imageContainer}>
          <Animated.Image
            source={require("../../../../assets/DoveHeadTilt.png")}
            style={[
              styles.image,
              {
                opacity: opacityAnim,
                transform: [{ translateY: bounceAnim }],
              },
            ]}
            resizeMode="contain"
          />
        </View>
      }
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {prayerStyleOptions.map((option) => (
            <OptionCard
              key={option.id}
              emoji={option.emoji}
              title={option.title}
              subtitle={option.subtitle}
              selected={selected === option.id}
              onPress={() => setSelected(option.id)}
              variant="single"
            />
          ))}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title="Complete Setup"
            onPress={handleContinue}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selected}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center',
    marginTop: -10,
    marginBottom: -10,
  },

  image: {
    width: 720,
    height: 120,
  },

  container: {
    flex: 1,
  },

  optionsContainer: {
    flex: 1,
  },

  buttonContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});

export default PrayerStyleStep;
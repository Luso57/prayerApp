import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Animated } from 'react-native';
import OnboardingLayout from '../components/OnboardingLayout';
import OptionCard from '../components/OptionCard';
import Button from '../../../Components/Button';
import { PrayerStruggleOption, prayerStruggleOptions } from '../../../types/onboarding';
import { spacing, typography, colors } from '../../../constants/theme';

interface PrayerStruggleStepProps {
  value: PrayerStruggleOption[];
  onNext: (value: PrayerStruggleOption[]) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

const PrayerStruggleStep: React.FC<PrayerStruggleStepProps> = ({
  value,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}) => {
  const [selected, setSelected] = React.useState<PrayerStruggleOption[]>(value);
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

  const toggleOption = (id: PrayerStruggleOption) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleContinue = () => {
    onNext(selected);
  };

  return (
    <OnboardingLayout
      title="What makes prayer difficult for you?"
      titleHighlight="difficult"
      subtitle="Pick any that resonates with you."
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerContent={
        <View style={styles.imageContainer}>
          <Animated.Image
            source={require("../../../../assets/flyingDove.png")}
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
        <Text style={styles.selectHint}>Select all that apply</Text>
        
        <ScrollView
          style={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {prayerStruggleOptions.map((option) => (
            <OptionCard
              key={option.id}
              emoji={option.emoji}
              title={option.title}
              subtitle={option.subtitle}
              selected={selected.includes(option.id)}
              onPress={() => toggleOption(option.id)}
              variant="multi"
            />
          ))}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            variant="primary"
            size="lg"
            fullWidth
            disabled={selected.length === 0}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: "center",
    marginTop: -10,
    marginBottom: -10,
  },

  image: {
    width: 720,
    height: 130,
  },

  container: {
    flex: 1,
    marginTop: -30,
  },

  selectHint: {
    fontSize: typography.size.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: spacing.md,
    top: 10,
  },

  optionsContainer: {
    flex: 1,
  },

  buttonContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});

export default PrayerStruggleStep;
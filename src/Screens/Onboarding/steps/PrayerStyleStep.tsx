import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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

  const handleContinue = () => {
    if (selected) {
      onNext(selected);
    }
  };

  return (
    <OnboardingLayout
      title="Choose your Prayer Style"
      titleHighlight="Prayer Style"
      subtitle="How would you like to integrate prayer into your daily routine?"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
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
import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import OnboardingLayout from '../components/OnboardingLayout';
import OptionCard from '../components/OptionCard';
import Button from '../../../Components/Button';
import { AgeOption, ageOptions } from '../../../types/onboarding';
import { spacing } from '../../../constants/theme';

interface AgeStepProps {
  value: AgeOption | null;
  onNext: (value: AgeOption) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

const AgeStep: React.FC<AgeStepProps> = ({
  value,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}) => {
  const [selected, setSelected] = React.useState<AgeOption | null>(value);

  const handleContinue = () => {
    if (selected) {
      onNext(selected);
    }
  };

  return (
    <OnboardingLayout
      title="How old are you?"
      subtitle="This helps me tailor your experience"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerContent={
        <View style={styles.imageContainer}>
          <Image
            source={require("../../../../assets/DoveHeadTilt.png")}
            style={styles.image}
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
          {ageOptions.map((option) => (
            <OptionCard
              key={option.id}
              title={option.title}
              selected={selected === option.id}
              onPress={() => setSelected(option.id)}
              variant="single"
            />
          ))}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title="Next"
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
    alignItems: "center",
    marginTop: 0,
    marginBottom: 0,
  },

  image: {
    width: 720,
    height: 120,
    opacity: 0.9,
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

export default AgeStep;

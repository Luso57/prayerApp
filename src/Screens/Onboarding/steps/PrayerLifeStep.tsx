import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import OnboardingLayout from '../components/OnboardingLayout';
import OptionCard from '../components/OptionCard';
import Button from '../../../Components/Button';
import { PrayerLifeOption, prayerLifeOptions } from '../../../types/onboarding';
import { spacing } from '../../../constants/theme';

interface PrayerLifeStepProps {
  value: PrayerLifeOption | null;
  onNext: (value: PrayerLifeOption) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

const PrayerLifeStep: React.FC<PrayerLifeStepProps> = ({
  value,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}) => {
  const [selected, setSelected] = React.useState<PrayerLifeOption | null>(value);

  const handleContinue = () => {
    if (selected) {
      onNext(selected);
    }
  };

  return (
    <OnboardingLayout
      title="Where are you on your prayer journey?"
      titleHighlight="prayer journey"
      subtitle="There's no wrong answer here. "
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      headerContent={
        <View style={styles.imageContainer}>
          <Image
            source={require("../../../../assets/flyingDove.png")}
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
          {prayerLifeOptions.map((option) => (
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
            title="Continue"
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
    marginTop: -10,
    marginBottom: -10,
  },

  image: {
    width: 720,
    height: 100,
    opacity: 0.9,
  },

  container: {
    flex: 1,
    marginTop: -10,
  },

  optionsContainer: {
    flex: 1,
  },

  buttonContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});

export default PrayerLifeStep;
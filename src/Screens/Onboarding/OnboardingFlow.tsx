import React, { useState } from "react";
import {
  OnboardingData,
  AgeOption,
  PrayerLifeOption,
  PrayerStruggleOption,
  PrayerStyleOption,
  initialOnboardingData,
} from "../../types/onboarding";

// Import steps
import NameStep from "./steps/NameStep";
import AgeStep from "./steps/AgeStep";
import PrayerLifeStep from "./steps/PrayerLifeStep";
import PrayerStruggleStep from "./steps/PrayerStruggleStep";
import PrayerStyleStep from "./steps/PrayerStyleStep";

type OnboardingStep =
  | "name"
  | "age"
  | "prayerLife"
  | "prayerStruggle"
  | "prayerStyle";

const STEPS: OnboardingStep[] = [
  "name",
  "age",
  "prayerLife",
  "prayerStruggle",
  "prayerStyle",
];
const TOTAL_STEPS = STEPS.length;

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onBack: () => void; // Go back to welcome screen
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onBack,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialOnboardingData);

  const currentStep = STEPS[currentStepIndex];

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    } else {
      // First step - go back to welcome screen
      onBack();
    }
  };

  // Handle name submission
  const handleNameSubmit = (name: string) => {
    setData((prev) => ({ ...prev, name }));
    goToNextStep();
  };

  // Handle age selection
  const handleAgeSubmit = (age: AgeOption) => {
    setData((prev) => ({ ...prev, age }));
    goToNextStep();
  };

  // Handle prayer life selection
  const handlePrayerLifeSubmit = (prayerLife: PrayerLifeOption) => {
    setData((prev) => ({ ...prev, prayerLife }));
    goToNextStep();
  };

  // Handle prayer struggles selection
  const handlePrayerStruggleSubmit = (
    prayerStruggles: PrayerStruggleOption[],
  ) => {
    setData((prev) => ({ ...prev, prayerStruggles }));
    goToNextStep();
  };

  // Handle prayer style selection (final step)
  const handlePrayerStyleSubmit = (prayerStyle: PrayerStyleOption) => {
    const finalData = { ...data, prayerStyle };
    setData(finalData);
    onComplete(finalData);
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case "name":
        return (
          <NameStep
            value={data.name}
            onNext={handleNameSubmit}
            onBack={goToPreviousStep}
            currentStep={currentStepIndex + 1}
            totalSteps={TOTAL_STEPS}
          />
        );

      case "age":
        return (
          <AgeStep
            value={data.age}
            onNext={handleAgeSubmit}
            onBack={goToPreviousStep}
            currentStep={currentStepIndex + 1}
            totalSteps={TOTAL_STEPS}
          />
        );

      case "prayerLife":
        return (
          <PrayerLifeStep
            value={data.prayerLife}
            onNext={handlePrayerLifeSubmit}
            onBack={goToPreviousStep}
            currentStep={currentStepIndex + 1}
            totalSteps={TOTAL_STEPS}
          />
        );

      case "prayerStruggle":
        return (
          <PrayerStruggleStep
            value={data.prayerStruggles}
            onNext={handlePrayerStruggleSubmit}
            onBack={goToPreviousStep}
            currentStep={currentStepIndex + 1}
            totalSteps={TOTAL_STEPS}
          />
        );

      case "prayerStyle":
        return (
          <PrayerStyleStep
            value={data.prayerStyle}
            onNext={handlePrayerStyleSubmit}
            onBack={goToPreviousStep}
            currentStep={currentStepIndex + 1}
            totalSteps={TOTAL_STEPS}
          />
        );

      default:
        return null;
    }
  };

  return <>{renderStep()}</>;
};

export default OnboardingFlow;

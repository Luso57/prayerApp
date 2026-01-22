import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import OnboardingLayout from "../components/OnboardingLayout";
import Button from "../../../Components/Button";
import { colors, typography, spacing, borderRadius } from "../../../constants/theme";

interface NameStepProps {
  value: string;
  onNext: (name: string) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

const NameStep: React.FC<NameStepProps> = ({
  value,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}) => {
  const [name, setName] = useState(value);
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
    if (name.trim()) {
      onNext(name.trim());
    }
  };

  return (
    <OnboardingLayout
      title="What should we call you?"
      subtitle="We'd love to make this personal"
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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!name.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  image: {
    width: 720,
    height: 120,
  },

  container: {
    flex: 1,
    justifyContent: "space-between",
  },

  inputContainer: {
    marginTop: spacing.xs,
  },

  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: typography.size.lg,
    color: colors.background.cream,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  buttonContainer: {
    paddingBottom: spacing.xl,
  },
});

export default NameStep;

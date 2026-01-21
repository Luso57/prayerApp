import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import WelcomeScreen from './Screens/WelcomeScreen';
import OnboardingFlow from './Screens/Onboarding/OnboardingFlow';
import MainNavigator from './Screens/Main/MainNavigator';
import { OnboardingData } from './types/onboarding';

type AppScreen = 'welcome' | 'onboarding' | 'home';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [userData, setUserData] = useState<OnboardingData | null>(null);

  // DEV MODE: Set to true to skip straight to main app for development
  const DEV_SKIP_TO_HOME = false; // Change to true to skip onboarding

  // Handle "Get Started" from welcome screen
  const handleGetStarted = () => {
    if (DEV_SKIP_TO_HOME) {
      setCurrentScreen('home');
    } else {
      setCurrentScreen('onboarding');
    }
  };

  // Handle going back to welcome from onboarding
  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
  };

  // Handle onboarding completion
  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log('Onboarding complete!', data);
    setUserData(data);
    setCurrentScreen('home');
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onGetStarted={handleGetStarted} />;

      case 'onboarding':
        return (
          <OnboardingFlow
            onComplete={handleOnboardingComplete}
            onBack={handleBackToWelcome}
          />
        );

      case 'home':
        return <MainNavigator userName={userData?.name} />;

      default:
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
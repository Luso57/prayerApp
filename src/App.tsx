import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import WelcomeScreen from "./Screens/WelcomeScreen";
import OnboardingFlow from "./Screens/Onboarding/OnboardingFlow";
import PaywallScreen from "./Screens/PaywallScreen";
import MainNavigator from "./Screens/Main/MainNavigator";
import { OnboardingData } from "./types/onboarding";
import {
  SubscriptionProvider,
  useSubscription,
} from "./contexts/SubscriptionContext";
import { colors } from "./constants/theme";

type AppScreen = "loading" | "welcome" | "onboarding" | "paywall" | "home";

function AppContent() {
  const { isInitialized, isLoading, isPro } = useSubscription();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("loading");
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // DEV MODE: Set to true to skip straight to main app for development
  const DEV_SKIP_TO_HOME = false; // Change to true to skip onboarding

  // Determine initial screen based on subscription status
  useEffect(() => {
    if (!isInitialized) {
      setCurrentScreen("loading");
      return;
    }

    // If user already has Pro access, go directly to home
    if (isPro) {
      setCurrentScreen("home");
    } else if (currentScreen === "loading") {
      // First time loading - show welcome
      setCurrentScreen("welcome");
    }
  }, [isInitialized, isPro]);

  // Handle "Get Started" from welcome screen
  const handleGetStarted = () => {
    if (DEV_SKIP_TO_HOME) {
      setCurrentScreen("home");
    } else {
      setCurrentScreen("onboarding");
    }
  };

  // Handle going back to welcome from onboarding
  const handleBackToWelcome = () => {
    setCurrentScreen("welcome");
  };

  // Handle onboarding completion - now goes to paywall
  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log("Onboarding complete!", data);
    setUserData(data);
    setHasCompletedOnboarding(true);
    // After onboarding, show the paywall
    setCurrentScreen("paywall");
  };

  // Handle successful purchase
  const handlePurchaseComplete = () => {
    console.log("Purchase complete! Granting access to app.");
    setCurrentScreen("home");
  };

  // Loading screen
  if (currentScreen === "loading" || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <WelcomeScreen onGetStarted={handleGetStarted} />;

      case "onboarding":
        return (
          <OnboardingFlow
            onComplete={handleOnboardingComplete}
            onBack={handleBackToWelcome}
          />
        );

      case "paywall":
        return <PaywallScreen onPurchaseComplete={handlePurchaseComplete} />;

      case "home":
        return <MainNavigator userName={userData?.name} />;

      default:
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

export default function App() {
  return (
    <SubscriptionProvider>
      <AppContent />
    </SubscriptionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.cream,
  },
});

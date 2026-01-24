import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import WelcomeScreen from "./Screens/WelcomeScreen";
import OnboardingFlow from "./Screens/Onboarding/OnboardingFlow";
import PaywallScreen from "./Screens/PaywallScreen";
import MainNavigator from "./Screens/Main/MainNavigator";
import { OnboardingData } from "./types/onboarding";
import {
  SubscriptionProvider,
  useSubscription,
} from "./contexts/SubscriptionContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { colors } from "./constants/theme";
import {
  ensureNotificationPermission,
  addNotificationResponseListener,
  getInitialNotificationDeeplink,
} from "./Services/NotificationService";

type AppScreen = "loading" | "welcome" | "onboarding" | "paywall" | "home";

// Deep link prefix for the app
const DEEP_LINK_PREFIX = "prayerlock://";

function AppContent() {
  const { isInitialized, isLoading, isPro } = useSubscription();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("loading");
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [pendingDeepLink, setPendingDeepLink] = useState<string | null>(null);

  // DEV MODE: Set to true to skip straight to main app for development
  const DEV_SKIP_TO_HOME = false; // Change to true to skip onboarding

  // Handle deep link navigation
  const handleDeepLink = useCallback(
    (url: string) => {
      console.log("Deep link received:", url);

      if (url.startsWith(DEEP_LINK_PREFIX)) {
        const path = url.replace(DEEP_LINK_PREFIX, "");

        if (path === "pray" || path.startsWith("pray")) {
          // If user is already in home screen, navigate to pray tab
          if (currentScreen === "home") {
            // MainNavigator will handle showing the prayer screen
            // You can pass this via context or props
            console.log("Navigating to prayer screen");
            Alert.alert(
              "Time to Pray 🙏",
              "Complete your prayer to unlock your apps.",
              [{ text: "Let's Go", style: "default" }],
            );
          } else {
            // Store the deep link to handle after reaching home
            setPendingDeepLink(url);
          }
        }
      }
    },
    [currentScreen],
  );

  // Set up deep link listeners
  useEffect(() => {
    // Handle deep links when app is already open
    const linkingSubscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    // Handle notification taps
    const notificationSubscription = addNotificationResponseListener((url) => {
      handleDeepLink(url);
    });

    // Check for initial deep link (app opened via link)
    const checkInitialURL = async () => {
      // Check URL that opened the app
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }

      // Check notification that opened the app
      const notificationDeeplink = await getInitialNotificationDeeplink();
      if (notificationDeeplink) {
        handleDeepLink(notificationDeeplink);
      }
    };

    checkInitialURL();

    return () => {
      linkingSubscription.remove();
      notificationSubscription.remove();
    };
  }, [handleDeepLink]);

  // Handle pending deep link when reaching home screen
  useEffect(() => {
    if (currentScreen === "home" && pendingDeepLink) {
      handleDeepLink(pendingDeepLink);
      setPendingDeepLink(null);
    }
  }, [currentScreen, pendingDeepLink, handleDeepLink]);

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
    <SafeAreaProvider>
      <ThemeProvider>
        <SubscriptionProvider>
          <AppContent />
        </SubscriptionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
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

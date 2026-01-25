import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  Linking,
} from "react-native";
import { typography, spacing } from "../../constants/theme";
import EditProfileModal from "./components/EditProfileModal";
import ContactUsModal from "./components/ContactUsModal";
import ThemeModal from "./components/ThemeModal";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { useTheme, themes } from "../../contexts/ThemeContext";
import { LEGAL_URLS } from "../../constants/legal";

const SettingsScreen: React.FC = () => {
  const { theme, themeName } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showContactUs, setShowContactUs] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const bounceAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { isPro, presentCustomerCenter, restore } = useSubscription();

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bounceAnim, {
        toValue: 0,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleProfileSave = (name: string) => {
    // Name is saved in the modal, you can trigger any additional actions here
    console.log("Profile updated with name:", name);
  };

  const handleManageSubscription = async () => {
    await presentCustomerCenter();
  };

  const handleRestorePurchases = async () => {
    const success = await restore();
    if (success) {
      Alert.alert("Success", "Your purchases have been restored!");
    } else {
      Alert.alert(
        "No Purchases Found",
        "We couldn't find any previous purchases associated with your account.",
      );
    }
  };

  const openExternalUrl = async (url: string, title: string) => {
    if (!url || url.includes("yourdomain.com")) {
      Alert.alert(
        "Link not set",
        `Please add a valid ${title} URL in src/constants/legal.ts before release.`,
      );
      return;
    }

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("Unable to open link", "Please try again later.");
      return;
    }

    await Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your experience ⚙️</Text>
          <Animated.Image
            source={require("../../../assets/DoveHandOutLeft.png")}
            style={[
              styles.doveImage,
              {
                opacity: opacityAnim,
                transform: [{ translateY: bounceAnim }],
              },
            ]}
            resizeMode="contain"
          />
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.card}>
            <SettingsItem
              icon="👤"
              title="Edit Profile"
              onPress={() => setShowEditProfile(true)}
              styles={styles}
            />
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.card}>
            <SettingsItem
              icon="⭐"
              title="Manage Subscription"
              subtitle={isPro ? "PrayerFirst Pro Active" : "Not subscribed"}
              onPress={handleManageSubscription}
              styles={styles}
            />
            <SettingsItem
              icon="🔄"
              title="Restore Purchases"
              onPress={handleRestorePurchases}
              styles={styles}
            />
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.card}>
            <SettingsItem
              icon="🎨"
              title="Theme"
              subtitle={`${themes[themeName].emoji} ${themes[themeName].name}`}
              onPress={() => setShowThemeModal(true)}
              styles={styles}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <SettingsItem
              icon="💬"
              title="Contact Us"
              onPress={() => setShowContactUs(true)}
              styles={styles}
            />
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.card}>
            <SettingsItem
              icon="📄"
              title="Terms & Services"
              onPress={() => openExternalUrl(LEGAL_URLS.terms, "Terms")}
              styles={styles}
            />
            <SettingsItem
              icon="🔒"
              title="Privacy Policy"
              onPress={() =>
                openExternalUrl(LEGAL_URLS.privacy, "Privacy Policy")
              }
              styles={styles}
            />
          </View>
        </View>

        {/* Version */}
        <Text style={styles.version}>PrayerFirst v1.0.0</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSave={handleProfileSave}
      />

      {/* Contact Us Modal */}
      <ContactUsModal
        visible={showContactUs}
        onClose={() => setShowContactUs(false)}
      />

      {/* Theme Modal */}
      <ThemeModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />
    </SafeAreaView>
  );
};

// Settings Item Component
const SettingsItem: React.FC<{
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  styles: any;
}> = ({ icon, title, subtitle, onPress, styles }) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
    <Text style={styles.settingsIcon}>{icon}</Text>
    <View style={styles.settingsContent}>
      <Text style={styles.settingsTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
    </View>
    <Text style={styles.settingsArrow}>›</Text>
  </TouchableOpacity>
);

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.cream,
    },

    scrollView: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },

    header: {
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
    },

    doveImage: {
      position: "absolute",
      top: -5,
      right: -50,
      width: 180,
      height: 140,
    },

    title: {
      fontSize: typography.size["3xl"],
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
    },

    subtitle: {
      fontSize: typography.size.base,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },

    section: {
      marginBottom: spacing.lg,
    },

    sectionTitle: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.semibold,
      color: colors.text.secondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
      marginLeft: spacing.xs,
    },

    card: {
      backgroundColor: colors.ui.white,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    settingsItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.background.cream,
    },

    settingsIcon: {
      fontSize: 22,
      marginRight: spacing.md,
    },

    settingsContent: {
      flex: 1,
    },

    settingsTitle: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.medium,
      color: colors.text.primary,
    },

    settingsSubtitle: {
      fontSize: typography.size.sm,
      color: colors.primary.main,
      marginTop: 2,
    },

    settingsArrow: {
      fontSize: 22,
      color: colors.text.muted,
    },

    version: {
      fontSize: typography.size.sm,
      color: colors.text.muted,
      textAlign: "center",
      marginVertical: spacing.xl,
    },
  });

export default SettingsScreen;

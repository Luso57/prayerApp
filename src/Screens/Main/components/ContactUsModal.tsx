import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { typography, spacing, borderRadius } from "../../../constants/theme";
import { useTheme } from "../../../contexts/ThemeContext";

interface ContactUsModalProps {
  visible: boolean;
  onClose: () => void;
}

const ContactUsModal: React.FC<ContactUsModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const email = "shopveronco@gmail.com";

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${email}`);
  };

  if (!visible || !theme) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Contact Us</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.emoji}>💬</Text>
          <Text style={styles.message}>
            Have questions or feedback? We'd love to hear from you!
          </Text>
          <Text style={styles.label}>Reach out to us at:</Text>
          <TouchableOpacity
            onPress={handleEmailPress}
            style={styles.emailButton}
          >
            <Text style={styles.emailText}>{email}</Text>
          </TouchableOpacity>
        </View>

        {/* Close Button */}
        <TouchableOpacity style={styles.doneButton} onPress={onClose}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },

    modal: {
      backgroundColor: colors.background.cream,
      borderRadius: borderRadius.xl,
      width: "85%",
      maxWidth: 400,
      padding: spacing.lg,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.lg,
    },

    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background.cream,
      justifyContent: "center",
      alignItems: "center",
    },

    closeButtonText: {
      fontSize: 16,
      color: colors.text.secondary,
    },

    title: {
      fontSize: typography.size.xl,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
    },

    placeholder: {
      width: 32,
    },

    content: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },

    emoji: {
      fontSize: 48,
      marginBottom: spacing.md,
    },

    message: {
      fontSize: typography.size.base,
      color: colors.text.secondary,
      textAlign: "center",
      marginBottom: spacing.lg,
      lineHeight: 22,
    },

    label: {
      fontSize: typography.size.sm,
      color: colors.text.muted,
      marginBottom: spacing.sm,
    },

    emailButton: {
      backgroundColor: colors.primary.soft,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.lg,
    },

    emailText: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.semibold,
      color: colors.primary.main,
    },

    doneButton: {
      backgroundColor: colors.primary.main,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      alignItems: "center",
    },

    doneButtonText: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.semibold,
      color: colors.background.cream,
    },
  });

export default ContactUsModal;

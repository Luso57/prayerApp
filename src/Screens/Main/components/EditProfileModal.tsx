import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { typography, spacing, borderRadius } from "../../../constants/theme";
import { useTheme } from "../../../contexts/ThemeContext";

const USER_NAME_KEY = "@user_name";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");

  useEffect(() => {
    if (visible) {
      loadName();
    }
  }, [visible]);

  const loadName = async () => {
    try {
      const savedName = await AsyncStorage.getItem(USER_NAME_KEY);
      if (savedName) {
        setName(savedName);
        setOriginalName(savedName);
      }
    } catch (error) {
      console.error("Error loading name:", error);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter your name");
      return;
    }

    try {
      await AsyncStorage.setItem(USER_NAME_KEY, name.trim());
      onSave(name.trim());
      Alert.alert("Success", "Your profile has been updated!");
      onClose();
    } catch (error) {
      console.error("Error saving name:", error);
      Alert.alert("Error", "Failed to save your name. Please try again.");
    }
  };

  const hasChanges = name.trim() !== originalName;

  if (!visible || !theme) return null;

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Edit Profile</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={theme.text.muted}
              autoCapitalize="words"
              autoFocus
            />
            <Text style={styles.hint}>
              This is how we'll greet you in the app
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              !hasChanges && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasChanges}
          >
            <Text
              style={[
                styles.saveButtonText,
                !hasChanges && styles.saveButtonTextDisabled,
              ]}
            >
              Save Changes
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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

    keyboardView: {
      width: "100%",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
    },

    modal: {
      backgroundColor: colors.background.cream,
      borderRadius: borderRadius.xl,
      width: "100%",
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
      marginBottom: spacing.xl,
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
      marginBottom: spacing.xl,
    },

    label: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
    },

    input: {
      backgroundColor: colors.background.cream,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: typography.size.lg,
      color: colors.text.primary,
      borderWidth: 2,
      borderColor: "transparent",
    },

    hint: {
      fontSize: typography.size.xs,
      color: colors.text.muted,
      marginTop: spacing.sm,
    },

    saveButton: {
      backgroundColor: colors.primary.main,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      alignItems: "center",
    },

    saveButtonDisabled: {
      backgroundColor: colors.ui.border,
    },

    saveButtonText: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.semibold,
      color: colors.background.cream,
    },

    saveButtonTextDisabled: {
      color: colors.text.muted,
    },
  });

export default EditProfileModal;

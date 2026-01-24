import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typography, spacing } from "../constants/theme";
import { useTheme } from "../contexts/ThemeContext";
import JournalService, { MOODS, Mood } from "../Services/JournalService";

interface JournalEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  prayerCategory?: string;
  prefillText?: string;
}

const JournalEntryModal: React.FC<JournalEntryModalProps> = ({
  visible,
  onClose,
  onSave,
  prayerCategory,
  prefillText,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [content, setContent] = useState(prefillText || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedMood || !content.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const mood = MOODS.find((m) => m.id === selectedMood);
      await JournalService.saveEntry({
        mood: mood?.label || "",
        moodEmoji: mood?.emoji || "",
        content: content.trim(),
        prayerCategory,
      });

      // Reset state
      setSelectedMood(null);
      setContent("");
      onSave();
    } catch (error) {
      console.error("Error saving journal entry:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedMood(null);
    setContent("");
    onClose();
  };

  const isValid = selectedMood && content.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Entry</Text>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
              disabled={!isValid || isSaving}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  !isValid && styles.saveButtonTextDisabled,
                ]}
              >
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Date Display */}
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
              <Text style={styles.timeText}>
                {new Date().toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
            </View>

            {/* Mood Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How are you feeling?</Text>
              <View style={styles.moodGrid}>
                {MOODS.map((mood) => (
                  <TouchableOpacity
                    key={mood.id}
                    style={[
                      styles.moodButton,
                      selectedMood === mood.id && styles.moodButtonSelected,
                    ]}
                    onPress={() => setSelectedMood(mood.id)}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text
                      style={[
                        styles.moodLabel,
                        selectedMood === mood.id && styles.moodLabelSelected,
                      ]}
                    >
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Journal Entry Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What's on your heart?</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Write your thoughts, prayers, or reflections..."
                placeholderTextColor={theme.text.muted}
                multiline
                value={content}
                onChangeText={setContent}
                textAlignVertical="top"
              />
            </View>

            {/* Prayer Category Tag (if from prayer session) */}
            {prayerCategory && (
              <View style={styles.prayerTag}>
                <Text style={styles.prayerTagText}>
                  🙏 From prayer session: {prayerCategory}
                </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.cream,
    },

    keyboardView: {
      flex: 1,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.ui.border,
      backgroundColor: colors.ui.white,
    },

    closeButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },

    closeButtonText: {
      fontSize: typography.size.base,
      color: colors.text.secondary,
    },

    headerTitle: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
    },

    saveButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },

    saveButtonDisabled: {
      opacity: 0.5,
    },

    saveButtonText: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.semibold,
      color: colors.primary.main,
    },

    saveButtonTextDisabled: {
      color: colors.text.muted,
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xl * 2,
    },

    dateContainer: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },

    dateText: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
    },

    timeText: {
      fontSize: typography.size.sm,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },

    section: {
      marginBottom: spacing.xl,
    },

    sectionTitle: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },

    moodGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },

    moodButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.ui.white,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.ui.border,
    },

    moodButtonSelected: {
      backgroundColor: colors.primary.soft,
      borderColor: colors.primary.main,
    },

    moodEmoji: {
      fontSize: 18,
      marginRight: spacing.xs,
    },

    moodLabel: {
      fontSize: typography.size.sm,
      color: colors.text.secondary,
    },

    moodLabelSelected: {
      color: colors.primary.main,
      fontWeight: typography.weight.medium,
    },

    textInput: {
      backgroundColor: colors.ui.white,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.ui.border,
      padding: spacing.lg,
      fontSize: typography.size.base,
      color: colors.text.primary,
      minHeight: 200,
      lineHeight: 24,
    },

    prayerTag: {
      backgroundColor: colors.primary.soft,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 12,
      alignSelf: "flex-start",
    },

    prayerTagText: {
      fontSize: typography.size.sm,
      color: colors.primary.main,
      fontWeight: typography.weight.medium,
    },
  });

export default JournalEntryModal;

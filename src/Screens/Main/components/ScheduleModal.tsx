import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { typography, spacing } from "../../../constants/theme";
import { useTheme } from "../../../contexts/ThemeContext";

interface ScheduleModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ScheduleOption {
  id: string;
  label: string;
  time: string;
  icon: string;
  description: string;
}

interface CustomTime {
  id: string;
  time: Date;
  label: string;
}

const DEFAULT_SCHEDULES: ScheduleOption[] = [
  {
    id: "morning",
    label: "Morning",
    time: "8:00 AM",
    icon: "🌅",
    description: "Start your day with prayer",
  },
  {
    id: "midday",
    label: "Midday",
    time: "12:00 PM",
    icon: "☀️",
    description: "Pause and reflect at noon",
  },
  {
    id: "evening",
    label: "Evening",
    time: "6:00 PM",
    icon: "🌆",
    description: "Wind down with evening prayer",
  },
  {
    id: "night",
    label: "Night",
    time: "8:00 PM",
    icon: "🌙",
    description: "End your day in gratitude",
  },
];

const ScheduleModal: React.FC<ScheduleModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"preset" | "custom">("preset");
  const [customTimes, setCustomTimes] = useState<CustomTime[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState(new Date());

  const toggleSchedule = (id: string) => {
    setSelectedSchedules((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const addCustomTime = () => {
    const newTime: CustomTime = {
      id: Date.now().toString(),
      time: new Date(),
      label: "",
    };
    setCustomTimes((prev) => [...prev, newTime]);
    setEditingTimeId(newTime.id);
    setTempTime(new Date());
    setShowTimePicker(true);
  };

  const removeCustomTime = (id: string) => {
    setCustomTimes((prev) => prev.filter((t) => t.id !== id));
  };

  const updateCustomTimeLabel = (id: string, label: string) => {
    setCustomTimes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, label } : t)),
    );
  };

  const updateCustomTime = (id: string, time: Date) => {
    setCustomTimes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, time } : t)),
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (selectedDate && editingTimeId) {
      setTempTime(selectedDate);
      updateCustomTime(editingTimeId, selectedDate);
    }
  };

  const renderPresetView = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Prayer Schedule</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Choose when your apps should lock until you pray
      </Text>

      <ScrollView
        style={styles.scheduleList}
        showsVerticalScrollIndicator={false}
      >
        {DEFAULT_SCHEDULES.map((schedule) => {
          const isSelected = selectedSchedules.includes(schedule.id);

          return (
            <TouchableOpacity
              key={schedule.id}
              style={[
                styles.scheduleItem,
                isSelected && styles.scheduleItemSelected,
              ]}
              onPress={() => toggleSchedule(schedule.id)}
            >
              <View style={styles.scheduleIcon}>
                <Text style={styles.scheduleIconText}>{schedule.icon}</Text>
              </View>
              <View style={styles.scheduleInfo}>
                <View style={styles.scheduleLabelRow}>
                  <Text style={styles.scheduleLabel}>{schedule.label}</Text>
                  <Text style={styles.scheduleTime}>{schedule.time}</Text>
                </View>
                <Text style={styles.scheduleDescription}>
                  {schedule.description}
                </Text>
              </View>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Custom Schedule Option */}
        <TouchableOpacity
          style={styles.customScheduleCard}
          onPress={() => setViewMode("custom")}
        >
          <View style={styles.customIcon}>
            <Text style={styles.customIconText}>⚙️</Text>
          </View>
          <View style={styles.customInfo}>
            <Text style={styles.customLabel}>Custom Schedule</Text>
            <Text style={styles.customDescription}>
              Set your own prayer times
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            // TODO: Save schedule logic
            onClose();
          }}
        >
          <Text style={styles.saveButtonText}>Save Schedule</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderCustomView = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setViewMode("preset")}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Custom Schedule</Text>
      <Text style={styles.subtitle}>
        Add your preferred prayer times throughout the day
      </Text>

      <ScrollView
        style={styles.scheduleList}
        showsVerticalScrollIndicator={false}
      >
        {customTimes.map((customTime) => (
          <View key={customTime.id} style={styles.customTimeItem}>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => {
                setEditingTimeId(customTime.id);
                setTempTime(customTime.time);
                setShowTimePicker(true);
              }}
            >
              <Text style={styles.timeIcon}>🕐</Text>
              <Text style={styles.timeText}>{formatTime(customTime.time)}</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.labelInput}
              placeholder="Label (optional)"
              placeholderTextColor={theme.text.muted}
              value={customTime.label}
              onChangeText={(text) =>
                updateCustomTimeLabel(customTime.id, text)
              }
            />

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeCustomTime(customTime.id)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addTimeButton} onPress={addCustomTime}>
          <Text style={styles.addTimeIcon}>+</Text>
          <Text style={styles.addTimeText}>Add Prayer Time</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setViewMode("preset")}
        >
          <Text style={styles.cancelButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            // TODO: Save custom schedule logic
            onClose();
          }}
        >
          <Text style={styles.saveButtonText}>Save Custom Times</Text>
        </TouchableOpacity>
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimeChange}
          themeVariant="light"
        />
      )}
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalContent}
          activeOpacity={1}
          onPress={() => {}}
        >
          {viewMode === "preset" ? renderPresetView() : renderCustomView()}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.sm,
    },

    modalContent: {
      backgroundColor: colors.ui.white,
      borderRadius: 20,
      padding: spacing.md,
      width: "100%",
      maxWidth: 450,
      maxHeight: "100%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.xs,
    },

    title: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
    },

    closeButton: {
      fontSize: 18,
      color: colors.text.muted,
      padding: spacing.xs,
    },

    subtitle: {
      fontSize: typography.size.sm,
      color: colors.text.secondary,
      marginBottom: spacing.md,
      lineHeight: 18,
    },

    scheduleList: {
      flexGrow: 0,
      marginBottom: spacing.sm,
    },

    scheduleItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.sm,
      borderRadius: 12,
      marginBottom: spacing.xs,
      backgroundColor: colors.background.cream,
      borderWidth: 2,
      borderColor: "transparent",
    },

    scheduleItemSelected: {
      backgroundColor: colors.primary.soft,
      borderColor: colors.primary.main,
    },

    scheduleIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.ui.white,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.sm,
    },

    scheduleIconText: {
      fontSize: 18,
    },

    scheduleInfo: {
      flex: 1,
    },

    scheduleLabelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 2,
    },

    scheduleLabel: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
    },

    scheduleTime: {
      fontSize: typography.size.sm,
      fontWeight: typography.weight.semibold,
      color: colors.primary.main,
    },

    scheduleDescription: {
      fontSize: typography.size.xs,
      color: colors.text.secondary,
    },

    checkmark: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.primary.main,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: spacing.sm,
    },

    checkmarkText: {
      color: colors.ui.white,
      fontSize: 12,
      fontWeight: typography.weight.bold,
    },

    // Custom Schedule Card
    customScheduleCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.sm,
      borderRadius: 12,
      backgroundColor: colors.ui.white,
      borderWidth: 2,
      borderColor: colors.ui.border,
      borderStyle: "dashed",
      marginTop: spacing.xs,
    },

    customIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.background.cream,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.sm,
    },

    customIconText: {
      fontSize: 18,
    },

    customInfo: {
      flex: 1,
    },

    customLabel: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: 2,
    },

    customDescription: {
      fontSize: typography.size.xs,
      color: colors.text.secondary,
    },

    arrow: {
      fontSize: 22,
      color: colors.text.muted,
    },

    // Custom View Styles
    backButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },

    backButtonText: {
      fontSize: typography.size.lg,
      color: colors.primary.main,
      fontWeight: typography.weight.semibold,
    },

    customTimeItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background.cream,
      borderRadius: 12,
      padding: spacing.sm,
      marginBottom: spacing.xs,
      gap: spacing.sm,
    },

    timeButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.ui.white,
      borderRadius: 10,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      gap: spacing.xs,
    },

    timeIcon: {
      fontSize: 16,
    },

    timeText: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
    },

    labelInput: {
      flex: 1,
      backgroundColor: colors.ui.white,
      borderRadius: 10,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      fontSize: typography.size.sm,
      color: colors.text.primary,
    },

    removeButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.ui.white,
      justifyContent: "center",
      alignItems: "center",
    },

    removeButtonText: {
      fontSize: 16,
      color: colors.text.muted,
      fontWeight: typography.weight.bold,
    },

    addTimeButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary.soft,
      borderRadius: 12,
      paddingVertical: spacing.md,
      marginTop: spacing.sm,
      gap: spacing.xs,
    },

    addTimeIcon: {
      fontSize: 20,
      color: colors.primary.main,
      fontWeight: typography.weight.bold,
    },

    addTimeText: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.semibold,
      color: colors.primary.main,
    },

    // Footer Buttons
    footer: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.sm,
    },

    cancelButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: 12,
      backgroundColor: colors.background.cream,
      alignItems: "center",
    },

    cancelButtonText: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
    },

    saveButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: 12,
      backgroundColor: colors.primary.main,
      alignItems: "center",
    },

    saveButtonText: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.semibold,
      color: colors.ui.white,
    },
  });

export default ScheduleModal;

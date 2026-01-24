import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { typography, spacing } from "../../../constants/theme";
import { useTheme, themes, ThemeName } from "../../../contexts/ThemeContext";

interface ThemeModalProps {
  visible: boolean;
  onClose: () => void;
}

const ThemeModal: React.FC<ThemeModalProps> = ({ visible, onClose }) => {
  const { theme, themeName, setTheme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleSelectTheme = (name: ThemeName) => {
    setTheme(name);
    onClose();
  };

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
          <View style={styles.header}>
            <Text style={styles.title}>Choose Theme</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Select a color theme for your app</Text>

          <ScrollView
            style={styles.themeList}
            showsVerticalScrollIndicator={false}
          >
            {(Object.keys(themes) as ThemeName[]).map((name) => {
              const themeOption = themes[name];
              const isSelected = themeName === name;

              return (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.themeItem,
                    isSelected && styles.themeItemSelected,
                  ]}
                  onPress={() => handleSelectTheme(name)}
                >
                  <View style={styles.themePreview}>
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: themeOption.colors.primary.main },
                      ]}
                    />
                    <View
                      style={[
                        styles.colorDot,
                        {
                          backgroundColor: themeOption.colors.background.cream,
                        },
                        styles.colorDotOverlap,
                      ]}
                    />
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: themeOption.colors.text.primary },
                        styles.colorDotOverlap,
                      ]}
                    />
                  </View>
                  <View style={styles.themeInfo}>
                    <Text style={styles.themeName}>
                      {themeOption.emoji} {themeOption.name}
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
          </ScrollView>
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
      padding: spacing.lg,
    },

    modalContent: {
      backgroundColor: colors.ui.white,
      borderRadius: 20,
      padding: spacing.lg,
      width: "100%",
      maxWidth: 340,
      maxHeight: "70%",
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
      fontSize: typography.size.xl,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
    },

    closeButton: {
      fontSize: 20,
      color: colors.text.muted,
      padding: spacing.xs,
    },

    subtitle: {
      fontSize: typography.size.sm,
      color: colors.text.secondary,
      marginBottom: spacing.lg,
    },

    themeList: {
      flexGrow: 0,
    },

    themeItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      borderRadius: 12,
      marginBottom: spacing.sm,
      backgroundColor: colors.background.cream,
    },

    themeItemSelected: {
      backgroundColor: colors.primary.soft,
      borderWidth: 2,
      borderColor: colors.primary.main,
    },

    themePreview: {
      flexDirection: "row",
      marginRight: spacing.md,
    },

    colorDot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.ui.white,
    },

    colorDotOverlap: {
      marginLeft: -8,
    },

    themeInfo: {
      flex: 1,
    },

    themeName: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
    },

    checkmark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary.main,
      justifyContent: "center",
      alignItems: "center",
    },

    checkmarkText: {
      color: colors.ui.white,
      fontSize: 14,
      fontWeight: typography.weight.bold,
    },
  });

export default ThemeModal;

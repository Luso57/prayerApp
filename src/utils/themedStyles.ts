import { StyleSheet } from "react-native";
import { ThemeColors } from "../contexts/ThemeContext";
import { typography, spacing, borderRadius } from "../constants/theme";

// Re-export non-color theme values that don't change with themes
export { typography, spacing, borderRadius };

// Helper to create themed styles
export const createThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  styleCreator: (colors: ThemeColors) => T,
) => {
  return styleCreator;
};

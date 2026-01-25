import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const THEME_STORAGE_KEY = "@app_theme";

// Define available themes
export type ThemeName =
  | "default"
  | "ocean"
  | "forest"
  | "sunset"
  | "lavender"
  | "midnight";

export interface ThemeColors {
  primary: {
    main: string;
    light: string;
    soft: string;
  };
  background: {
    cream: string;
    warmWhite: string;
    peach: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  ui: {
    buttonDark: string;
    border: string;
    white: string;
    overlay: string;
    overlayLight: string;
  };
  accent: {
    green: string;
    greenDark: string;
  };
}

export const themes: Record<
  ThemeName,
  { name: string; emoji: string; colors: ThemeColors }
> = {
  default: {
    name: "Sunrise",
    emoji: "🌅",
    colors: {
      primary: {
        main: "#E8752C",
        light: "#F5944D",
        soft: "#FDEEE5",
      },
      background: {
        cream: "#FDF8F3",
        warmWhite: "#FAF5EF",
        peach: "#F5E6DB",
      },
      text: {
        primary: "#5C453A",
        secondary: "#8B6B5B",
        muted: "#B89A8A",
      },
      ui: {
        buttonDark: "#2D2A3E",
        border: "#D4C4B8",
        white: "#FFFFFF",
        overlay: "rgba(255, 255, 255, 0.2)",
        overlayLight: "rgba(255, 255, 255, 0.08)",
      },
      accent: {
        green: "#7A9E5C",
        greenDark: "#5C7A44",
      },
    },
  },
  ocean: {
    name: "Ocean",
    emoji: "🌊",
    colors: {
      primary: {
        main: "#2B7A9E",
        light: "#4A9BBF",
        soft: "#E5F2F7",
      },
      background: {
        cream: "#F3F8FA",
        warmWhite: "#EBF4F7",
        peach: "#DBE9EF",
      },
      text: {
        primary: "#1A3A4A",
        secondary: "#4A6B7A",
        muted: "#8AABB8",
      },
      ui: {
        buttonDark: "#1A3A4A",
        border: "#B8D4E0",
        white: "#FFFFFF",
        overlay: "rgba(255, 255, 255, 0.2)",
        overlayLight: "rgba(255, 255, 255, 0.08)",
      },
      accent: {
        green: "#5C9E7A",
        greenDark: "#447A5C",
      },
    },
  },
  forest: {
    name: "Forest",
    emoji: "🌲",
    colors: {
      primary: {
        main: "#4A7C59",
        light: "#6B9E7A",
        soft: "#E8F2EA",
      },
      background: {
        cream: "#F5F8F5",
        warmWhite: "#EFF5EF",
        peach: "#E0EBE0",
      },
      text: {
        primary: "#2A3D2E",
        secondary: "#4A6B4F",
        muted: "#8AAB8F",
      },
      ui: {
        buttonDark: "#2A3D2E",
        border: "#C4D8C8",
        white: "#FFFFFF",
        overlay: "rgba(255, 255, 255, 0.2)",
        overlayLight: "rgba(255, 255, 255, 0.08)",
      },
      accent: {
        green: "#7A9E5C",
        greenDark: "#5C7A44",
      },
    },
  },
  sunset: {
    name: "Sunset",
    emoji: "🌇",
    colors: {
      primary: {
        main: "#C44B6C",
        light: "#E06B8C",
        soft: "#FDEEF2",
      },
      background: {
        cream: "#FDF5F7",
        warmWhite: "#FAF0F2",
        peach: "#F5E0E5",
      },
      text: {
        primary: "#4A2A35",
        secondary: "#7A4A5B",
        muted: "#B88A9A",
      },
      ui: {
        buttonDark: "#4A2A35",
        border: "#E0C4CC",
        white: "#FFFFFF",
        overlay: "rgba(255, 255, 255, 0.2)",
        overlayLight: "rgba(255, 255, 255, 0.08)",
      },
      accent: {
        green: "#9E7A5C",
        greenDark: "#7A5C44",
      },
    },
  },
  lavender: {
    name: "Lavender",
    emoji: "💜",
    colors: {
      primary: {
        main: "#7B68A6",
        light: "#9B88C6",
        soft: "#F0ECF7",
      },
      background: {
        cream: "#F8F6FB",
        warmWhite: "#F3F0F8",
        peach: "#E8E0F0",
      },
      text: {
        primary: "#3A2A4A",
        secondary: "#5A4A7A",
        muted: "#9A8AB8",
      },
      ui: {
        buttonDark: "#3A2A4A",
        border: "#D4C8E0",
        white: "#FFFFFF",
        overlay: "rgba(255, 255, 255, 0.2)",
        overlayLight: "rgba(255, 255, 255, 0.08)",
      },
      accent: {
        green: "#7A9E8C",
        greenDark: "#5C7A6A",
      },
    },
  },
  midnight: {
    name: "Midnight",
    emoji: "🌙",
    colors: {
      primary: {
        main: "#5A6B9E",
        light: "#7A8BBE",
        soft: "#ECEEF5",
      },
      background: {
        cream: "#F5F6FA",
        warmWhite: "#F0F2F7",
        peach: "#E0E4EF",
      },
      text: {
        primary: "#2A2A4A",
        secondary: "#4A4A7A",
        muted: "#8A8AB8",
      },
      ui: {
        buttonDark: "#2A2A4A",
        border: "#C8CCE0",
        white: "#FFFFFF",
        overlay: "rgba(255, 255, 255, 0.2)",
        overlayLight: "rgba(255, 255, 255, 0.08)",
      },
      accent: {
        green: "#7A9E7A",
        greenDark: "#5C7A5C",
      },
    },
  },
};

interface ThemeContextType {
  themeName: ThemeName;
  theme: ThemeColors;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeName, setThemeName] = useState<ThemeName>("default");

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && themes[savedTheme as ThemeName]) {
        setThemeName(savedTheme as ThemeName);
      }

      // Sync current theme to native on app start
      if (Platform.OS === "ios") {
        try {
          const { saveThemeForShield } =
            await import("../Services/ScreenTimeService");
          await saveThemeForShield(savedTheme || "default");
        } catch (e) {
          console.log("Could not sync theme to native:", e);
        }
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const setTheme = async (name: ThemeName) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
      setThemeName(name);

      // Sync theme to native for Shield extension
      if (Platform.OS === "ios") {
        try {
          const { saveThemeForShield } =
            await import("../Services/ScreenTimeService");
          await saveThemeForShield(name);
        } catch (e) {
          console.log("Could not sync theme to native:", e);
        }
      }
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        theme: themes[themeName].colors,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

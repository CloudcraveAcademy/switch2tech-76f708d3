import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { useProfileData } from "@/hooks/useProfileData";

interface ThemeContextProps {
  accentColor: string;
  compactMode: boolean;
  setAccentColor: (color: string) => void;
  setCompactMode: (compact: boolean) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profileData, updateProfileData } = useProfileData();
  const [accentColor, setAccentColorState] = useState("blue");
  const [compactMode, setCompactModeState] = useState(false);

  // Load theme settings from profile
  useEffect(() => {
    if (profileData?.preferences?.themeSettings) {
      const { accentColor: savedAccentColor, compactMode: savedCompactMode } = profileData.preferences.themeSettings;
      if (savedAccentColor) setAccentColorState(savedAccentColor);
      if (typeof savedCompactMode === 'boolean') setCompactModeState(savedCompactMode);
    }
  }, [profileData]);

  // Apply accent color CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    
    const colorMap = {
      blue: { primary: "201 100% 36%", primaryGlow: "201 100% 50%" },
      green: { primary: "120 100% 30%", primaryGlow: "120 100% 40%" },
      purple: { primary: "280 100% 40%", primaryGlow: "280 100% 50%" },
      orange: { primary: "25 100% 50%", primaryGlow: "25 100% 60%" },
      red: { primary: "0 100% 50%", primaryGlow: "0 100% 60%" },
    };

    const colors = colorMap[accentColor as keyof typeof colorMap] || colorMap.blue;
    
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--accent", colors.primary);
    
    // Also update secondary and other related colors
    root.style.setProperty("--secondary", colors.primaryGlow);
  }, [accentColor]);

  // Apply compact mode
  useEffect(() => {
    const root = document.documentElement;
    if (compactMode) {
      root.classList.add("compact-mode");
    } else {
      root.classList.remove("compact-mode");
    }
  }, [compactMode]);

  const setAccentColor = async (color: string) => {
    setAccentColorState(color);
    
    // Save to profile
    const currentPrefs = profileData?.preferences || {};
    try {
      await updateProfileData({
        preferences: {
          ...currentPrefs,
          themeSettings: {
            ...currentPrefs.themeSettings,
            accentColor: color,
          }
        }
      });
    } catch (error) {
      console.error("Failed to save accent color:", error);
    }
  };

  const setCompactMode = async (compact: boolean) => {
    setCompactModeState(compact);
    
    // Save to profile
    const currentPrefs = profileData?.preferences || {};
    try {
      await updateProfileData({
        preferences: {
          ...currentPrefs,
          themeSettings: {
            ...currentPrefs.themeSettings,
            compactMode: compact,
          }
        }
      });
    } catch (error) {
      console.error("Failed to save compact mode:", error);
    }
  };

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeContext.Provider
        value={{
          accentColor,
          compactMode,
          setAccentColor,
          setCompactMode,
        }}
      >
        {children}
      </ThemeContext.Provider>
    </NextThemeProvider>
  );
};
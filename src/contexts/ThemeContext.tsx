import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  clearThemePreference: () => void; 
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  clearThemePreference: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (typeof window === 'undefined') return;

    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem("theme") as Theme;
    
    console.log("Saved theme from localStorage:", savedTheme); // Debug log

    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      setTheme(savedTheme);
    } else {
      // Determine default theme based on system preference and device
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // Customize your default logic here
      let defaultTheme: Theme;
      
      // Option 1: Always default to light (simplest)
      defaultTheme = "light";
      
      // Option 2: Use system preference
      // defaultTheme = prefersDark ? "dark" : "light";
      
      // Option 3: Your original logic
      // if (prefersDark) {
      //   defaultTheme = "dark";
      // } else {
      //   defaultTheme = isMobile ? "dark" : "light";
      // }
      
      console.log("Using default theme:", defaultTheme); // Debug log
      
      setTheme(defaultTheme);
      localStorage.setItem("theme", defaultTheme);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      const isDark = theme === "dark";
      document.documentElement.classList.toggle("dark", isDark);
      
      // Also update the theme-color meta tag if you have one
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark ? '#000000' : '#ffffff');
      }
    }
  }, [theme, isClient]);

  const toggleTheme = () => {
    if (typeof window === 'undefined') return;
    
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    console.log("Theme toggled to:", newTheme); // Debug log
  };

  // Helper function to clear theme preference (for debugging)
  const clearThemePreference = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem("theme");
    console.log("Theme preference cleared from localStorage");
    
    // Reset to default
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = "light"; // or your preferred default
    setTheme(defaultTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, clearThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
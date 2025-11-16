import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'balance' | 'dark';

interface ThemeColors {
  background: string;
  text: string;
  textSecondary: string;
  buttonBg: string;
  buttonText: string;
  buttonHover: string;
  border: string;
  cardBg: string;
  gradient: string;
  accentGold: string;
}

const themes: Record<ThemeMode, ThemeColors> = {
  light: {
    background: '#e4dac2',
    text: '#4e3016',
    textSecondary: '#7e6c52',
    buttonBg: 'linear-gradient(135deg, rgba(135,109,86,1) 0%, rgba(117,90,71,1) 100%)',
    buttonText: '#faecd2',
    buttonHover: 'linear-gradient(135deg, rgba(155,129,106,1) 0%, rgba(137,110,91,1) 100%)',
    border: '#816a4a',
    cardBg: '#fff8dc',
    gradient: 'linear-gradient(90deg, rgba(123,90,67,1) 0%, rgba(194,165,130,1) 50%, rgba(123,90,67,1) 100%)',
    accentGold: '#c7b795',
  },
  balance: {
    background: '#c5b8a3',
    text: '#3d2f1f',
    textSecondary: '#5e4f3f',
    buttonBg: 'linear-gradient(135deg, rgba(115,99,76,1) 0%, rgba(97,80,61,1) 100%)',
    buttonText: '#e8dfc8',
    buttonHover: 'linear-gradient(135deg, rgba(135,119,96,1) 0%, rgba(117,100,81,1) 100%)',
    border: '#6e5a3a',
    cardBg: '#e8dfc8',
    gradient: 'linear-gradient(90deg, rgba(103,80,57,1) 0%, rgba(164,145,120,1) 50%, rgba(103,80,57,1) 100%)',
    accentGold: '#b7a785',
  },
  dark: {
    background: '#2a2318',
    text: '#e8dfc8',
    textSecondary: '#b8a98f',
    buttonBg: 'linear-gradient(135deg, rgba(85,69,56,1) 0%, rgba(67,50,41,1) 100%)',
    buttonText: '#faecd2',
    buttonHover: 'linear-gradient(135deg, rgba(105,89,76,1) 0%, rgba(87,70,61,1) 100%)',
    border: '#5e4a2a',
    cardBg: '#3d3228',
    gradient: 'linear-gradient(90deg, rgba(73,60,47,1) 0%, rgba(114,95,70,1) 50%, rgba(73,60,47,1) 100%)',
    accentGold: '#a7977d',
  },
};

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('appTheme') as ThemeMode;
    return saved && ['light', 'balance', 'dark'].includes(saved) ? saved : 'light';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('appTheme', newTheme);
  };

  useEffect(() => {
    // Apply theme to document root for global styling
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--theme-background', themes[theme].background);
    document.documentElement.style.setProperty('--theme-text', themes[theme].text);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: themes[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


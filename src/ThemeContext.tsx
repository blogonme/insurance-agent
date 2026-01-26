import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemePreset = 'classic' | 'business' | 'heritage' | 'modern' | 'minimal';

export interface ThemeConfig {
  id: ThemePreset;
  name: string;
  primary: string;
  fontFamily: string;
  baseSize: string;
  description: string;
  fonts: string[];
  background: string; // 全局背景
  cardBg: string;     // 卡片背景
}

export const PRESETS: Record<ThemePreset, ThemeConfig> = {
  classic: {
    id: 'classic',
    name: '经典阳光',
    primary: '#f97316',
    fontFamily: '"Inter", sans-serif',
    baseSize: '16px',
    description: '热情、专业的橘色系，阳光保险经典本色。',
    fonts: ['Inter:wght@400;500;600;700;800'],
    background: 'radial-gradient(circle at 50% 50%, #1a1a1a, black)',
    cardBg: 'rgba(23, 23, 23, 0.4)'
  },
  business: {
    id: 'business',
    name: '商务深邃',
    primary: '#0066cc',
    fontFamily: '"Inter", sans-serif',
    baseSize: '16px',
    description: '信任、稳重、深邃的蓝色系，适合商务理财。',
    fonts: ['Inter:wght@400;500;600;700;800'],
    background: 'linear-gradient(135deg, #001f3f 0%, #000000 100%)',
    cardBg: 'rgba(0, 31, 63, 0.3)'
  },
  heritage: {
    id: 'heritage',
    name: '财富传承',
    primary: '#b45309',
    fontFamily: '"Playfair Display", serif',
    baseSize: '15px',
    description: '奢华、古典的棕金色调，彰显高端品质。',
    fonts: ['Playfair+Display:wght@400;500;600;700;800', 'Inter:wght@400;700'],
    background: 'linear-gradient(to bottom, #1a0f00, #000000)',
    cardBg: 'rgba(45, 27, 0, 0.4)'
  },
  modern: {
    id: 'modern',
    name: '现代极简',
    primary: '#8b5cf6',
    fontFamily: '"Satoshi", sans-serif',
    baseSize: '17px',
    description: '极具科技感与潮流气息的紫色调。',
    fonts: ['Satoshi:wght@400;500;700;900'],
    background: 'radial-gradient(circle at top right, #2e1065, #000000)',
    cardBg: 'rgba(46, 16, 101, 0.2)'
  },
  minimal: {
    id: 'minimal',
    name: '极客纯净',
    primary: '#ffffff',
    fontFamily: '"Geist", sans-serif',
    baseSize: '16px',
    description: '极致极简，去繁就简，纯粹黑白审美。',
    fonts: ['Geist:wght@400;500;600;700;800'],
    background: '#000000',
    cardBg: 'rgba(255, 255, 255, 0.03)'
  }
};

interface ThemeContextType {
  currentTheme: ThemeConfig;
  setTheme: (id: ThemePreset) => void;
  baseSize: number;
  setBaseSize: (size: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeId, setThemeId] = useState<ThemePreset>(() => {
    return (localStorage.getItem('theme_id') as ThemePreset) || 'classic';
  });
  
  const [fontSize, setFontSize] = useState<number>(() => {
    return parseInt(localStorage.getItem('theme_font_size') || '16');
  });

  const currentTheme = PRESETS[themeId];

  useEffect(() => {
    localStorage.setItem('theme_id', themeId);
    localStorage.setItem('theme_font_size', fontSize.toString());
    
    // Apply CSS Variables
    const root = document.documentElement;
    root.style.setProperty('--primary-color', currentTheme.primary);
    root.style.setProperty('--font-family', currentTheme.fontFamily);
    root.style.setProperty('--base-font-size', `${fontSize}px`);
    root.style.setProperty('--app-background', currentTheme.background);
    root.style.setProperty('--card-background', currentTheme.cardBg);
    
    // Dynamically load Google Fonts if needed
    // In a real app we might use a link tag or webfontloader
    const linkId = 'google-fonts-loader';
    let link = document.getElementById(linkId) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    
    const fontQuery = currentTheme.fonts.join('&family=');
    link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`;

  }, [themeId, fontSize, currentTheme]);

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      setTheme: setThemeId, 
      baseSize: fontSize, 
      setBaseSize: setFontSize 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

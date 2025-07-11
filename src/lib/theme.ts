/**
 * Theme utilities for accessing custom color palette
 * This file provides easy access to your custom theme colors
 */

export const themeColors = {
  light: {
    primary: '#3B82F6',      // Deep Blue
    secondary: '#8B5CF6',    // Purple
    background: '#FFFFFF',   // Pure White
    surface: '#F8FAFC',      // Light Blue-Gray
    textPrimary: '#1E293B',  // Dark Navy
    textSecondary: '#64748B', // Slate Gray
    border: '#E2E8F0',       // Light Border
    accent: '#F59E0B',       // Orange
    error: '#EF4444',        // Red
  },
  dark: {
    primary: '#60A5FA',      // Bright Blue
    secondary: '#A78BFA',    // Light Purple
    background: '#0F172A',   // Deep Navy
    surface: '#1E293B',      // Dark Slate
    textPrimary: '#FFFFFF',  // Pure White
    textSecondary: '#CBD5E1', // Light Slate
    border: '#334155',       // Dark Border
    accent: '#FBBF24',       // Amber
    error: '#DC2626',        // Red
  },
} as const

/**
 * Get theme-appropriate color value
 * @param colorName - The color name from your palette
 * @param theme - 'light' or 'dark'
 * @returns The hex color value
 */
export const getThemeColor = (
  colorName: keyof typeof themeColors.light,
  theme: 'light' | 'dark' = 'light'
): string => {
  return themeColors[theme][colorName]
}

/**
 * CSS classes for quick theme-aware styling
 * Use these in your components for consistent theming
 */
export const themeClasses = {
  // Backgrounds
  primaryBg: 'bg-primary text-primary-foreground',
  secondaryBg: 'bg-secondary text-secondary-foreground',
  surfaceBg: 'bg-card text-card-foreground',
  accentBg: 'bg-accent text-accent-foreground',
  
  // Text colors
  primaryText: 'text-foreground',
  secondaryText: 'text-muted-foreground',
  accentText: 'text-accent',
  errorText: 'text-destructive',
  
  // Borders
  border: 'border-border',
  primaryBorder: 'border-primary',
  secondaryBorder: 'border-secondary',
  
  // Interactive states
  hover: {
    primary: 'hover:bg-primary/90',
    secondary: 'hover:bg-secondary/90',
    accent: 'hover:bg-accent/90',
    muted: 'hover:bg-muted',
  },
  
  // Focus states
  focus: 'focus:ring-2 focus:ring-ring focus:ring-offset-2',
} as const

export default themeColors

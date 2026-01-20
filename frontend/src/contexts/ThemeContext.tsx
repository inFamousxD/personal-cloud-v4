import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    AppTheme,
    ThemeValues,
    defaultDarkTheme,
    presetThemes,
    createCustomTheme,
    generateCSSVariables,
    getThemeById,
    setNestedValue
} from '../theme/themes';

interface ThemeContextType {
    currentTheme: AppTheme;
    setTheme: (themeId: string) => void;
    setCustomTheme: (theme: AppTheme) => void;
    updateCustomThemeValue: (path: string[], value: string) => void;
    presetThemes: AppTheme[];
    customTheme: AppTheme;
    isLoading: boolean;
    saveThemePreference: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app-theme-preference';
const CUSTOM_THEME_STORAGE_KEY = 'app-custom-theme';

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState<AppTheme>(defaultDarkTheme);
    const [customTheme, setCustomThemeState] = useState<AppTheme>(createCustomTheme());
    const [isLoading, setIsLoading] = useState(true);

    // Inject CSS variables into the document
    const injectCSSVariables = useCallback((theme: AppTheme) => {
        const cssVariables = generateCSSVariables(theme);
        
        // Find or create the theme style element
        let styleEl = document.getElementById('theme-variables');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'theme-variables';
            document.head.appendChild(styleEl);
        }
        
        styleEl.textContent = `:root {\n    ${cssVariables}\n}`;
    }, []);

    // Load theme preference from backend or localStorage
    const loadThemePreference = useCallback(async () => {
        setIsLoading(true);
        
        try {
            // Try to load from backend first
            const user = localStorage.getItem('user');
            if (user) {
                const { token } = JSON.parse(user);
                const API_URL = import.meta.env.VITE_API_URL;
                
                try {
                    const response = await fetch(`${API_URL}/api/settings/theme`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        
                        if (data.customTheme) {
                            const loadedCustom: AppTheme = {
                                id: 'custom',
                                name: 'Custom',
                                isCustom: true,
                                values: data.customTheme
                            };
                            setCustomThemeState(loadedCustom);
                            
                            if (data.themeId === 'custom') {
                                setCurrentTheme(loadedCustom);
                                injectCSSVariables(loadedCustom);
                                setIsLoading(false);
                                return;
                            }
                        }
                        
                        if (data.themeId) {
                            const preset = getThemeById(data.themeId);
                            if (preset) {
                                setCurrentTheme(preset);
                                injectCSSVariables(preset);
                                setIsLoading(false);
                                return;
                            }
                        }
                    }
                } catch (error) {
                    console.warn('Failed to load theme from backend, falling back to localStorage');
                }
            }
            
            // Fallback to localStorage
            const storedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
            const storedCustomTheme = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
            
            if (storedCustomTheme) {
                try {
                    const parsed = JSON.parse(storedCustomTheme);
                    setCustomThemeState(parsed);
                    
                    if (storedThemeId === 'custom') {
                        setCurrentTheme(parsed);
                        injectCSSVariables(parsed);
                        setIsLoading(false);
                        return;
                    }
                } catch (e) {
                    console.error('Failed to parse custom theme from localStorage');
                }
            }
            
            if (storedThemeId && storedThemeId !== 'custom') {
                const preset = getThemeById(storedThemeId);
                if (preset) {
                    setCurrentTheme(preset);
                    injectCSSVariables(preset);
                    setIsLoading(false);
                    return;
                }
            }
            
            // Default theme
            injectCSSVariables(defaultDarkTheme);
        } finally {
            setIsLoading(false);
        }
    }, [injectCSSVariables]);

    // Save theme preference to backend
    const saveThemePreference = useCallback(async () => {
        const user = localStorage.getItem('user');
        if (!user) return;
        
        const { token } = JSON.parse(user);
        const API_URL = import.meta.env.VITE_API_URL;
        
        try {
            await fetch(`${API_URL}/api/settings/theme`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    themeId: currentTheme.id,
                    customTheme: customTheme.values
                })
            });
        } catch (error) {
            console.error('Failed to save theme to backend:', error);
        }
        
        // Also save to localStorage as backup
        localStorage.setItem(THEME_STORAGE_KEY, currentTheme.id);
        localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(customTheme));
    }, [currentTheme, customTheme]);

    // Set theme by ID
    const setTheme = useCallback((themeId: string) => {
        if (themeId === 'custom') {
            setCurrentTheme(customTheme);
            injectCSSVariables(customTheme);
        } else {
            const preset = getThemeById(themeId);
            if (preset) {
                setCurrentTheme(preset);
                injectCSSVariables(preset);
            }
        }
        
        localStorage.setItem(THEME_STORAGE_KEY, themeId);
    }, [customTheme, injectCSSVariables]);

    // Set entire custom theme
    const setCustomTheme = useCallback((theme: AppTheme) => {
        setCustomThemeState(theme);
        if (currentTheme.id === 'custom') {
            setCurrentTheme(theme);
            injectCSSVariables(theme);
        }
        localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(theme));
    }, [currentTheme.id, injectCSSVariables]);

    // Update single value in custom theme
    const updateCustomThemeValue = useCallback((path: string[], value: string) => {
        setCustomThemeState(prev => {
            const newValues = setNestedValue(prev.values, path, value) as ThemeValues;
            const updated: AppTheme = {
                ...prev,
                values: newValues
            };
            
            if (currentTheme.id === 'custom') {
                setCurrentTheme(updated);
                injectCSSVariables(updated);
            }
            
            localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, [currentTheme.id, injectCSSVariables]);

    // Load theme on mount
    useEffect(() => {
        loadThemePreference();
    }, [loadThemePreference]);

    return (
        <ThemeContext.Provider
            value={{
                currentTheme,
                setTheme,
                setCustomTheme,
                updateCustomThemeValue,
                presetThemes,
                customTheme,
                isLoading,
                saveThemePreference
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
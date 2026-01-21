// Theme value structure - matches the original darkTheme structure
export interface ThemeText {
    color: string;
    fontSize: string;
    fontWeightSemiBold: string;
}

export interface ThemeValues {
    backgroundDarker: string;
    backgroundDarkest: string;
    border: string;
    text: ThemeText;
    accent: string;
    accentDark: string;
    panelBorder: string;
    accentGreen: string;
    accentOrange: string;
}

export interface AppTheme {
    id: string;
    name: string;
    isCustom: boolean;
    values: ThemeValues;
}

// ============ THEME DETECTION UTILITIES ============

/**
 * Parse a color string to RGB values
 * Supports: #RGB, #RRGGBB, #RRGGBBAA, rgb(), rgba(), and named colors
 */
export const parseColorToRGB = (color: string): { r: number; g: number; b: number } | null => {
    // Handle hex colors
    if (color.startsWith('#')) {
        let hex = color.slice(1);
        
        // Handle shorthand #RGB
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        // Handle #RRGGBBAA (ignore alpha)
        if (hex.length === 8) {
            hex = hex.slice(0, 6);
        }
        
        if (hex.length === 6) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                return { r, g, b };
            }
        }
    }
    
    // Handle rgb() and rgba()
    const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1]),
            g: parseInt(rgbMatch[2]),
            b: parseInt(rgbMatch[3])
        };
    }
    
    // Handle common named colors (for fallback)
    const namedColors: Record<string, { r: number; g: number; b: number }> = {
        'white': { r: 255, g: 255, b: 255 },
        'black': { r: 0, g: 0, b: 0 },
        'azure': { r: 240, g: 255, b: 255 },
        'snow': { r: 255, g: 250, b: 250 },
        'ivory': { r: 255, g: 255, b: 240 },
    };
    
    const lowerColor = color.toLowerCase();
    if (namedColors[lowerColor]) {
        return namedColors[lowerColor];
    }
    
    return null;
};

/**
 * Calculate relative luminance using WCAG formula
 * Returns a value between 0 (black) and 1 (white)
 */
export const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Determine if a theme is light based on its background color
 * Uses the backgroundDarkest value as the primary indicator
 */
export const isLightTheme = (theme: AppTheme): boolean => {
    const rgb = parseColorToRGB(theme.values.backgroundDarkest);
    if (!rgb) {
        // Fallback: check if theme name contains 'light'
        return theme.name.toLowerCase().includes('light') || 
               theme.id.toLowerCase().includes('light') ||
               theme.id.toLowerCase().includes('latte') ||
               theme.id.toLowerCase().includes('paper');
    }
    
    const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
    // Threshold of 0.4 - anything brighter is considered "light"
    return luminance > 0.4;
};

/**
 * Get appropriate terminal theme based on app theme
 */
export const getTerminalTheme = (theme: AppTheme) => {
    const isLight = isLightTheme(theme);
    const accent = theme.values.accent;
    
    if (isLight) {
        return {
            background: '#fafafa',
            foreground: '#383a42',
            cursor: accent,
            cursorAccent: '#fafafa',
            selectionBackground: `${accent}30`,
            black: '#383a42',
            red: '#e45649',
            green: '#50a14f',
            yellow: '#c18401',
            blue: '#4078f2',
            magenta: '#a626a4',
            cyan: '#0184bc',
            white: '#fafafa',
            brightBlack: '#a0a1a7',
            brightRed: '#e06c75',
            brightGreen: '#98c379',
            brightYellow: '#e5c07b',
            brightBlue: '#61afef',
            brightMagenta: '#c678dd',
            brightCyan: '#56b6c2',
            brightWhite: '#ffffff',
        };
    }
    
    // Dark theme
    return {
        background: '#202020',
        foreground: '#e0e0e0',
        cursor: accent,
        cursorAccent: '#0d0d0d',
        selectionBackground: `${accent}40`,
        black: '#1a1a2e',
        red: '#e74c3c',
        green: '#2ecc71',
        yellow: '#f1c40f',
        blue: '#3498db',
        magenta: '#a855f7',
        cyan: '#00d9ff',
        white: '#ecf0f1',
        brightBlack: '#636e72',
        brightRed: '#ff6b6b',
        brightGreen: '#55efc4',
        brightYellow: '#ffeaa7',
        brightBlue: '#74b9ff',
        brightMagenta: '#d63384',
        brightCyan: '#81ecec',
        brightWhite: '#ffffff',
    };
};

// ============ DARK THEMES ============

// Default dark theme (original - keeping untouched)
export const defaultDarkTheme: AppTheme = {
    id: 'default-dark',
    name: 'Default Dark',
    isCustom: false,
    values: {
        backgroundDarker: '#191a1bff',
        backgroundDarkest: '#1E2123',
        border: '#434557',
        text: {
            color: 'azure',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#0b6aa8',
        accentDark: '#063554',
        panelBorder: '#434557',
        accentGreen: '#27AE60',
        accentOrange: '#B95A1A'
    }
};

// Nord theme - Arctic, north-bluish color palette
export const nordTheme: AppTheme = {
    id: 'nord',
    name: 'Nord',
    isCustom: false,
    values: {
        backgroundDarker: '#2e3440',
        backgroundDarkest: '#242933',
        border: '#3b4252',
        text: {
            color: '#eceff4',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#88c0d0',
        accentDark: '#5e81ac',
        panelBorder: '#4c566a',
        accentGreen: '#a3be8c',
        accentOrange: '#d08770'
    }
};

// One Dark Pro - Atom's iconic dark theme
export const oneDarkTheme: AppTheme = {
    id: 'one-dark',
    name: 'One Dark',
    isCustom: false,
    values: {
        backgroundDarker: '#282c34',
        backgroundDarkest: '#21252b',
        border: '#3e4451',
        text: {
            color: '#abb2bf',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#61afef',
        accentDark: '#528bce',
        panelBorder: '#4b5263',
        accentGreen: '#98c379',
        accentOrange: '#e5c07b'
    }
};

// VS Code Dark+ - Microsoft's default dark theme
export const vscodeDarkTheme: AppTheme = {
    id: 'vscode-dark',
    name: 'VS Code Dark',
    isCustom: false,
    values: {
        backgroundDarker: '#1e1e1e',
        backgroundDarkest: '#181818',
        border: '#3c3c3c',
        text: {
            color: '#d4d4d4',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#569cd6',
        accentDark: '#264f78',
        panelBorder: '#454545',
        accentGreen: '#6a9955',
        accentOrange: '#ce9178'
    }
};

// Tokyo Night - A clean visual studio code theme
export const tokyoNightTheme: AppTheme = {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    isCustom: false,
    values: {
        backgroundDarker: '#1a1b26',
        backgroundDarkest: '#16161e',
        border: '#292e42',
        text: {
            color: '#a9b1d6',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#7aa2f7',
        accentDark: '#3d59a1',
        panelBorder: '#33467c',
        accentGreen: '#9ece6a',
        accentOrange: '#ff9e64'
    }
};

// Catppuccin Mocha - Soothing pastel dark theme
export const catppuccinMochaTheme: AppTheme = {
    id: 'catppuccin-mocha',
    name: 'Catppuccin',
    isCustom: false,
    values: {
        backgroundDarker: '#1e1e2e',
        backgroundDarkest: '#181825',
        border: '#313244',
        text: {
            color: '#cdd6f4',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#cba6f7',
        accentDark: '#9399b2',
        panelBorder: '#45475a',
        accentGreen: '#a6e3a1',
        accentOrange: '#fab387'
    }
};

// GitHub Dark Dimmed - GitHub's softer dark theme
export const githubDarkDimmedTheme: AppTheme = {
    id: 'github-dark-dimmed',
    name: 'GitHub Dimmed',
    isCustom: false,
    values: {
        backgroundDarker: '#22272e',
        backgroundDarkest: '#1c2128',
        border: '#373e47',
        text: {
            color: '#adbac7',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#539bf5',
        accentDark: '#316dca',
        panelBorder: '#444c56',
        accentGreen: '#57ab5a',
        accentOrange: '#c69026'
    }
};

// Gruvbox Dark - Retro groove color scheme
export const gruvboxDarkTheme: AppTheme = {
    id: 'gruvbox-dark',
    name: 'Gruvbox',
    isCustom: false,
    values: {
        backgroundDarker: '#282828',
        backgroundDarkest: '#1d2021',
        border: '#3c3836',
        text: {
            color: '#ebdbb2',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#83a598',
        accentDark: '#458588',
        panelBorder: '#504945',
        accentGreen: '#b8bb26',
        accentOrange: '#fe8019'
    }
};

// Ayu Dark - Modern elegant dark theme
export const ayuDarkTheme: AppTheme = {
    id: 'ayu-dark',
    name: 'Ayu Dark',
    isCustom: false,
    values: {
        backgroundDarker: '#0d1017',
        backgroundDarkest: '#0a0e14',
        border: '#1d222c',
        text: {
            color: '#bfbdb6',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#39bae6',
        accentDark: '#59c2ff',
        panelBorder: '#2d3640',
        accentGreen: '#7fd962',
        accentOrange: '#ffb454'
    }
};

// Palenight - Material palenight theme
export const palenightTheme: AppTheme = {
    id: 'palenight',
    name: 'Palenight',
    isCustom: false,
    values: {
        backgroundDarker: '#292d3e',
        backgroundDarkest: '#1b1e2b',
        border: '#3a3f58',
        text: {
            color: '#a6accd',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#82aaff',
        accentDark: '#6182b8',
        panelBorder: '#4e5579',
        accentGreen: '#c3e88d',
        accentOrange: '#ffcb6b'
    }
};

// ============ LIGHT THEMES ============

// Light Default theme
export const lightDefaultTheme: AppTheme = {
    id: 'light-default',
    name: 'Light',
    isCustom: false,
    values: {
        backgroundDarker: '#f5f5f5',
        backgroundDarkest: '#ffffff',
        border: '#e0e0e0',
        text: {
            color: '#1a1a1a',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#0066cc',
        accentDark: '#004499',
        panelBorder: '#d0d0d0',
        accentGreen: '#28a745',
        accentOrange: '#e67e22'
    }
};

// Solarized Light theme
export const solarizedLightTheme: AppTheme = {
    id: 'solarized-light',
    name: 'Solarized Light',
    isCustom: false,
    values: {
        backgroundDarker: '#eee8d5',
        backgroundDarkest: '#fdf6e3',
        border: '#d3cbb7',
        text: {
            color: '#657b83',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#268bd2',
        accentDark: '#1a5a8a',
        panelBorder: '#c9c2a8',
        accentGreen: '#859900',
        accentOrange: '#cb4b16'
    }
};

// GitHub Light theme
export const githubLightTheme: AppTheme = {
    id: 'github-light',
    name: 'GitHub Light',
    isCustom: false,
    values: {
        backgroundDarker: '#f6f8fa',
        backgroundDarkest: '#ffffff',
        border: '#d0d7de',
        text: {
            color: '#1f2328',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#0969da',
        accentDark: '#0550ae',
        panelBorder: '#d8dee4',
        accentGreen: '#1a7f37',
        accentOrange: '#bc4c00'
    }
};

// Paper theme (warm light)
export const paperTheme: AppTheme = {
    id: 'paper',
    name: 'Paper',
    isCustom: false,
    values: {
        backgroundDarker: '#f4f1eb',
        backgroundDarkest: '#fffdf7',
        border: '#e0dcd3',
        text: {
            color: '#3d3833',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#8b6914',
        accentDark: '#5c4610',
        panelBorder: '#d4cfc5',
        accentGreen: '#4a7c23',
        accentOrange: '#b8651a'
    }
};

// Nord Light theme
export const nordLightTheme: AppTheme = {
    id: 'nord-light',
    name: 'Nord Light',
    isCustom: false,
    values: {
        backgroundDarker: '#e5e9f0',
        backgroundDarkest: '#eceff4',
        border: '#d8dee9',
        text: {
            color: '#2e3440',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#5e81ac',
        accentDark: '#4c6a91',
        panelBorder: '#c9d1e0',
        accentGreen: '#a3be8c',
        accentOrange: '#d08770'
    }
};

// One Light theme
export const oneLightTheme: AppTheme = {
    id: 'one-light',
    name: 'One Light',
    isCustom: false,
    values: {
        backgroundDarker: '#eaeaeb',
        backgroundDarkest: '#fafafa',
        border: '#dbdbdc',
        text: {
            color: '#383a42',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#4078f2',
        accentDark: '#2b5fc8',
        panelBorder: '#d0d0d1',
        accentGreen: '#50a14f',
        accentOrange: '#c18401'
    }
};

// Catppuccin Latte - Light version of Catppuccin
export const catppuccinLatteTheme: AppTheme = {
    id: 'catppuccin-latte',
    name: 'Latte',
    isCustom: false,
    values: {
        backgroundDarker: '#e6e9ef',
        backgroundDarkest: '#eff1f5',
        border: '#ccd0da',
        text: {
            color: '#4c4f69',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#8839ef',
        accentDark: '#7287fd',
        panelBorder: '#bcc0cc',
        accentGreen: '#40a02b',
        accentOrange: '#fe640b'
    }
};

// All preset themes
export const presetThemes: AppTheme[] = [
    // Dark themes
    defaultDarkTheme,
    nordTheme,
    oneDarkTheme,
    vscodeDarkTheme,
    tokyoNightTheme,
    catppuccinMochaTheme,
    githubDarkDimmedTheme,
    gruvboxDarkTheme,
    ayuDarkTheme,
    palenightTheme,
    // Light themes
    lightDefaultTheme,
    solarizedLightTheme,
    githubLightTheme,
    paperTheme,
    nordLightTheme,
    oneLightTheme,
    catppuccinLatteTheme
];

// Create a blank custom theme template
export const createCustomTheme = (basedOn: AppTheme = defaultDarkTheme): AppTheme => ({
    id: 'custom',
    name: 'Custom',
    isCustom: true,
    values: { ...basedOn.values, text: { ...basedOn.values.text } }
});

// Helper to get theme by ID
export const getThemeById = (id: string): AppTheme | undefined => {
    return presetThemes.find(t => t.id === id);
};

// Flatten theme values for CSS variable generation
export interface FlattenedThemeValues {
    [key: string]: string;
}

export const flattenThemeValues = (values: ThemeValues, prefix = ''): FlattenedThemeValues => {
    const result: FlattenedThemeValues = {};
    
    for (const [key, value] of Object.entries(values)) {
        const cssKey = prefix ? `${prefix}-${key}` : key;
        
        if (typeof value === 'object' && value !== null) {
            Object.assign(result, flattenThemeValues(value as any, cssKey));
        } else {
            result[cssKey] = value as string;
        }
    }
    
    return result;
};

// Generate CSS variables string from theme
export const generateCSSVariables = (theme: AppTheme): string => {
    const flattened = flattenThemeValues(theme.values);
    
    return Object.entries(flattened)
        .map(([key, value]) => `--theme-${key}: ${value};`)
        .join('\n    ');
};

// Theme field metadata for Settings UI
export interface ThemeFieldMeta {
    key: string;
    path: string[];
    label: string;
    type: 'color' | 'text';
    currentValue: string;
}

// Extract theme fields metadata for auto-generating settings UI
export const getThemeFieldsMeta = (values: ThemeValues, path: string[] = []): ThemeFieldMeta[] => {
    const fields: ThemeFieldMeta[] = [];
    
    for (const [key, value] of Object.entries(values)) {
        const currentPath = [...path, key];
        
        if (typeof value === 'object' && value !== null) {
            fields.push(...getThemeFieldsMeta(value as any, currentPath));
        } else {
            // Determine if it's a color field
            const isColor = typeof value === 'string' && (
                value.startsWith('#') ||
                value.startsWith('rgb') ||
                value.startsWith('hsl') ||
                /^[a-z]+$/i.test(value) // Named colors like 'azure'
            );
            
            // Create readable label from key
            const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
            
            const parentLabel = path.length > 0 
                ? path.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' → ') + ' → '
                : '';
            
            fields.push({
                key,
                path: currentPath,
                label: parentLabel + label,
                type: isColor ? 'color' : 'text',
                currentValue: value as string
            });
        }
    }
    
    return fields;
};

// Helper to set nested value
export const setNestedValue = (obj: any, path: string[], value: string): any => {
    const result = JSON.parse(JSON.stringify(obj)); // Deep clone
    let current = result;
    
    for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    return result;
};

// Helper to get nested value
export const getNestedValue = (obj: any, path: string[]): string => {
    let current = obj;
    for (const key of path) {
        current = current[key];
    }
    return current as string;
};
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

// Default dark theme (original)
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

// Midnight Blue theme
export const midnightBlueTheme: AppTheme = {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    isCustom: false,
    values: {
        backgroundDarker: '#0d1117',
        backgroundDarkest: '#010409',
        border: '#30363d',
        text: {
            color: '#c9d1d9',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#58a6ff',
        accentDark: '#1f6feb',
        panelBorder: '#30363d',
        accentGreen: '#3fb950',
        accentOrange: '#d29922'
    }
};

// Forest theme
export const forestTheme: AppTheme = {
    id: 'forest',
    name: 'Forest',
    isCustom: false,
    values: {
        backgroundDarker: '#1a1f1a',
        backgroundDarkest: '#141814',
        border: '#2d3d2d',
        text: {
            color: '#d4e4d4',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#4a9f4a',
        accentDark: '#2d6b2d',
        panelBorder: '#2d3d2d',
        accentGreen: '#5cb85c',
        accentOrange: '#c4a35a'
    }
};

// Monokai theme
export const monokaiTheme: AppTheme = {
    id: 'monokai',
    name: 'Monokai',
    isCustom: false,
    values: {
        backgroundDarker: '#272822',
        backgroundDarkest: '#1e1f1c',
        border: '#49483e',
        text: {
            color: '#f8f8f2',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#ae81ff',
        accentDark: '#7c5cc4',
        panelBorder: '#49483e',
        accentGreen: '#a6e22e',
        accentOrange: '#fd971f'
    }
};

// Dracula theme
export const draculaTheme: AppTheme = {
    id: 'dracula',
    name: 'Dracula',
    isCustom: false,
    values: {
        backgroundDarker: '#282a36',
        backgroundDarkest: '#21222c',
        border: '#44475a',
        text: {
            color: '#f8f8f2',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#bd93f9',
        accentDark: '#6272a4',
        panelBorder: '#44475a',
        accentGreen: '#50fa7b',
        accentOrange: '#ffb86c'
    }
};

// Solarized Dark theme
export const solarizedDarkTheme: AppTheme = {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    isCustom: false,
    values: {
        backgroundDarker: '#002b36',
        backgroundDarkest: '#001e26',
        border: '#073642',
        text: {
            color: '#839496',
            fontSize: '14px',
            fontWeightSemiBold: '600'
        },
        accent: '#268bd2',
        accentDark: '#073642',
        panelBorder: '#073642',
        accentGreen: '#859900',
        accentOrange: '#cb4b16'
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

// All preset themes
export const presetThemes: AppTheme[] = [
    // Dark themes
    defaultDarkTheme,
    midnightBlueTheme,
    forestTheme,
    monokaiTheme,
    draculaTheme,
    solarizedDarkTheme,
    // Light themes
    lightDefaultTheme,
    solarizedLightTheme,
    githubLightTheme,
    paperTheme,
    nordLightTheme
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
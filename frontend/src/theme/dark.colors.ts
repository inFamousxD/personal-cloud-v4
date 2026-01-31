// This file now exports CSS variable references instead of actual values.
// The actual values are injected at runtime by ThemeProvider.
// This allows theming without modifying any .styles.ts files.

export const darkTheme = {
    backgroundDarker: 'var(--theme-backgroundDarker)',
    backgroundDarkest: 'var(--theme-backgroundDarkest)',
    border: 'var(--theme-border)',
    text: {
        color: 'var(--theme-text-color)',
        fontSize: 'var(--theme-text-fontSize)',
        fontWeightSemiBold: 'var(--theme-text-fontWeightSemiBold)',
        accentAlt: 'var(--theme-text-accentAlt)'
    },
    accent: 'var(--theme-accent)',
    accentDark: 'var(--theme-accentDark)',
    panelBorder: 'var(--theme-panelBorder)',
    accentGreen: 'var(--theme-accentGreen)',
    accentOrange: 'var(--theme-accentOrange)'
};
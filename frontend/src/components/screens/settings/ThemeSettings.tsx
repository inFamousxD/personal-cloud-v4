import { useState, useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeFieldsMeta, createCustomTheme, AppTheme } from '../../../theme/themes';
import {
    SettingsSection,
    SectionTitle,
    ThemeSection,
    ThemeSelector,
    ThemeCard,
    ThemePreview,
    ThemeName,
    CustomThemeSection,
    CustomThemeHeader,
    CustomThemeTitle,
    CustomThemeActions,
    ThemeFieldsGrid,
    ThemeFieldRow,
    ThemeFieldLabel,
    ThemeFieldInput,
    ColorInputWrapper,
    SaveButton,
    ResetButton,
    CopyFromSelect,
    ExpandToggle
} from './ThemeSettings.styles';

const ThemeSettings = () => {
    const {
        currentTheme,
        setTheme,
        customTheme,
        updateCustomThemeValue,
        setCustomTheme,
        presetThemes,
        saveThemePreference
    } = useTheme();

    const [customExpanded, setCustomExpanded] = useState(currentTheme.id === 'custom');
    const [isSaving, setIsSaving] = useState(false);

    // Get all theme fields for the custom theme editor
    const themeFields = useMemo(() => {
        return getThemeFieldsMeta(customTheme.values);
    }, [customTheme.values]);

    const handleThemeSelect = (themeId: string) => {
        setTheme(themeId);
        if (themeId === 'custom') {
            setCustomExpanded(true);
        }
    };

    const handleCopyFrom = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sourceThemeId = e.target.value;
        if (!sourceThemeId) return;

        const sourceTheme = presetThemes.find(t => t.id === sourceThemeId);
        if (sourceTheme) {
            const newCustom: AppTheme = {
                ...customTheme,
                values: JSON.parse(JSON.stringify(sourceTheme.values))
            };
            setCustomTheme(newCustom);
        }
        e.target.value = '';
    };

    const handleResetCustom = () => {
        setCustomTheme(createCustomTheme());
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveThemePreference();
        } finally {
            setIsSaving(false);
        }
    };

    const handleFieldChange = (path: string[], value: string) => {
        updateCustomThemeValue(path, value);
    };

    // Convert named colors to hex for color picker
    const colorToHex = (color: string): string => {
        if (color.startsWith('#')) return color;
        
        // Create a temporary element to compute the color
        const tempEl = document.createElement('div');
        tempEl.style.color = color;
        document.body.appendChild(tempEl);
        const computedColor = getComputedStyle(tempEl).color;
        document.body.removeChild(tempEl);
        
        // Parse rgb(r, g, b) format
        const match = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const r = parseInt(match[1]).toString(16).padStart(2, '0');
            const g = parseInt(match[2]).toString(16).padStart(2, '0');
            const b = parseInt(match[3]).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        }
        
        return color;
    };

    return (
        <SettingsSection>
            <SectionTitle>
                <span className="material-symbols-outlined">palette</span>
                Theme
            </SectionTitle>

            <ThemeSection>
                <ThemeSelector>
                    {presetThemes.map(theme => (
                        <ThemeCard
                            key={theme.id}
                            $selected={currentTheme.id === theme.id}
                            $previewBg={theme.values.backgroundDarkest}
                            $previewAccent={theme.values.accent}
                            onClick={() => handleThemeSelect(theme.id)}
                        >
                            <ThemePreview
                                $bg={theme.values.backgroundDarkest}
                                $accent={theme.values.accent}
                                $text={theme.values.text.color}
                            />
                            <ThemeName>{theme.name}</ThemeName>
                        </ThemeCard>
                    ))}
                    
                    {/* Custom theme card */}
                    <ThemeCard
                        $selected={currentTheme.id === 'custom'}
                        $previewBg={customTheme.values.backgroundDarkest}
                        $previewAccent={customTheme.values.accent}
                        onClick={() => handleThemeSelect('custom')}
                    >
                        <ThemePreview
                            $bg={customTheme.values.backgroundDarkest}
                            $accent={customTheme.values.accent}
                            $text={customTheme.values.text.color}
                        />
                        <ThemeName>Custom</ThemeName>
                    </ThemeCard>
                </ThemeSelector>

                <CustomThemeSection>
                    <CustomThemeHeader>
                        <ExpandToggle
                            $expanded={customExpanded}
                            onClick={() => setCustomExpanded(!customExpanded)}
                        >
                            <span className="material-symbols-outlined">expand_more</span>
                            <CustomThemeTitle>
                                <span className="material-symbols-outlined">tune</span>
                                Customize Theme
                            </CustomThemeTitle>
                        </ExpandToggle>

                        <CustomThemeActions>
                            <CopyFromSelect onChange={handleCopyFrom} defaultValue="">
                                <option value="" disabled>Copy from...</option>
                                {presetThemes.map(theme => (
                                    <option key={theme.id} value={theme.id}>
                                        {theme.name}
                                    </option>
                                ))}
                            </CopyFromSelect>
                            <ResetButton onClick={handleResetCustom} title="Reset to defaults">
                                <span className="material-symbols-outlined">restart_alt</span>
                                Reset
                            </ResetButton>
                            <SaveButton onClick={handleSave} disabled={isSaving}>
                                <span className="material-symbols-outlined">save</span>
                                {isSaving ? 'Saving...' : 'Save'}
                            </SaveButton>
                        </CustomThemeActions>
                    </CustomThemeHeader>

                    {customExpanded && (
                        <ThemeFieldsGrid>
                            {themeFields.map(field => (
                                <ThemeFieldRow key={field.path.join('.')}>
                                    <ThemeFieldLabel title={field.label}>
                                        {field.label}
                                    </ThemeFieldLabel>
                                    
                                    {field.type === 'color' ? (
                                        <ColorInputWrapper>
                                            <ThemeFieldInput
                                                type="color"
                                                value={colorToHex(field.currentValue)}
                                                onChange={(e) => handleFieldChange(field.path, e.target.value)}
                                            />
                                            <ThemeFieldInput
                                                type="text"
                                                value={field.currentValue}
                                                onChange={(e) => handleFieldChange(field.path, e.target.value)}
                                                placeholder="#000000"
                                            />
                                        </ColorInputWrapper>
                                    ) : (
                                        <ThemeFieldInput
                                            type="text"
                                            value={field.currentValue}
                                            onChange={(e) => handleFieldChange(field.path, e.target.value)}
                                        />
                                    )}
                                </ThemeFieldRow>
                            ))}
                        </ThemeFieldsGrid>
                    )}
                </CustomThemeSection>
            </ThemeSection>
        </SettingsSection>
    );
};

export default ThemeSettings;
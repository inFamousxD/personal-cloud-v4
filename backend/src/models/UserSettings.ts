import { ObjectId } from 'mongodb';

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

export interface UserSettings {
    _id?: ObjectId;
    userId: string;
    themeId: string;
    customTheme?: ThemeValues;
    createdAt: Date;
    updatedAt: Date;
}

export interface UpdateThemeInput {
    themeId: string;
    customTheme?: ThemeValues;
}
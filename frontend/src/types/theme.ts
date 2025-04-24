export interface Theme {
    colors: Record<string, string>,
    fontSizes:  Record<string, string>,
}

export enum THEME_TYPE {
    LIGHT = "light",
    DARK = "dark",
}

export type Themes = Record<THEME_TYPE, Theme>

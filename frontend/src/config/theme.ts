import { Theme, Themes, THEME_TYPE } from "../types";

const themeString: THEME_TYPE = localStorage.getItem('App:theme') as THEME_TYPE || 'light';

const themeLight: Theme = {
  colors: {
    primary: "blue",
    secondary: "gray",
    primaryOff: "lightblue",
    secondaryOff: "lightgray",
  },
  fontSizes: {
    sm: "10px",
    md: "15px",
    lg: "20px",
    xl: "25px",
  }
}

const themes: Themes = {
  light: themeLight,
  dark: themeLight,
}

export default themes[themeString];
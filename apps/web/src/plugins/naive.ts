import type { GlobalThemeOverrides } from "naive-ui";

export const lightThemeOverrides: GlobalThemeOverrides = {
	common: {
		fontFamily: "Inter, Roboto, Outfit, system-ui, sans-serif",
		primaryColor: "#0b57d0",
		primaryColorHover: "#0842a0",
		primaryColorPressed: "#062e6f",
		primaryColorSuppl: "#0b57d0",
		infoColor: "#0b57d0",
		successColor: "#146c36",
		warningColor: "#b06000",
		errorColor: "#b3261e",
		borderRadius: "12px",
		borderRadiusSmall: "8px",
		bodyColor: "#f0f4f9",
		cardColor: "#ffffff",
	},
	Card: {
		borderRadius: "16px",
	},
	Button: {
		borderRadiusMedium: "9999px",
		borderRadiusSmall: "9999px",
		borderRadiusLarge: "9999px",
	},
	Input: {
		borderRadius: "9999px",
	},
	Select: {
		borderRadius: "9999px",
	},
};

export const darkThemeOverrides: GlobalThemeOverrides = {
	common: {
		fontFamily: "Inter, Roboto, Outfit, system-ui, sans-serif",
		primaryColor: "#a8c7fa",
		primaryColorHover: "#7cacf8",
		primaryColorPressed: "#4f90f5",
		primaryColorSuppl: "#a8c7fa",
		infoColor: "#a8c7fa",
		successColor: "#81c784",
		warningColor: "#ffd54f",
		errorColor: "#f2b8b5",
		borderRadius: "12px",
		borderRadiusSmall: "8px",
		bodyColor: "#0f0f11",
		cardColor: "#18181c",
	},
	Card: {
		borderRadius: "16px",
	},
	Button: {
		borderRadiusMedium: "9999px",
		borderRadiusSmall: "9999px",
		borderRadiusLarge: "9999px",
	},
	Input: {
		borderRadius: "9999px",
	},
	Select: {
		borderRadius: "9999px",
	},
};

export function syncThemeCssVariables(theme: "light" | "dark") {
	const root = document.documentElement;
	if (theme === "light") {
		root.style.setProperty("--v-theme-primary", "11, 87, 208");
		root.style.setProperty("--v-theme-on-primary", "255, 255, 255");
		root.style.setProperty("--v-theme-secondary", "0, 99, 155");
		root.style.setProperty("--v-theme-surface", "255, 255, 255");
		root.style.setProperty("--v-theme-surface-variant", "225, 226, 233");
		root.style.setProperty("--v-theme-background", "240, 244, 249");
		root.style.setProperty("--v-theme-on-surface", "31, 31, 31");
		root.style.setProperty("--v-theme-error", "179, 38, 30");
	} else {
		root.style.setProperty("--v-theme-primary", "168, 199, 250");
		root.style.setProperty("--v-theme-on-primary", "6, 46, 111");
		root.style.setProperty("--v-theme-secondary", "127, 207, 255");
		root.style.setProperty("--v-theme-surface", "24, 24, 28");
		root.style.setProperty("--v-theme-surface-variant", "68, 71, 70");
		root.style.setProperty("--v-theme-background", "15, 15, 17");
		root.style.setProperty("--v-theme-on-surface", "227, 227, 227");
		root.style.setProperty("--v-theme-error", "242, 184, 181");
	}
}

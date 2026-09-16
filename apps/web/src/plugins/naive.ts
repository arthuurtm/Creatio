import type { GlobalThemeOverrides } from "naive-ui";

// Curvas espaciais de alta performance (Apple VisionOS / Raycast / Linear style)
const SPATIAL_EASING_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const SPATIAL_EASING_IN_OUT = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const SPATIAL_EASING_IN = "cubic-bezier(0.4, 0, 0.7, 1)";

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
		cubicBezierEaseOut: SPATIAL_EASING_OUT,
		cubicBezierEaseInOut: SPATIAL_EASING_IN_OUT,
		cubicBezierEaseIn: SPATIAL_EASING_IN,
		boxShadow1: "0 2px 8px -2px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.05)",
		boxShadow2: "0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.06)",
		boxShadow3: "0 20px 45px -10px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.08)",
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
		cubicBezierEaseOut: SPATIAL_EASING_OUT,
		cubicBezierEaseInOut: SPATIAL_EASING_IN_OUT,
		cubicBezierEaseIn: SPATIAL_EASING_IN,
		boxShadow1: "0 2px 8px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)",
		boxShadow2: "0 8px 24px -6px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.08)",
		boxShadow3: "0 24px 48px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
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


import type { GlobalThemeOverrides } from "naive-ui";

// -----------------------------------------------------------------------------
// Shared design tokens
// -----------------------------------------------------------------------------

const sharedTheme = {
	// Typography
	fontFamily: "Inter, Roboto, Outfit, system-ui, sans-serif",
	fontFamilyMono: "JetBrains Mono, Consolas, monospace",

	fontWeight: "400",
	fontWeightStrong: "600",

	fontSize: "14px",
	fontSizeMini: "12px",
	fontSizeTiny: "12px",
	fontSizeSmall: "13px",
	fontSizeMedium: "14px",
	fontSizeLarge: "15px",
	fontSizeHuge: "16px",

	lineHeight: "1.55",

	// Dimensions
	borderRadius: "12px",
	borderRadiusSmall: "8px",

	heightMini: "20px",
	heightTiny: "24px",
	heightSmall: "32px",
	heightMedium: "38px",
	heightLarge: "44px",
	heightHuge: "48px",

	// Animations
	cubicBezierEaseOut: "cubic-bezier(0.16, 1, 0.3, 1)",
	cubicBezierEaseInOut: "cubic-bezier(0.2, 0.8, 0.2, 1)",
	cubicBezierEaseIn: "cubic-bezier(0.4, 0, 0.7, 1)",

	// Scrollbar
	scrollbarWidth: "6px",
	scrollbarHeight: "6px",
	scrollbarBorderRadius: "999px",

	// Components
	components: {
		Card: {
			borderRadius: "16px",
			borderColor: "transparent",
		},

		Button: {
			borderRadiusTiny: "9999px",
			borderRadiusSmall: "9999px",
			borderRadiusMedium: "9999px",
			borderRadiusLarge: "9999px",

			border: "none",
			borderHover: "none",
			borderPressed: "none",
			borderFocus: "none",
		},

		Input: {
			border: "none",
			borderHover: "none",
			borderFocus: "none",
			borderDisabled: "none",

			borderWarning: "none",
			borderHoverWarning: "none",
			borderFocusWarning: "none",

			borderError: "none",
			borderHoverError: "none",
			borderFocusError: "none",
		},

		Select: {
			InternalSelection: {
				border: "none",
				borderHover: "none",
				borderActive: "none",
				borderFocus: "none",

				boxShadowHover: "none",
			},

			InternalSelectMenu: {
				borderRadius: "12px",
			},
		},
	},
};

// -----------------------------------------------------------------------------
// Light theme
// -----------------------------------------------------------------------------

export const lightThemeOverrides: GlobalThemeOverrides = {
	common: {
		...sharedTheme,

		// Base
		baseColor: "#ffffff",
		bodyColor: "#f4f6fa",

		// Primary
		primaryColor: "#0b57d0",
		primaryColorHover: "#1765c1",
		primaryColorPressed: "#0842a0",
		primaryColorSuppl: "#3478d4",

		// Semantic colors
		infoColor: "#3478d4",
		infoColorHover: "#2868c4",
		infoColorPressed: "#1f56a8",
		infoColorSuppl: "#5b91db",

		successColor: "#218653",
		successColorHover: "#1c7448",
		successColorPressed: "#145c39",
		successColorSuppl: "#3b9b6c",

		warningColor: "#a9650b",
		warningColorHover: "#925607",
		warningColorPressed: "#754506",
		warningColorSuppl: "#c18432",

		errorColor: "#ba3b35",
		errorColorHover: "#a62f2a",
		errorColorPressed: "#852521",
		errorColorSuppl: "#d15a53",

		// Typography
		textColorBase: "#172033",
		textColor1: "#1d2939",
		textColor2: "#344054",
		textColor3: "#667085",
		textColorDisabled: "#a0a8b5",

		placeholderColor: "#98a2b3",
		placeholderColorDisabled: "#c5cbd4",

		// Icons
		iconColor: "#8491a3",
		iconColorHover: "#526176",
		iconColorPressed: "#344054",
		iconColorDisabled: "#c5cbd4",

		// Opacity
		opacity1: "0.82",
		opacity2: "0.72",
		opacity3: "0.38",
		opacity4: "0.24",
		opacity5: "0.18",
		opacityDisabled: "0.5",

		// Borders and dividers
		borderColor: "transparent",
		dividerColor: "transparent",

		// Close button
		closeIconColor: "#8491a3",
		closeIconColorHover: "#526176",
		closeIconColorPressed: "#344054",
		closeColorHover: "rgba(15, 23, 42, 0.06)",
		closeColorPressed: "rgba(15, 23, 42, 0.10)",

		// Clear button
		clearColor: "#98a2b3",
		clearColorHover: "#526176",
		clearColorPressed: "#344054",

		// Scrollbar
		scrollbarColor: "rgba(71, 84, 103, 0.20)",
		scrollbarColorHover: "rgba(71, 84, 103, 0.35)",

		// Progress and rails
		progressRailColor: "#e9edf4",
		railColor: "#dce3ed",

		// Surfaces
		cardColor: "#ffffff",
		popoverColor: "#ffffff",
		modalColor: "#ffffff",

		tableColor: "#ffffff",
		tableHeaderColor: "#f8f9fc",
		tableColorHover: "rgba(11, 87, 208, 0.035)",
		tableColorStriped: "rgba(15, 23, 42, 0.018)",

		tabColor: "#f0f3f8",
		actionColor: "#f8f9fc",
		hoverColor: "#f1f4f9",
		pressedColor: "#e9eef6",

		inputColor: "#ffffff",
		inputColorDisabled: "#f3f5f8",

		codeColor: "#f3f5f9",
		tagColor: "#edf2fa",
		avatarColor: "#e6ecf5",

		// Inverted surfaces
		invertedColor: "#182230",

		// Secondary button
		buttonColor2: "#f1f4f9",
		buttonColor2Hover: "#e8edf5",
		buttonColor2Pressed: "#dce4ef",

		// Shadows
		boxShadow1:
			"0 1px 2px rgba(16, 24, 40, 0.04), 0 4px 12px rgba(16, 24, 40, 0.035)",

		boxShadow2:
			"0 8px 24px rgba(16, 24, 40, 0.07), 0 2px 6px rgba(16, 24, 40, 0.035)",

		boxShadow3:
			"0 20px 48px rgba(16, 24, 40, 0.10), 0 4px 12px rgba(16, 24, 40, 0.04)",
	},

	// Components
	Card: {
		...sharedTheme.components.Card,
		boxShadow:
			"0 1px 3px rgba(16, 24, 40, 0.035), 0 4px 12px rgba(16, 24, 40, 0.025)",
	},

	Button: {
		...sharedTheme.components.Button,
	},

	Input: {
		...sharedTheme.components.Input,

		borderRadius: "12px",

		boxShadowFocus: "0 0 0 3px rgba(11, 87, 208, 0.12)",
		boxShadowFocusWarning: "0 0 0 3px rgba(169, 101, 11, 0.12)",
		boxShadowFocusError: "0 0 0 3px rgba(186, 59, 53, 0.12)",
	},

	Select: {
		menuBoxShadow:
			"0 8px 24px rgba(16, 24, 40, 0.08), 0 2px 6px rgba(16, 24, 40, 0.04)",

		peers: {
			InternalSelection: {
				...sharedTheme.components.Select.InternalSelection,

				borderRadius: "12px",

				boxShadowFocus: "0 0 0 3px rgba(11, 87, 208, 0.12)",
				boxShadowActive: "0 0 0 3px rgba(11, 87, 208, 0.12)",
			},

			InternalSelectMenu: {
				...sharedTheme.components.Select.InternalSelectMenu,
			},
		},
	},
};

// -----------------------------------------------------------------------------
// AMOLED Dark theme
// -----------------------------------------------------------------------------

export const darkThemeOverrides: GlobalThemeOverrides = {
	common: {
		...sharedTheme,

		// Base
		baseColor: "#000000",
		bodyColor: "#000000",

		// Primary
		primaryColor: "#a8c7fa",
		primaryColorHover: "#c1d6fa",
		primaryColorPressed: "#7faaf0",
		primaryColorSuppl: "#c1d6fa",

		// Semantic colors
		infoColor: "#a8c7fa",
		infoColorHover: "#c1d6fa",
		infoColorPressed: "#7faaf0",
		infoColorSuppl: "#c1d6fa",

		successColor: "#8bc9a4",
		successColorHover: "#a2d7b6",
		successColorPressed: "#68ad86",
		successColorSuppl: "#a2d7b6",

		warningColor: "#f0c674",
		warningColorHover: "#f6d492",
		warningColorPressed: "#d9ad53",
		warningColorSuppl: "#f6d492",

		errorColor: "#f0a19c",
		errorColorHover: "#f5b9b4",
		errorColorPressed: "#d9827c",
		errorColorSuppl: "#f5b9b4",

		// Typography
		textColorBase: "#f7f9fc",
		textColor1: "#edf2f9",
		textColor2: "#c4ccd8",
		textColor3: "#8d98a8",
		textColorDisabled: "#687384",

		placeholderColor: "#778395",
		placeholderColorDisabled: "#4e5969",

		// Icons
		iconColor: "#8995a7",
		iconColorHover: "#c4ccd8",
		iconColorPressed: "#edf2f9",
		iconColorDisabled: "#4e5969",

		// Opacity
		opacity1: "0.82",
		opacity2: "0.72",
		opacity3: "0.38",
		opacity4: "0.24",
		opacity5: "0.18",
		opacityDisabled: "0.5",

		// Borders and dividers
		borderColor: "transparent",
		dividerColor: "transparent",

		// Close button
		closeIconColor: "#8995a7",
		closeIconColorHover: "#c4ccd8",
		closeIconColorPressed: "#edf2f9",
		closeColorHover: "rgba(255, 255, 255, 0.07)",
		closeColorPressed: "rgba(255, 255, 255, 0.12)",

		// Clear button
		clearColor: "#778395",
		clearColorHover: "#c4ccd8",
		clearColorPressed: "#edf2f9",

		// Scrollbar
		scrollbarColor: "rgba(169, 183, 203, 0.20)",
		scrollbarColorHover: "rgba(169, 183, 203, 0.35)",

		// Progress and rails
		progressRailColor: "#1a1a1a",
		railColor: "#292929",

		// Surfaces
		cardColor: "#0a0a0a",
		popoverColor: "#111111",
		modalColor: "#0d0d0d",

		tableColor: "#0a0a0a",
		tableHeaderColor: "#111111",
		tableColorHover: "rgba(168, 199, 250, 0.055)",
		tableColorStriped: "rgba(168, 199, 250, 0.025)",

		tabColor: "#0a0a0a",
		actionColor: "#111111",
		hoverColor: "#1a1a1a",
		pressedColor: "#242424",

		inputColor: "#0d0d0d",
		inputColorDisabled: "#080808",

		codeColor: "#0d0d0d",
		tagColor: "#171717",
		avatarColor: "#222222",

		// Inverted surfaces
		invertedColor: "#f7f9fc",

		// Secondary button
		buttonColor2: "#171717",
		buttonColor2Hover: "#222222",
		buttonColor2Pressed: "#2d2d2d",

		// Shadows
		boxShadow1:
			"0 8px 24px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.035)",

		boxShadow2:
			"0 16px 40px rgba(0, 0, 0, 0.70), 0 0 0 1px rgba(255, 255, 255, 0.045)",

		boxShadow3:
			"0 24px 64px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.055)",
	},

	// Components
	Card: {
		...sharedTheme.components.Card,
		boxShadow: "0 8px 24px rgba(0, 0, 0, 0.55)",
	},

	Button: {
		...sharedTheme.components.Button,
	},

	Input: {
		...sharedTheme.components.Input,

		borderRadius: "9999px",

		boxShadowFocus: "0 0 0 3px rgba(168, 199, 250, 0.14)",
		boxShadowFocusWarning: "0 0 0 3px rgba(240, 198, 116, 0.14)",
		boxShadowFocusError: "0 0 0 3px rgba(240, 161, 156, 0.14)",
	},

	Select: {
		menuBoxShadow:
			"0 12px 32px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.04)",

		peers: {
			InternalSelection: {
				...sharedTheme.components.Select.InternalSelection,

				borderRadius: "12px",

				boxShadowFocus: "0 0 0 3px rgba(168, 199, 250, 0.14)",
				boxShadowActive: "0 0 0 3px rgba(168, 199, 250, 0.14)",
			},

			InternalSelectMenu: {
				...sharedTheme.components.Select.InternalSelectMenu,
			},
		},
	},
};

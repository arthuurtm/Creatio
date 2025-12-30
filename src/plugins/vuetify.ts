// plugins/vuetify.ts
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify, type ThemeDefinition } from "vuetify";
import { VBtn } from "vuetify/components";
import { aliases, md } from "vuetify/iconsets/md";
import colors from "vuetify/util/colors";

/* ======================================================
 * LIGHT THEME — Clean, moderno, SaaS premium
 * ====================================================== */
const lightTheme: ThemeDefinition = {
	dark: false,
	colors: {
		// Base
		background: "#F4F6FB", // Mais sofisticado que #F5F7FA
		surface: "#FFFFFF",
		"surface-variant": "#EEF1F7",

		// Brand
		primary: colors.indigo.base, // #3F51B5
		"primary-darken-1": colors.indigo.darken2,
		"primary-lighten-1": colors.indigo.lighten4,

		// Supporting
		secondary: colors.blueGrey.darken1, // Menos chamativo que teal
		"secondary-lighten-1": colors.blueGrey.lighten4,

		// Feedback
		success: colors.green.darken1,
		info: colors.blue.darken1,
		warning: colors.amber.darken2,
		error: colors.red.darken1,

		// Text
		"on-background": "#1F2937", // Gray 800 (excelente leitura)
		"on-surface": "#1F2937",
		"on-primary": "#FFFFFF",

		// Borders / Dividers
		outline: "#D0D5DD",
	},
};

/* ======================================================
 * DARK THEME — Confortável, elegante, real dark mode
 * ====================================================== */
const darkTheme: ThemeDefinition = {
	dark: true,
	colors: {
		// Base
		background: "#0F172A", // Azul carvão (menos agressivo)
		surface: "#111827",
		"surface-variant": "#1F2933",

		// Brand
		primary: colors.indigo.lighten2,
		"primary-darken-1": colors.indigo.lighten1,
		"primary-lighten-1": colors.indigo.lighten4,

		// Supporting
		secondary: colors.blueGrey.lighten2,

		// Feedback
		success: colors.green.lighten2,
		info: colors.blue.lighten2,
		warning: colors.amber.lighten2,
		error: colors.red.lighten2,

		// Text
		"on-background": "#E5E7EB", // Gray 200
		"on-surface": "#E5E7EB",
		"on-primary": "#0F172A",

		// Borders
		outline: "#334155",
	},
};

export default createVuetify({
	theme: {
		defaultTheme: "light",
		themes: {
			light: lightTheme,
			dark: darkTheme,
		},
	},

	icons: {
		defaultSet: "msr",
		aliases,
		sets: {
			// Configuração corrigida para TypeScript
			msr: {
				component: (props: any) => {
					return h(
						props.tag,
						{
							...props,
							class: ["material-symbols-rounded notranslate", props.class],
						},
						props.icon,
					);
				},
			},
			md, // Mantém o fallback
		},
	},

	/* ======================================================
	 * ALIASES — Sistema de botões consistente
	 * ====================================================== */
	aliases: {
		VBtnSecondary: VBtn,
		VBtnGhost: VBtn,
		VBtnDestructive: VBtn,
	},

	/* ======================================================
	 * DEFAULTS — UX polida e previsível
	 * ====================================================== */
	defaults: {
		global: {
			ripple: true,
		},

		/* ---------- Buttons ---------- */
		VBtn: {
			color: "primary",
			variant: "flat",
			rounded: "xl",
			height: 44,
			class: "text-none font-weight-semibold",
			elevation: 0,
		},

		VBtnSecondary: {
			color: "secondary",
			variant: "tonal",
			rounded: "xl",
			height: 44,
			class: "text-none font-weight-medium",
			elevation: 0,
		},

		VBtnGhost: {
			color: "primary",
			variant: "text",
			rounded: "xl",
			class: "text-none",
		},

		VBtnDestructive: {
			color: "error",
			variant: "flat",
			rounded: "xl",
			class: "text-none font-weight-semibold",
		},

		/* ---------- Cards ---------- */
		VCard: {
			rounded: "lg",
			elevation: 1, // Mais elegante que 2
			class: "pa-4",
		},

		/* ---------- Inputs ---------- */
		VTextField: {
			variant: "outlined",
			rounded: "pill", // Faz o border-radius: 30px (arredondado total)
			density: "comfortable", // Altura próxima de 48px (o seu era 45px)
			color: "primary", // Cor do foco (borda e texto)
			bgColor: "transparent", // Garante fundo transparente
		},

		VSelect: {
			variant: "outlined",
			rounded: "pill",
			density: "comfortable",
			color: "primary",
			menuIcon: "mdi-chevron-down", // O ícone da seta
		},

		VFileInput: {
			variant: "outlined",
			rounded: "pill",
			density: "comfortable",
			prependIcon: "", // Remove o clipe de papel padrão do lado de fora
			appendInnerIcon: "mdi-paperclip", // Coloca ícone dentro se quiser
		},

		VAutocomplete: {
			variant: "outlined",
			color: "primary",
			density: "comfortable",
			rounded: "lg",
			bgColor: "surface",
		},

		/* ---------- Toggles ---------- */
		VSwitch: {
			color: "primary",
			inset: true,
		},

		VCheckbox: {
			color: "primary",
		},
	},
});

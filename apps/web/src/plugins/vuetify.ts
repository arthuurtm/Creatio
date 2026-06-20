// plugins/vuetify.ts
import { h } from "vue";
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import "@/styles/index.scss";
import { createVuetify, type ThemeDefinition } from "vuetify";
import { md3 } from "vuetify/blueprints";
import { VBtn, VInput } from "vuetify/components";
import { aliases, md } from "vuetify/iconsets/md";
import colors from "vuetify/util/colors";

const lightGoogle: ThemeDefinition = {
	dark: false,
	colors: {
		primary: "#0b57d0",
		"primary-darken-1": "#0842a0",
		secondary: "#00639b",
		background: "#f0f4f9",
		surface: "#ffffff",
		"surface-container": "#e9eef6",
		"surface-variant": "#e1e2e9",
		error: "#b3261e",
		info: "#0b57d0",
		success: "#146c36",
		warning: "#b06000",
		"on-primary": "#ffffff",
		"on-secondary": "#ffffff",
		"on-background": "#1f1f1f",
		"on-surface": "#1f1f1f",
	},
};

const darkGoogle: ThemeDefinition = {
	dark: true,
	colors: {
		primary: "#a8c7fa",
		"primary-darken-1": "#7cacf8",
		secondary: "#7fcfff",
		background: "#0f0f11",
		surface: "#18181c",
		"surface-container": "#202125",
		"surface-variant": "#444746",
		error: "#f2b8b5",
		info: "#a8c7fa",
		success: "#81c784",
		warning: "#ffd54f",
		"on-primary": "#062e6f",
		"on-secondary": "#003554",
		"on-background": "#e3e3e3",
		"on-surface": "#e3e3e3",
	},
};

export default createVuetify({
	blueprint: md3,

	theme: {
		defaultTheme: "system",
		themes: {
      light: lightGoogle,
      dark: darkGoogle,
		},
	},

	icons: {
		defaultSet: "msr",
		aliases,
		sets: {
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
			md,
		},
	},

	aliases: {
		VBtnDestructive: VBtn,
	},

	defaults: {
		global: {
			rounded: "xl",
		},
		VBtn: {
			size: "large",
			rounded: "pill",
		},
		VCard: {
			rounded: "xl",
		},
		VDialog: {
			rounded: "xl",
		},
		VSheet: {
			rounded: "xl",
		},
		VTextField: {
			variant: "outlined",
			rounded: "pill",
		},
		VSelect: {
			variant: "outlined",
			rounded: "pill",
		},
		VAutocomplete: {
			variant: "outlined",
			rounded: "pill",
		},
		VTextarea: {
			variant: "outlined",
			rounded: "xl",
		},
		VList: {
			border: false,
		},
	},
});

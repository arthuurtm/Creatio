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

export default createVuetify({
	blueprint: md3,

	theme: {
		defaultTheme: "dark",
		// themes: {
		// 	light: lightTheme,
		// 	dark: darkTheme,
		// },

		// variations: {
		// 	colors: ["primary", "secondary"],
		// 	lighten: 2,
		// 	darken: 2,
		// },
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
		VTextField: {
			rounded: "pill",
			variant: "outlined",
			density: "comfortable",
		},
		VSelect: {
			rounded: "pill",
			variant: "outlined",
			density: "comfortable",
		},
		VAutocomplete: {
			rounded: "pill",
			variant: "outlined",
			density: "comfortable",
		},
		VTextarea: {
			rounded: "xl",
		},
	},
});

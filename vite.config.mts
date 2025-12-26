import { fileURLToPath, URL } from "node:url";
import Vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Fonts from "unplugin-fonts/vite";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import Layouts from "vite-plugin-vue-layouts-next";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineConfig({
	plugins: [
		Layouts(),
		AutoImport({
			imports: [
				"vue",
				{
					pinia: ["defineStore", "storeToRefs"],
				},
			],
			dts: "src/auto-imports.d.ts",
			eslintrc: {
				enabled: true,
			},
			vueTemplate: true,
		}),
		Components({
			dts: "src/components.d.ts",
		}),
		Vue({
			template: { transformAssetUrls },
		}),
		// https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
		Vuetify({
			autoImport: true,
			styles: {
				configFile: "src/styles/settings.scss",
			},
		}),
		Fonts({
			fontsource: {
				families: [
					{
						name: "Roboto",
						weights: [100, 300, 400, 500, 700, 900],
						styles: ["normal", "italic"],
					},
				],
			},
		}),
	],
	optimizeDeps: {
		exclude: ["vuetify", "vue-router"],
	},
	define: { "process.env": {} },
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("src", import.meta.url)),
		},
		extensions: [".ts", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
	},
	server: {
		allowedHosts: [],
		proxy: {
			"/api": {
				target: "http://localhost:3000",
				changeOrigin: true,
			},
			"/ws": {
				target: "http://localhost:3000",
				changeOrigin: true,
				ws: true,
			},
		},
	},
});

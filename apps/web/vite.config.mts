import { fileURLToPath, URL } from "node:url";
import Vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import Layouts from "vite-plugin-vue-layouts-next";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import svgLoader from 'vite-svg-loader'

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
			dts: "auto-imports.d.ts",
			eslintrc: {
				enabled: true,
			},
			vueTemplate: true,
		}),
		Components({
			dirs: ["src/components"],
			extensions: ["vue"],
			deep: true,
			dts: true,
		}),
		Vue({
			template: { transformAssetUrls },
		}),
		Vuetify({
			autoImport: true,
			styles: {
				configFile: "src/styles/index.scss",
			},
		}),
    svgLoader()
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

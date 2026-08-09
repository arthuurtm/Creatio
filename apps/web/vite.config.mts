import { fileURLToPath, URL } from "node:url";
import Vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import { defineConfig } from "vite";
import Layouts from "vite-plugin-vue-layouts-next";
import svgLoader from 'vite-svg-loader';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
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
			resolvers: [NaiveUiResolver()],
		}),
		Vue(),
		svgLoader()
	],
	optimizeDeps: {
		exclude: ["vue-router"],
	},
	define: { "process.env": {} },
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("src", import.meta.url)),
		},
		extensions: [".ts", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
	},
	server: {
		allowedHosts: ['lead-twiki-dad-min.trycloudflare.com'],
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

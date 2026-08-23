/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
// import "@/assets/css/main.css";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
// import Antd from "ant-design-vue";
import { createApp, type App as VueApp } from "vue";
import App from "./App.vue";
// import Vue3Toasity, { type ToastContainerOptions } from "vue3-toastify";
import { registerPlugins } from "./plugins";
import pinia from "./plugins/pinia";

import "@/styles/tailwind.css";

// function resolveGLobalComponents(instance: VueApp<Element>) {
// 	instance.use(Antd);
// }

const app = createApp(App);
app.use(pinia);
// app.use(Vue3Toasity, {
// 	useHandler: resolveGLobalComponents,
// } as ToastContainerOptions);
registerPlugins(app);
app.mount("#app");

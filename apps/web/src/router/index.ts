import {
	createRouter,
	createWebHistory,
	type RouteRecordRaw,
} from "vue-router";
import { http } from "@/functions/";

declare module "vue-router" {
	interface RouteMeta {
		requiresAuth?: boolean;
		layout?: {
			hideNavigator?: boolean;
			fullscreen?: boolean;
		};
	}
}

const LayoutBase = () => import("@/layouts/LayoutBase.vue");

const routes: RouteRecordRaw[] = [
	// {
	// 	path: "/",
	// 	name: "Landing",
	// 	component: () => import("@/views/LandingView.vue"),
	// 	meta: { publicOnly: true },
	// },
	{
		path: "/",
		component: LayoutBase,
		meta: { requiresAuth: true },
		children: [
			{
				path: "",
				name: "About",
				component: () => import("@/views/about/AboutView.vue"),
				meta: { publicOnly: true },
			},
			{
				path: "home",
				name: "Home",
				component: () => import("@/views/user/HomeView.vue"),
			},
			{
				path: "users/:username",
				name: "UserProfile",
				component: () => import("@/views/user/UserProfileView.vue"),
				props: true,
			},
			{
				path: "code",
				children: [
					{
						path: "",
						name: "CodeProjects",
						component: () => import("@/views/code/ProjectsView.vue"),
					},
					{
						path: ":id/edit",
						name: "CodeEdit",
						component: () => import("@/views/code/CodeEditView.vue"),
						props: true,
						meta: { layout: { fullscreen: true, hideNavigator: true } },
					},
				],
			},
		],
	},
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/FormLoginView.vue"),
    meta: { publicOnly: true },
  },
  {
    path: "/signup",
    name: "Signup",
    component: () => import("@/views/auth/FormSignupView.vue"),
    meta: { publicOnly: true },
  },
  {
    path: "/rescue",
    name: "PasswordRescue",
    component: () => import("@/views/auth/FormPasswordRescueView.vue"),
    meta: { publicOnly: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/err/NotFoundView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Estado de inicialização — fetch do servidor só acontece uma vez
let appInitialized = false;

router.beforeEach(async (to, from, next) => {
  const userStore = (await import("@/stores/user")).useUserStore();

  // Na primeira navegação, busca os dados do servidor se não tiver no store
  if (!appInitialized) {
    if (!userStore.checkAuth()) {
      // Tenta recuperar sessão do servidor uma única vez
      try {
        await http.auth.isAuthenticated();
      } catch {
        // Servidor inacessível ou sessão expirada — store limpo já foi tratado em isAuthenticated()
      }
    }
    appInitialized = true;
  }

  // Verificação local instantânea (sem fetch) para todas as navegações seguintes
  const isLoggedIn = userStore.checkAuth();

  if (to.meta.requiresAuth && !to.meta.publicOnly && !isLoggedIn) {
    next({ name: "Login", query: { redirect: to.fullPath } });
  } else if (
    (to.name === "Login" || to.name === "Signup" || to.name === "PasswordRescue" || to.name === "About") &&
    isLoggedIn
  ) {
    next({ name: "Home" });
  } else {
    next();
  }
});


router.onError((err, to) => {
	if (
		err?.message?.includes?.("Failed to fetch dynamically imported module") &&
		!localStorage.getItem("vuetify:dynamic-reload")
	) {
		localStorage.setItem("vuetify:dynamic-reload", "true");
		location.assign(to.fullPath);
	}
});

router.isReady().then(() => {
	localStorage.removeItem("vuetify:dynamic-reload");
});

export default router;

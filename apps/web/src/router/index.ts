import {
	createRouter,
	createWebHistory,
	type RouteRecordRaw,
} from "vue-router";
import { http } from "@/utils/";

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
	{
		path: "/",
		component: LayoutBase,
		meta: { requiresAuth: true },
    redirect: { name: "CodeNew" },
		children: [
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
						redirect: { name: "CodeNew" },
					},
					{
						path: "projects",
						name: "CodeProjects",
						component: () => import("@/views/code/ProjectsView.vue"),
					},
					// Editor sem projeto (canvas em branco + overlay de recentes)
					{
						path: "new",
						name: "CodeNew",
						component: () => import("@/views/code/CodeEditView.vue"),
						meta: { layout: { fullscreen: true, hideNavigator: false } },
					},
					// Editor com projeto existente
					{
						path: ":id/edit",
						name: "CodeEdit",
						component: () => import("@/views/code/CodeEditView.vue"),
						props: true,
						meta: { layout: { fullscreen: true, hideNavigator: false } },
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
  {
    path: "/home",
    name: "Home",
    redirect: { name: "CodeNew" },
  },
  {
    path: "/about",
    name: "About",
    redirect: { name: "CodeNew" },
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

  if (!appInitialized) {
    if (!userStore.checkAuth()) {
      try {
        await http.auth.isAuthenticated();
      } catch {
        // Servidor inacessível ou sessão expirada
      }
    }
    appInitialized = true;
  }

  const isLoggedIn = userStore.checkAuth();

  if (to.meta.requiresAuth && !to.meta.publicOnly && !isLoggedIn) {
    next({ name: "Login", query: { redirect: to.fullPath } });
  } else if (
    (to.name === "Login" || to.name === "Signup" || to.name === "PasswordRescue") &&
    isLoggedIn
  ) {
    // Telas de autenticação continuam bloqueadas pra quem já está logado
    next({ name: "CodeNew" });
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

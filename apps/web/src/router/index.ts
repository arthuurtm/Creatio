
import {
	createRouter,
	createWebHistory,
	type RouteRecordRaw,
} from "vue-router";
import { http } from "@/utils/";

declare module "vue-router" {
	interface RouteMeta {
		requiresAuth?: boolean;
		publicOnly?: boolean;
		friendlyName?: string;
		breadcrumbs?: {
			label: string;
			to?: string | { name: string };
			disabled?: boolean;
			muted?: boolean;
		}[];
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
				meta: {
					friendlyName: "Perfil",
					breadcrumbs: [],
				},
			},
			{
				path: "code",
				meta: {
					friendlyName: "Código",
					breadcrumbs: [],
				},
				children: [
					{
						path: "",
						redirect: { name: "CodeNew" },
					},
					{
						path: "projects",
						name: "CodeProjects",
						component: () => import("@/views/code/ProjectsView.vue"),
						meta: {
							friendlyName: "Projetos",
							breadcrumbs: [],
						},
					},
					{
						path: "new",
						name: "CodeNew",
						component: () => import("@/views/code/CodeEditView.vue"),
						meta: {
							friendlyName: "Novo projeto",
							breadcrumbs: [
								{
									label: "Projetos",
									to: { name: "CodeProjects" },
								},
							],
							layout: {
								fullscreen: true,
								hideNavigator: false,
							},
						},
					},
					{
						path: ":id/edit",
						name: "CodeEdit",
						component: () => import("@/views/code/CodeEditView.vue"),
						props: true,
						meta: {
							friendlyName: "Editor",
							breadcrumbs: [
								{
									label: "Projetos",
									to: { name: "CodeProjects" },
								},
							],
							layout: {
								fullscreen: true,
								hideNavigator: false,
							},
						},
					},
				],
			},
		],
	},
	{
		path: "/login",
		name: "Login",
		component: () => import("@/views/auth/FormLoginView.vue"),
		meta: {
			publicOnly: true,
			friendlyName: "Fazer login",
		},
	},
	{
		path: "/signup",
		name: "Signup",
		component: () => import("@/views/auth/FormSignupView.vue"),
		meta: {
			publicOnly: true,
			friendlyName: "Criar conta",
		},
	},
	{
		path: "/rescue",
		name: "PasswordRescue",
		component: () => import("@/views/auth/FormPasswordRescueView.vue"),
		meta: {
			requiresAuth: false,
			publicOnly: true,
			friendlyName: "Recuperar senha",
		},
	},
	{
		path: "/:pathMatch(.*)*",
		name: "NotFound",
		component: () => import("@/views/err/NotFoundView.vue"),
		meta: {
			friendlyName: "Página não encontrada",
		},
	},
	{
		path: "/home",
		name: "Home",
		redirect: { name: "CodeNew" },
		meta: {
			friendlyName: "Início",
			breadcrumbs: [],
		},
	},
	{
		path: "/about",
		name: "About",
		redirect: { name: "CodeNew" },
		meta: {
			friendlyName: "Sobre",
			breadcrumbs: [],
		},
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
		(to.name === "Login" || to.name === "Signup") &&
		isLoggedIn
	) {
		next({ name: "CodeNew" });
	} else {
		next();
	}
});

router.onError((err, to) => {
	if (
		err?.message?.includes?.("Failed to fetch dynamically imported module") &&
		!localStorage.getItem("router:dynamic-reload")
	) {
		localStorage.setItem("router:dynamic-reload", "true");
		location.assign(to.fullPath);
	}
});

router.isReady().then(() => {
	localStorage.removeItem("router:dynamic-reload");
});

export default router;

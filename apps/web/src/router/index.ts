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
		path: "/auth",
		meta: { publicOnly: true },
		children: [
			{
				path: "login",
				name: "Login",
				component: () => import("@/views/auth/FormLoginView.vue"),
			},
			{
				path: "signup",
				name: "Signup",
				component: () => import("@/views/auth/FormSignupView.vue"),
			},
			{
				path: "password/rescue",
				name: "PasswordRescue",
				component: () => import("@/views/auth/FormPasswordRescueView.vue"),
			},
		],
	},
	{ path: "/login", redirect: { name: "Login" } },
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

router.beforeEach(async (to, from, next) => {
	const isLoggedIn = await http.auth.isAuthenticated();

	if (to.meta.requiresAuth && !isLoggedIn) {
		next({ name: "Login", query: { redirect: to.fullPath } });
	} else if ((to.name === "Login" || to.name === "About") && isLoggedIn) {
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

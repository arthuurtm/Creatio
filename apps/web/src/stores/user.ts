import { defineStore } from "pinia";

interface UserState {
	id: number;
	name: string;
	username: string;
	email: string;
	profilePicture?: string;
	additionalData?: any;
	isAuth?: boolean;
}

function models(): UserState {
	return {
		id: 0,
		name: "",
		username: "",
		email: "",
		profilePicture: "",
		additionalData: null,
		isAuth: false,
	};
}

export const useUserStore = defineStore("user", {
	state: () => models(),
	getters: {
		getId: (state) => state.id,
		getName: (state) => state.name,
		getUsername: (state) => state.username,
		getEmail: (state) => state.email,
		getProfilePicture: (state) => state.profilePicture,
		getAdditionalData: (state) => state.additionalData,
		getIsAuth: (state) => state.isAuth,
	},
	actions: {
		setUserData(userData: UserState) {
			this.id = userData.id;
			this.name = userData.name;
			this.username = userData.username;
			this.email = userData.email;
			this.additionalData = userData.additionalData || {};
			this.profilePicture = userData.profilePicture;
			this.isAuth = true;
		},
		clearUserData() {
			this.$reset();
		},
		checkAuth() {
			return this.isAuth && this.id !== 0;
		},
	},
});

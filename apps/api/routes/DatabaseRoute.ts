import { Router } from "express";
import {
	getAnyProjectController,
	setProjectOnDatabaseController,
} from "#api/controllers/http/ProjectController.ts";
import {
	getBasicUserDataController,
	getUserDataController,
	handleLoginController,
	resetUserPasswordController,
	setResetPasswordCodeController,
	setSignupCodeController,
	signupUserController,
} from "#api/controllers/http/UserController.ts";
import {
	getAnyUserSessionController,
	logoutAllSessionsController,
	logoutUserController,
	validateSecureSession,
} from "#api/controllers/http/UserSessionController.ts";
// import { reqLimiter } from "#api/helpers/limiter.ts";
import isAuthenticated from "#api/middlewares/isAuthenticated.ts";

const router = Router();
// precisa de autenticação
router.get("/getUserData", isAuthenticated, getUserDataController);
router.get("/getAllUserSessions", isAuthenticated, getAnyUserSessionController);
// router.delete("/deleteSession", isAuthenticated, async (req, res) => {});
router.delete("/logoutAll", isAuthenticated, logoutAllSessionsController);
router.delete("/logout", isAuthenticated, logoutUserController);
router.post(
	"/setProject",
	/*reqLimiter(1, 12),*/ isAuthenticated,
	setProjectOnDatabaseController,
);

// não precisa de autenticação
router.post("/setLogin", handleLoginController);
router.get("/getUserBasics", getBasicUserDataController);
router.get("/getProjects", getAnyProjectController);
router.post("/setSignupCode", setSignupCodeController);
router.post("/setResetPassCode", setResetPasswordCodeController);
router.post("/setUser", signupUserController);
router.post("/setUserPassword", resetUserPasswordController);
router.post("/validateSecureSession", validateSecureSession);

export default router;

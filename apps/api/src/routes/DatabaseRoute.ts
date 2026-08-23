import { Router } from "express";
import multer from "multer";
import {
	compileProjectStateController,
	deleteProjectController,
	duplicateProjectController,
	getAnyProjectController,
	getProjectStateController,
	saveProjectStateController,
	setProjectOnDatabaseController,
	updateProjectController,
} from "#api/controllers/ProjectController.ts";
import {
	getBasicUserDataController,
	getUserDataController,
	handleLoginController,
	resetUserPasswordController,
	setResetPasswordCodeController,
	setSignupCodeController,
	signupUserController,
} from "#api/controllers/UserController.ts";
import {
	deleteProfilePicController,
	updateProfileFieldController,
	uploadProfilePicController,
} from "#api/controllers/UserProfileController.ts";
import {
	deleteSessionController,
	getAnyUserSessionController,
	logoutAllSessionsController,
	logoutUserController,
	refreshSessionController,
	validateSecureSession,
} from "#api/controllers/UserSessionController.ts";
// import { reqLimiter } from "#api/helpers/limiter.ts";
import isAuthenticated from "#api/middlewares/isAuthenticated.ts";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// precisa de autenticação
router.get("/getUserData", isAuthenticated, getUserDataController);
router.get("/getAllUserSessions", isAuthenticated, getAnyUserSessionController);
router.delete("/deleteSession", isAuthenticated, deleteSessionController);
router.delete("/logoutAll", isAuthenticated, logoutAllSessionsController);
router.delete("/logout", logoutUserController);
router.delete("/deleteProject", isAuthenticated, deleteProjectController);
router.post(
	"/setProject",
	/*reqLimiter(1, 12),*/ isAuthenticated,
	setProjectOnDatabaseController,
);
router.put(
	"/updateProfileField",
	isAuthenticated,
	updateProfileFieldController,
);
router.post(
	"/uploadProfilePic",
	isAuthenticated,
	upload.single("file"),
	uploadProfilePicController,
);
router.delete("/deleteProfilePic", isAuthenticated, deleteProfilePicController);
// editor
router.get("/getProjectState", isAuthenticated, getProjectStateController);
router.put("/saveProjectState", isAuthenticated, saveProjectStateController);
router.post("/compileProject", isAuthenticated, compileProjectStateController);
router.put("/updateProject", isAuthenticated, updateProjectController);
router.post("/duplicateProject", isAuthenticated, duplicateProjectController);


// não precisa de autenticação
router.post("/setLogin", handleLoginController);
router.get("/getUserBasics", getBasicUserDataController);
router.get("/getProjects", getAnyProjectController);
router.post("/setSignupCode", setSignupCodeController);
router.post("/setResetPassCode", setResetPasswordCodeController);
router.post("/setUser", signupUserController);
router.post("/setUserPassword", resetUserPasswordController);
router.post("/validateSecureSession", validateSecureSession);
router.post("/refreshSession", refreshSessionController);

export default router;

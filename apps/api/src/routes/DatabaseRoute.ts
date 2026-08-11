import { Router } from "express";
import multer from "multer";
import {
	deleteProjectController,
	getAnyProjectController,
	setProjectOnDatabaseController,
	updateProjectController,
	duplicateProjectController,
	getProjectStateController,
	saveProjectStateController,
	compileProjectStateController,
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
	deleteSessionController,
	getAnyUserSessionController,
	logoutAllSessionsController,
	logoutUserController,
	refreshSessionController,
	validateSecureSession,
} from "#api/controllers/http/UserSessionController.ts";
import {
	updateProfileFieldController,
	uploadProfilePicController,
	deleteProfilePicController,
} from "#api/controllers/http/UserProfileController.ts";
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

// Editor do Projeto - estado e compilação
router.get("/getProjectState", isAuthenticated, getProjectStateController);
router.put("/saveProjectState", isAuthenticated, saveProjectStateController);
router.post("/compileProject", isAuthenticated, compileProjectStateController);

// Projetos - atualizar e duplicar
router.put("/updateProject", isAuthenticated, updateProjectController);
router.post("/duplicateProject", isAuthenticated, duplicateProjectController);

// Perfil do usuário
router.put("/updateProfileField", isAuthenticated, updateProfileFieldController);
router.post(
	"/uploadProfilePic",
	isAuthenticated,
	upload.single("file"),
	uploadProfilePicController,
);
router.delete("/deleteProfilePic", isAuthenticated, deleteProfilePicController);

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


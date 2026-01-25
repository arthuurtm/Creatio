import bcrypt from "bcrypt";
import { setUserDatabaseQuery } from "#api/helpers/query.ts";
import { Session, User } from "#api/models/index.ts";
import {
	consumeVerificationUUID,
	createVerificationCode,
} from "#api/services/2FAService.ts";
import { sendEmailService } from "#api/services/EmailService.ts";

interface VerificationCodeEmailParams {
	email: string;
	template: string;
	subject: string;
	timeout?: number;
	extraData?: object;
}

interface SignupUserParams {
	nickname: string;
	username: string;
	email: string;
	birthdate: Date;
	password: string;
	accessUUID: string;
}

interface ResetPasswordParams {
	newPassword: string;
	accessToken: string;
}

type IdentificationType = "id" | "username" | "email" | "accessToken";

async function getBasicUserData(id: string) {
	if (!id) throw new Error("Identificação do usuário não informada");

	const query = setUserDatabaseQuery({ value: id });
	const userData = await User.findOne({
		where: query,
		include: [{ model: Session }],
	});
	const user = userData?.get({ plain: true });
	if (!user) return null;

	return {
		id: user,
		username: user.username,
		nickname: user.nickname,
		profilePic: user.profilePic,
		exists: true,
	};
}

async function getAllUserData(accessToken: string) {
	if (!accessToken) throw new Error("Identificação do usuário não informada");
	const userData = await Session.findOne({
		where: { accessToken },
		include: [{ model: User }],
	});
	if (!userData) return null;

	const { passwordHash, ...user } = userData?.User?.get({ plain: true }) ?? {};
	return user;
}

async function setVerificationCodeAndSendEmail({
	email,
	template,
	subject,
	timeout,
	extraData = {},
}: VerificationCodeEmailParams) {
	const { id, code, expiresAt } = await createVerificationCode(email, timeout);

	await sendEmailService({
		template,
		to: email,
		subject,
		verificationCode: code,
	});

	return { id, code, expiresAt };
}

async function signupUser({
	nickname,
	username,
	email,
	birthdate,
	password,
	accessUUID,
}: SignupUserParams) {
	await consumeVerificationUUID(accessUUID);
	const birthDateObj = new Date(birthdate);
	if (isNaN(birthDateObj.getTime()))
		throw new Error("Data de nascimento inválida");

	const passwordHash = await bcrypt.hash(password, 10);

	const user = await User.create({
		nickname,
		username,
		email,
		birthdate,
		passwordHash,
	});

	return user;
}

async function resetUserPassword({
	newPassword,
	accessToken,
}: ResetPasswordParams) {
	const { id: email } = await consumeVerificationUUID(accessToken);

	const user = await User.findOne({ where: { email } });
	if (!user) {
		throw new Error("Usuário não encontrado.");
	}
	const passwordHash = await bcrypt.hash(newPassword, 10);
	user.passwordHash = passwordHash;
	await user.save();

	await sendEmailService({
		template: "resetedPassword",
		to: email,
		subject: "A senha da sua conta foi redefinida!",
		username: user.nickname,
	});
}

export {
	getBasicUserData,
	signupUser,
	setVerificationCodeAndSendEmail,
	resetUserPassword,
	getAllUserData,
};

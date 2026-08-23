import validator from "validator";
import log from "./console.ts";

function setUserDatabaseQuery(
	values:
		| { value: string | number; keyName?: string }
		| Array<{ value: string | number; keyName?: string }>,
): Array<Record<string, string | number>> | undefined {
	const inputs = Array.isArray(values) ? values : [values];
	try {
		return inputs.map((inputObj) => {
			let { value, keyName } = inputObj;
			value = String(value).trim();

			if (validator.isNumeric(value) && Number.isInteger(Number(value))) {
				return { [keyName || "id"]: Number(value) };
			}

			if (validator.isEmail(value)) {
				return { [keyName || "email"]: value };
			}

			return { [keyName || "username"]: value };
		});
	} catch (error) {
		log.error("Erro na função setUserDatabaseQuery: ", error);
		return;
	}
}

function projectPathGenerator(id: string, version: string = "") {
	return `projects/${id}`;
}

function getFileExtension(filename: string) {
	const parts = filename.split(".");
	return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

export { setUserDatabaseQuery, projectPathGenerator, getFileExtension };

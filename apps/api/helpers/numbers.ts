import { randomBytes } from "node:crypto";

export function generateRandomNumbers(): string {
	let numbers: string = "";
	for (let i = 0; i < 6; i++) {
		const byte = randomBytes(1)[0];
		numbers += byte % 10;
	}
	return numbers;
}

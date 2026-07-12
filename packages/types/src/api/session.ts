import type { IResult } from "ua-parser-js";

export interface DeviceGenerics {
	ua: string;
	deviceType: string | undefined;
	vendor: string | undefined;
	model: string | undefined;
}

export interface DeviceData {
	os: string;
	browser: string;
	generics: DeviceGenerics;
}

export function mapUAResultToDeviceData(result: IResult): DeviceData {
	return {
		os: result.os.name ?? "unknown",
		browser: result.browser.name ?? "unknown",
		generics: {
			ua: result.ua,
			deviceType: result.device.type,
			vendor: result.device.vendor,
			model: result.device.model,
		},
	};
}

import type { ComponentPropsOptions, CSSProperties } from "vue";
import { VBtn } from "vuetify/components";

// extrai os tipos das props nativas do VBtn
type VBtnProps = InstanceType<typeof VBtn>["$props"];

type ImgProps = {
	class?: object | string;
	src: string;
	style?: CSSProperties;
};

// tipo final que é a união das duas
export interface BaseButtonProps extends /* @vue-ignore */ VBtnProps {
	icon?: string;
	img?: ImgProps;
	text?: string;
	label?: string;
}

export const baseButtonProps = {
	...VBtn.props,
	icon: String,
	img: [Object, String],
	text: String,
	label: String,
} as ComponentPropsOptions<BaseButtonProps>;

export type BaseButtonEmits = {
	click: [event: MouseEvent];
	emitEvent: [event: MouseEvent];
};

export const baseButtonEmits = ["click", "emitEvent"] as const;

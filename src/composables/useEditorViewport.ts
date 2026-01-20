import { ref } from "vue";

export function useEditorViewport() {
	const x = ref(0);
	const y = ref(0);
	const scale = ref(1);

	function pan(dx: number, dy: number) {
		x.value += dx;
		y.value += dy;
	}

	function zoom(f: number) {
		scale.value *= f;
	}

	return { x, y, scale, pan, zoom };
}

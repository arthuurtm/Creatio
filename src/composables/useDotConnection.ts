import { computed, nextTick, onMounted, type Ref, ref, watch } from "vue";
import type { GameConnection } from "#types/domain/editor/models.ts";
import { useEditorStore } from "@/stores/editor.js";

interface StartConnectionParams {
	nodeId: string;
	socketId: string;
	e: PointerEvent;
}

interface TempConnection {
	from: string;
	position: { x: number; y: number };
}

interface PathResult {
	id: string;
	d: string;
}

export function useConnections() {
	console.debug("[useConnections] init");
	const editorStore = useEditorStore();

	const tempConnection: Ref<TempConnection | null> = ref(null);
	const nodesTrigger = ref(0);
	const isDomReady = ref(false);

	onMounted(async () => {
		await nextTick();
		isDomReady.value = true;
		nodesTrigger.value++;
	});

	watch(
		() => editorStore.nodes.map((n) => [n.position.x, n.position.y]),
		async () => {
			if (!isDomReady.value) return;
			await nextTick();
			nodesTrigger.value++;
		},
		{ deep: true },
	);

	function getPortPosition(
		nodeId: string | undefined,
		port: string | undefined,
	): { x: number; y: number } | null {
		const selector = `[data-port="${nodeId}:${port}"]`;
		const el = document.querySelector(selector) as HTMLElement | null;
		const svgLayer = document.querySelector(
			".connections-layer",
		) as HTMLElement | null;

		if (el && svgLayer) {
			const rect = el.getBoundingClientRect();
			const svgRect = svgLayer.getBoundingClientRect();
			return {
				x: rect.left + rect.width / 2 - svgRect.left,
				y: rect.top + rect.height / 2 - svgRect.top,
			};
		}
		return null;
	}

	function handleStartConnection({
		nodeId,
		socketId,
		e,
	}: StartConnectionParams) {
		console.debug("[useConnections] handleStartConnection", {
			nodeId,
			socketId,
			e,
		});
		if (tempConnection.value) return;

		const from = `${nodeId}:${socketId}`;
		const startPos = getPortPosition(nodeId, socketId);
		if (!startPos) return;

		const svgRect = document
			.querySelector(".connections-layer")
			?.getBoundingClientRect();
		if (!svgRect) return;

		tempConnection.value = {
			from,
			position: {
				x: e.clientX - svgRect.left,
				y: e.clientY - svgRect.top,
			},
		};

		const onMouseMove = (e: MouseEvent) => {
			const svgRect = document
				.querySelector(".connections-layer")!
				.getBoundingClientRect();
			tempConnection.value!.position.x = e.clientX - svgRect.left;
			tempConnection.value!.position.y = e.clientY - svgRect.top;
		};

		function onMouseUp(e: MouseEvent) {
			const els = document.elementsFromPoint(e.clientX, e.clientY) || [];
			const dot = els.find((el) => (el as HTMLElement).dataset?.port) as
				| HTMLElement
				| undefined;
			const to = dot?.dataset?.port;

			if (tempConnection.value && to && to !== tempConnection.value.from) {
				const from = tempConnection.value.from;

				const fromNode = normalizeNode(from);
				const toNode = normalizeNode(to);

				if (fromNode !== toNode) {
					const alreadyExists = editorStore.connections.some(
						(c: GameConnection) => {
							if (!c.source || !c.target) return false;
							return (
								(normalizeNode(c.source) === fromNode &&
									normalizeNode(c.target) === toNode) ||
								(normalizeNode(c.source) === toNode &&
									normalizeNode(c.target) === fromNode)
							);
						},
					);

					if (!alreadyExists) {
						editorStore.connections.push({
							id: crypto.randomUUID(),
							source: from,
							target: to,
						});
					}
				}
			}

			cleanup();
		}

		function normalizeNode(portStr: string | undefined | null): string {
			if (!portStr) return "";
			const [node] = portStr.split(":");
			return node ?? "";
		}

		function cleanup() {
			tempConnection.value = null;
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		}

		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
	}

	function buildPath(from: string, to: string): PathResult | null {
		const [fromNodeId, fromPort] = from.split(":");
		const [toNodeId, toPort] = to.split(":");
		const fromPos = getPortPosition(fromNodeId, fromPort);
		const toPos = getPortPosition(toNodeId, toPort);
		if (!fromPos || !toPos) return null;

		const dx = (toPos.x - fromPos.x) / 2;
		const d = `M ${fromPos.x} ${fromPos.y}
      C ${fromPos.x + dx} ${fromPos.y},
      ${toPos.x - dx} ${toPos.y},
      ${toPos.x} ${toPos.y}`;

		return { id: `${from}_${to}`, d };
	}

	function buildTempPath(temp: TempConnection): PathResult | null {
		const [fromNodeId, fromPort] = temp.from.split(":");
		const fromPos = getPortPosition(fromNodeId, fromPort);
		const toPos = temp.position;
		if (!fromPos || !toPos) return null;

		const dx = (toPos.x - fromPos.x) / 2;
		const d = `M ${fromPos.x} ${fromPos.y}
      C ${fromPos.x + dx} ${fromPos.y},
      ${toPos.x - dx} ${toPos.y},
      ${toPos.x} ${toPos.y}`;

		return { id: "temp", d };
	}

	const paths = computed<PathResult[]>(() => {
		if (!isDomReady.value) return [];

		nodesTrigger.value;

		const realPaths = editorStore.connections
			.map((conn: GameConnection) => buildPath(conn.source, conn.target))
			.filter((v): v is PathResult => Boolean(v));

		if (tempConnection.value) {
			const tmp = buildTempPath(tempConnection.value);
			if (tmp) realPaths.push(tmp);
		}

		return realPaths;
	});

	const activePorts = computed<Set<string>>(() => {
		const set = new Set<string>();
		for (const c of editorStore.connections) {
			if (c.source) set.add(c.source);
			if (c.target) set.add(c.target);
		}
		return set;
	});

	function isPortActive(nodeId: string, portId: string): boolean {
		return activePorts.value.has(`${nodeId}:${portId}`);
	}

	return { handleStartConnection, paths, isPortActive };
}

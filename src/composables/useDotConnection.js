import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useEditorStore } from "@/stores/editor.ts";

export function useConnections() {
	console.debug("[useConnections] init");
	const editorStore = useEditorStore();
	const tempConnection = ref(null);
	const nodesTrigger = ref(0);
	const isDomReady = ref(false);

	onMounted(async () => {
		await nextTick();
		isDomReady.value = true;
		console.debug("[useConnections] onMounted -> DOM ready", {
			isDomReady: isDomReady.value,
		});
		nodesTrigger.value++;
	});

	watch(
		() => editorStore.nodes.map((n) => [n.position.x, n.position.y]),
		async () => {
			if (!isDomReady.value) return;
			console.debug("[useConnections] watch -> nodes positions changed");
			await nextTick();
			nodesTrigger.value++;
		},
		{ deep: true },
	);

	function getPortPosition(nodeId, port) {
		console.debug("[useConnections] getPortPosition.start", { nodeId, port });
		const selector = `[data-port="${nodeId}:${port}"]`;
		const el = document.querySelector(selector);

		const svgLayer = document.querySelector(".connections-layer");

		if (el && svgLayer) {
			const rect = el.getBoundingClientRect();
			const svgRect = svgLayer.getBoundingClientRect();

			return {
				x: rect.left + rect.width / 2 - svgRect.left,
				y: rect.top + rect.height / 2 - svgRect.top,
			};
		}

		console.debug("[useConnections] getPortPosition.null", { nodeId, port });
		return null;
	}

	function handleStartConnection({ nodeId, socketId, start }) {
		console.debug("[useConnections] handleStartConnection.start", {
			nodeId,
			socketId,
			start,
			tempConnection: tempConnection.value,
		});
		if (tempConnection.value) return;

		const from = `${nodeId}:${socketId}`;
		const startPos = getPortPosition(nodeId, socketId);
		if (!startPos) return;

		// crucial para o buildTempPath :p
		const svgRect = document
			.querySelector(".connections-layer")
			?.getBoundingClientRect();
		if (!svgRect) return;

		tempConnection.value = {
			position: {
				x: start.x - svgRect.left,
				y: start.y - svgRect.top,
			},
			from,
		};

		console.debug(
			"[useConnections] tempConnection.created",
			tempConnection.value,
		);

		const onMouseMove = (e) => {
			const svgRect = document
				.querySelector(".connections-layer")
				.getBoundingClientRect();
			tempConnection.value.position.x = e.clientX - svgRect.left;
			tempConnection.value.position.y = e.clientY - svgRect.top;
			console.debug("[useConnections] onMouseMove", {
				x: tempConnection.value.position.x,
				y: tempConnection.value.position.y,
			});
		};

		function onMouseUp(e) {
			console.debug("[useConnections] onMouseUp.start", {
				clientX: e.clientX,
				clientY: e.clientY,
			});
			const els = document.elementsFromPoint(e.clientX, e.clientY) || [];
			const dot = els.find((el) => el.dataset && el.dataset.port);
			const to = dot?.dataset?.port;

			console.debug("[useConnections] onMouseUp.target", {
				dot: dot?.dataset?.port,
			});

			if (tempConnection.value && to && to !== tempConnection.value.from) {
				const from = tempConnection.value.from; // Está garantido que existe aqui

				const fromNode = normalizeNode(from);
				const toNode = normalizeNode(to);

				console.debug("[useConnections] attempting connection", {
					from,
					to,
					fromNode,
					toNode,
				});

				// não permitir loop para o mesmo node
				if (fromNode === toNode) return cleanup();

				// Checar se a conexão já existe
				const alreadyExists = editorStore.connections.some((c) => {
					if (!c.from || !c.to) return false;
					const cFrom = normalizeNode(c.from);
					const cTo = normalizeNode(c.to);
					return (
						(cFrom === fromNode && cTo === toNode) ||
						(cFrom === toNode && cTo === fromNode)
					);
				});

				if (!alreadyExists) {
					editorStore.connections.push({ from, to });
					console.debug("[useConnections] connection.created", { from, to });
				} else {
					console.debug("Conexão já existe entre", fromNode, "e", toNode);
				}
			}

			cleanup();
		}

		function normalizeNode(portStr) {
			console.debug("[useConnections] normalizeNode", { portStr });
			return String(portStr).split(":")[0];
		}

		function cleanup() {
			console.debug("[useConnections] cleanup called");
			tempConnection.value = null;
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		}

		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
	}

	function buildPath(from, to) {
		console.debug("[useConnections] buildPath.start", { from, to });
		if (!from || !to) return null;
		const [fromNodeId, fromPort] = from.split(":");
		const [toNodeId, toPort] = to.split(":");
		const fromPos = getPortPosition(fromNodeId, fromPort);
		const toPos = getPortPosition(toNodeId, toPort);
		if (!fromPos || !toPos) return null;

		// Cálculo Bezier (spline)
		const dx = (toPos.x - fromPos.x) / 2;
		const d = `M ${fromPos.x} ${fromPos.y}
    C ${fromPos.x + dx} ${fromPos.y},
    ${toPos.x - dx} ${toPos.y},
    ${toPos.x} ${toPos.y}`;
		return { id: from + "_" + to, d };
	}

	function buildTempPath(temp) {
		console.debug("[useConnections] buildTempPath.start", { temp });
		if (!temp || !temp.from || !temp.position) return null; // Guarda mais completo

		const [fromNodeId, fromPort] = temp.from.split(":");
		const fromPos = getPortPosition(fromNodeId, fromPort);

		// Coordenadas do mouse
		const toPos = temp.position;

		if (!fromPos || !toPos) return null;

		const dx = (toPos.x - fromPos.x) / 2;
		const d = `M ${fromPos.x} ${fromPos.y}
    C ${fromPos.x + dx} ${fromPos.y},
    ${toPos.x - dx} ${toPos.y},
    ${toPos.x} ${toPos.y}`;
		return { id: "temp", d };
	}

	const paths = computed(() => {
		console.debug("[useConnections] paths.compute.start");
		if (!isDomReady.value) return [];

		nodesTrigger.value;

		const realPaths = editorStore.connections
			.map((conn) => buildPath(conn.from, conn.to))
			.filter(Boolean);

		if (tempConnection.value) {
			realPaths.push(buildTempPath(tempConnection.value));
		}

		console.debug("[useConnections] paths.compute.result", {
			count: realPaths.length,
		});

		return realPaths;
	});

	const activePorts = computed(() => {
		console.debug("[useConnections] activePorts.compute.start");
		const set = new Set();

		for (const c of editorStore.connections) {
			if (c.from) set.add(c.from);
			if (c.to) set.add(c.to);
		}

		console.debug("[useConnections] activePorts.compute.result", {
			count: set.size,
		});

		return set;
	});

	function isPortActive(nodeId, portId) {
		const result = activePorts.value.has(`${nodeId}:${portId}`);
		console.debug("[useConnections] isPortActive", { nodeId, portId, result });
		return result;
	}

	return { handleStartConnection, paths, isPortActive };
}

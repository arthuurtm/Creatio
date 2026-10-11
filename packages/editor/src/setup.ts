import { NodeEditor } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { VuePlugin, Presets, type VueArea2D } from 'rete-vue-plugin';
import { Connection } from '@projeto/types';
import type { Schemes } from '@projeto/types';
import type { Component } from 'vue';

type AreaExtra = VueArea2D<Schemes>;

export interface ReteEditorInstance {
  editor: NodeEditor<Schemes>;
  area: AreaPlugin<Schemes, VueArea2D<Schemes>>;
  destroy: () => void;
}

export interface CreateReteEditorOptions {
  /** Componente Vue para renderizar nós */
  customNode: Component;
  /** Componente Vue para renderizar controles */
  customControl: Component;
}

/**
 * Cria e configura uma instância completa do editor Rete com os plugins de área,
 * conexão e renderização Vue. Encapsula o setup que antes ficava no ComponentNode.vue.
 *
 * @param container - O elemento HTML onde o canvas do editor será montado
 * @param options - Componentes Vue customizados para nós e controles
 * @returns A instância do editor, area plugin e função de destruição
 */
export async function createReteEditor(
  container: HTMLElement,
  options: CreateReteEditorOptions,
): Promise<ReteEditorInstance> {
  const { customNode, customControl } = options;

  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new VuePlugin<Schemes, AreaExtra>();

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  render.addPreset(
    Presets.classic.setup({
      customize: {
        node(_context) {
          return customNode as any;
        },
        control(_context) {
          return customControl as any;
        },
      },
    }) as any,
  );
  connection.addPreset(ConnectionPresets.classic.setup() as any);

  editor.use(area);
  area.use(connection);
  area.use(render);
  AreaExtensions.simpleNodesOrder(area);

  // Garante que conexões criadas pela UI usem o Connection do rete-studio-core
  // (que tem o método serialize()), em vez do ClassicPreset.Connection padrão do Rete.
  // Sem isso, c.serialize() lança erro ao tentar salvar/compilar o grafo.
  editor.addPipe((context) => {
    if (context.type === 'connectioncreate') {
      const { data } = context;
      const studioConn = new Connection(
        editor.getNode(data.source),
        data.sourceOutput as never,
        editor.getNode(data.target),
        data.targetInput as never,
      );
      studioConn.id = data.id;
      context.data = studioConn as typeof data;
    }
    return context;
  });

  return {
    editor,
    area,
    destroy: () => area.destroy(),
  };
}

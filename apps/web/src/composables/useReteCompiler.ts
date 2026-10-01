import { DataflowEngine, ControlFlowEngine } from 'rete-engine';

export function useReteCompiler(editor: any) {
  const dataflow = new DataflowEngine();
  const controlflow = new ControlFlowEngine();

  // O Control Flow será registrado aqui depois de definirmos as funções execute() nos nodes.

  const compile = async () => {
    // Exemplo de como vamos gerar código iterando pela ControlFlowEngine e DataflowEngine
    console.log("Iniciando compilação pelo motor nativo Rete.js v2...");

    // Obter todos os nós de início (ex: START_NODE)
    const nodes = editor.getNodes();
    let generatedCode = "";

    // TODO: Usar controlflow.execute() para percorrer as conexões e gerar o código javascript.

    return generatedCode;
  };

  return { dataflow, controlflow, compile };
}

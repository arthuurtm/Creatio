import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useSettingsStore } from "@/stores/global";

export function useEditorTour() {
  function startTour() {
    const settingsStore = useSettingsStore();
    const isDark = settingsStore.theme === "dark";

    const driverObj = driver({
      showProgress: true,
      nextBtnText: "Próximo →",
      prevBtnText: "← Voltar",
      doneBtnText: "Concluir",
      popoverClass: isDark ? "driverjs-theme-dark" : "",
      steps: [
        {
          element: "#tour-canvas",
          popover: {
            title: "Área de Trabalho (Canvas)",
            description: "Bem-vindo ao Creatio! Aqui é onde você constrói a sua lógica visualmente, arrastando e soltando blocos (nós).",
            side: "top",
            align: "start"
          }
        },
        {
          element: "#tour-properties",
          popover: {
            title: "Catálogo e Propriedades",
            description: "Neste painel esquerdo você acessa o Catálogo de Blocos para adicionar novas funções e variáveis à tela, além de editar as propriedades do bloco selecionado.",
            side: "right",
            align: "start"
          }
        },
        {
          element: "#tour-btn-code",
          popover: {
            title: "Código em Tempo Real",
            description: "A qualquer momento, clique aqui para ver o código JavaScript exato que está sendo gerado pela sua lógica visual!",
            side: "bottom",
            align: "end"
          }
        },
        {
          element: "#tour-theme",
          popover: {
            title: "Pronto para começar!",
            description: "Você também pode alternar entre os modos claro e escuro. Divirta-se criando lógicas complexas sem escrever código manual!",
            side: "bottom",
            align: "end"
          }
        }
      ]
    });

    driverObj.drive();
  }

  return { startTour };
}

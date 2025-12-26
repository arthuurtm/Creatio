# Função para matar os processos em segundo plano
cleanup() {
  echo "Interrompendo todos os processos em segundo plano..."
  # Matar todos os PIDs armazenados
  for pid in "${pids[@]}"; do
    echo "Parando $pid ..."
    kill "$pid" 2>/dev/null
  done
  exit 0
}

# Capturar o sinal de interrupção (Ctrl + C) e chamar a função de limpeza
trap cleanup SIGINT

# Vetor para armazenar os PIDs dos processos em segundo plano
pids=()

# Executa o servidor de arquivos
podman start minio

# Inicia o servidor de exibição do site
pnpm run dev &
cd api
pnpm tsx 'api/server.mts'

# Aguardar a execução de todos os processos em segundo plano
echo "Serviços sendo executados em segundo plano. Ctrl + C para sair;"
wait

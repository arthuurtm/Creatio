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

# Procurar por todos os arquivos .mjs **somente na raiz**
cd api
for file in $(find . -maxdepth 1 -type f -name "*.mjs"); do
  echo "Executando $file com Node.js..."
  node "$file" &
  pids+=($!)  # Armazenar o PID do processo em segundo plano
done

# Inicia o servidor de exibição do site
pnpm run dev

# Aguardar a execução de todos os processos em segundo plano
echo "Serviços sendo executados em segundo plano. Ctrl + C para sair;"
wait

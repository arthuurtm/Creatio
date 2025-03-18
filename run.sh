cd api

# Função para verificar se um serviço está em execução
check_service() {
  service_name=$1
  if ! pgrep -x "$service_name" > /dev/null; then
    echo "Erro: O serviço $service_name não está em execução. Por favor, inicie o serviço."
  else
    echo "$service_name está em execução."
  fi
}

# Verificar se os serviços estão em execução
check_service "mariadb"

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

# Procurar por todos os arquivos .py **somente na raiz**, ignorando os que começam com "f_"
for file in $(find . -maxdepth 1 -type f -name "*.py" | grep -v '/f_'); do
  echo "Executando $file com Python..."
  python "$file" &
  pids+=($!)  # Armazenar o PID do processo em segundo plano
done

# Procurar por todos os arquivos .cjs **somente na raiz**, ignorando os que começam com "f_"
for file in $(find . -maxdepth 1 -type f -name "*.cjs" | grep -v '/f_'); do
  echo "Executando $file com Node.js..."
  node "$file" &
  pids+=($!)  # Armazenar o PID do processo em segundo plano
done

# Inicia o servidor de exibição do site
npm run dev

# Aguardar a execução de todos os processos em segundo plano
echo "Serviços sendo executados em segundo plano. Ctrl + C para sair;"
wait

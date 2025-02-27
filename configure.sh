venvPath="api/.venv"

echo "Configurando ambiente para o Python..."
if [ ! -d "$venvPath" ]; then
    echo "Criando VM do Python..."
    python3 -m venv "$venvPath"
else
    echo "VM já configurada"
fi

source "$venvPath/bin/activate"
echo "Instalando pacotes..."
pip install -r "api/requirements.txt"
echo "Pronto!"
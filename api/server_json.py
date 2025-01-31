from flask import Flask
from flask_socketio import SocketIO, emit
import os
import json

app = Flask(__name__)
socketio = SocketIO(app)

# Caminho seguro para os arquivos JSON
BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'private/json')

@app.route('/')
def index():
    return "WebSocket JSON Server is running!"

# Evento WebSocket para solicitar JSON
@socketio.on('get_json')
def handle_get_json(data):
    """
    data: {
        "fileName": "example.json"
    }
    """
    file_name = data.get('fileName')

    # Verifica se o nome do arquivo foi enviado
    if not file_name or not file_name.endswith('.json'):
        emit('error', {"message": "Tipo de arquivo inválido"})
        return

    # Caminho completo do arquivo
    file_path = os.path.join(BASE_DIR, file_name)

    # Verifica se o arquivo existe
    if not os.path.exists(file_path):
        emit('error', {"message": "Arquivo não encontrado"})
        return

    try:
        # Lê o arquivo e envia o conteúdo
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        emit('json_response', data)
    except Exception as e:
        emit('error', {"message": f"Erro ao ler o arquivo: {str(e)}"})

if __name__ == '__main__':
    PORT = 3002
    print('.::: WebSocket JSON Server :::.')
    print(f'Servidor rodando na porta {PORT}')
    socketio.run(app, port=PORT, allow_unsafe_werkzeug=True)

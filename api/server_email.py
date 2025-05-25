import os
import base64
from requests import HTTPError
from flask_cors import CORS
from flask import Flask, request, jsonify, render_template_string, make_response
from email.message import EmailMessage
from dotenv import load_dotenv
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import webbrowser

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Configurações do OAuth
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]
email_from = os.getenv('EMAIL_FROM')

# Configuração do Flask
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://6021-138-0-82-55.ngrok-free.app"])

# Variável global para armazenar o serviço autenticado
service = None

# Função para autenticar com o Google OAuth
def authenticate_google():
    flow = InstalledAppFlow.from_client_secrets_file('./auth/credentials.json', SCOPES)
    creds = flow.run_local_server(port=8080)
    return build('gmail', 'v1', credentials=creds)

# Função para carregar e renderizar um modelo HTML
def load_template(structure_name, variables):
    templates_path = os.path.join(os.getcwd(), "templates/")
    template_file = os.path.join(templates_path, f"{structure_name}.html")

    if not os.path.exists(template_file):
        raise ValueError(f"Modelo para estrutura '{structure_name}' não encontrado.")

    with open(template_file, "r", encoding="utf-8") as file:
        template_content = file.read()

    return render_template_string(template_content, **variables)

# Função para criar o conteúdo do e-mail
def create_email_content(structure_name, variables):
    if not variables:
        raise ValueError(f"Erro: Nenhuma variável fornecida para o template '{structure_name}'.")

    try:
        return load_template(structure_name, variables)
    except Exception as e:
        raise ValueError(f"Erro ao criar conteúdo do e-mail: {e}")


# Função de envio de e-mail usando a API do Gmail com OAuth2
def send_email_function(variables):
    global service
    if not service:
        raise ValueError("O serviço de e-mail não foi autenticado. Chame /authenticate primeiro.")

    print(f"Dados em variables: {variables}")

    try:
        structure_name = variables.get("structure_name")
        email_content = create_email_content(structure_name, variables)

        msg = EmailMessage()
        msg.set_content(email_content, subtype="html")
        msg["To"] = variables.get("to")
        msg["From"] = email_from
        msg["Subject"] = variables.get("subject")
        secure_msg = {'raw': base64.urlsafe_b64encode(msg.as_bytes()).decode()}

        message = service.users().messages().send(userId="me", body=secure_msg).execute()
        print(f'Sent message to {variables.get("to")}. ID: {message["id"]}')

        return {"status": 200, "message": "E-mail enviado com sucesso!"}

    except HTTPError as e:
        print(f'Ocorreu um erro HTTP: {e}')
        raise e

    except Exception as e:
        print(f'Ocorreu um erro não especificado: {e}')
        raise e


# Rota para envio de e-mails
@app.route("/send-email", methods=["POST"])
def send_email():
    data = request.json
    variables = data.get("variables")

    try:
        send_email_function(variables)
        return make_response(jsonify({'message': 'E-mail enviado com sucesso.'}), 200)
    except Exception as e:
        print(f"Erro ao enviar e-mail: {e}")
        return make_response(jsonify({'message': 'Erro ao enviar e-mail.', 'error': str(e)}), 500)


# Rota para autenticação OAuth
@app.route("/authenticate", methods=["GET"])
def authenticate():
    global service  # Agora 'service' será modificada corretamente
    try:
        service = authenticate_google()  # Salva o serviço autenticado
        return jsonify({"message": "Autenticação realizada com sucesso!"})
    except Exception as e:
        return jsonify({"error": f"Erro na autenticação: {e}"}), 500


# Inicia o servidor
if __name__ == "__main__":
    port = 3001
    print(f'🚀 Servidor rodando em http://localhost:{port}')
    app.run(port=port, debug=True)
    webbrowser.open(f'https://localhost:{port}/authenticate')

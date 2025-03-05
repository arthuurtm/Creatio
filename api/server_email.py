import os
from flask_cors import CORS
from flask import Flask, request, jsonify, render_template_string, make_response
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import base64
from email.message import EmailMessage
from oauth2client.client import Credentials
from f_getAutorization import get_stored_credentials, store_credentials, init_db
from dotenv import load_dotenv
init_db()
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

admin_id = os.getenv('EMAIL_ID')
email_from = os.getenv('EMAIL_FROM')
app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173"
])

def load_credentials(admin_id):
    stored_credentials = get_stored_credentials(admin_id)
    if not stored_credentials:
        raise Exception(f"Nenhuma credencial encontrada para o usuário {admin_id}.")
    return Credentials.new_from_json(stored_credentials.to_json())


# Função para carregar e renderizar um modelo HTML
def load_template(structure_name, variables):
    """Carrega e renderiza o modelo HTML correspondente."""
    templates_path = os.path.join(os.getcwd(), "templates/")
    template_file = os.path.join(templates_path, f"{structure_name}.html")

    if not os.path.exists(template_file):
        raise ValueError(f"Modelo para estrutura '{structure_name}' não encontrado.")

    with open(template_file, "r", encoding="utf-8") as file:
        template_content = file.read()

    # Renderiza o template usando as variáveis fornecidas
    return render_template_string(template_content, **variables)


# Função para criar o conteúdo do e-mail
def create_email_content(structure_name, variables):
    try:
        return load_template(structure_name, variables)
    except Exception as e:
        raise ValueError(f"Erro ao criar conteúdo do e-mail: {e}")


# Funções de envio e criação de rascunho
def gmail_create_draft(admin_id, structure_name, variables):
    try:
        creds = load_credentials(admin_id)
        service = build("gmail", "v1", credentials=creds)

        # Gera o conteúdo do e-mail
        email_content = create_email_content(structure_name, variables)

        message = EmailMessage()
        message.set_content(email_content, subtype="html")
        message["To"] = variables.get("to")
        message["From"] = variables.get("from")
        message["Subject"] = variables.get("subject")

        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        create_message = {"message": {"raw": encoded_message}}

        draft = service.users().drafts().create(userId="me", body=create_message).execute()
        return {"status": "success", "draft_id": draft["id"]}
    except HttpError as error:
        return {"status": "error", "message": str(error)}


def gmail_send_message(admin_id, structure_name, variables):
    try:
        creds = load_credentials(admin_id)
        service = build("gmail", "v1", credentials=creds)

        email_content = create_email_content(structure_name, variables)

        message = EmailMessage()
        message.set_content(email_content, subtype="html")
        message["To"] = variables.get("to")
        message["From"] = email_from
        message["Subject"] = variables.get("subject")

        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        create_message = {"raw": encoded_message}

        sent_message = service.users().messages().send(userId="me", body=create_message).execute()
        return {"status": 200, "message_id": sent_message["id"]}
    except HttpError as error:
        return {"status": 500, "message": str(error)}


# Endpoints
@app.route("/create-draft", methods=["POST, GET"])
def create_draft():
    data = request.json
    structure_name = data.get("structure_name")
    variables = data.get("variables")
    result = gmail_create_draft(admin_id, structure_name, variables)
    return jsonify(result)


@app.route("/send-email", methods=["POST", "GET"])
def send_email():
    if request.method == "GET":
        structure_name = request.args.get("structure_name")
        variables = request.args.to_dict(flat=True)
    else:  # POST
        data = request.json
        structure_name = data.get("structure_name")
        variables = data.get("variables")

    try:
        # Usa o token como parte do conteúdo do e-mail
        result = gmail_send_message(admin_id, structure_name, variables)
        return make_response(jsonify({'message': 'E-mail enviado com sucesso.', 'result': result}), 200)
    except Exception as e:
        print(f"Erro ao enviar e-mail: {e}")
        return make_response(jsonify({'message': 'Erro ao enviar e-mail.', 'error': str(e)}), 500)


if __name__ == "__main__":
    port = 3001
    print('.::: MAIL SERVICE BACKEND :::.')
    print(f'Servidor rodando na porta {port}')
    app.run(port=3001, debug=False)

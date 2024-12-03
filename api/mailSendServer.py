import os
from flask import Flask, request, redirect, session, url_for
from authlib.integrations.flask_client import OAuth
from googleapiclient.discovery import build
from email.mime.text import MIMEText
import base64
from dotenv import load_dotenv
from httplib2 import Credentials

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('GSECRET_KEY')  # Defina uma chave secreta
oauth = OAuth(app)

# Configuração do OAuth com o Google
google = oauth.register(
    name='google',
    client_id=os.getenv('GCLIEND_ID'),
    client_secret=os.getenv('GSECRET_KEY'),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    access_token_params=None,
    authorize_params=None,
    api_base_url='https://www.googleapis.com/',
    client_kwargs={'scope': 'https://www.googleapis.com/auth/gmail.send'},
)

@app.route('/')
def home():
    return 'Acesse /autenticar para iniciar a autorização do Gmail.'

# Rota para iniciar o processo de autenticação
@app.route('/autenticar')
def autenticar():
    redirect_uri = url_for('solicitar_codigo', _external=True)
    # Gerar um estado único e armazená-lo na sessão
    state = google.generate_authorize_redirect_state()
    session['state'] = state
    return google.authorize_redirect(redirect_uri, state=state)


# Rota de callback para receber o código de autorização
@app.route('/solicitar-codigo', methods=['GET', 'POST'])
def solicitar_codigo():
    token = google.authorize_access_token()
    session['token'] = token

    # Salvar as credenciais no arquivo token.json para reutilizar
    with open('token.json', 'w') as token_file:
        token_file.write(str(token))

    return 'Autenticação realizada com sucesso!'

# Função para criar a mensagem do email
def create_message(to, subject, message_text):
    message = MIMEText(message_text)
    message['to'] = to
    message['subject'] = subject
    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
    return {'raw': raw_message}

# Função para enviar o email usando as credenciais armazenadas
def send_email(to, subject, message_text):
    if 'token' not in session:
        return 'Por favor, autentique primeiro em /autenticar'

    # Constrói as credenciais do Google a partir do token armazenado
    creds = Credentials(
        token=session['token']['access_token'],
        refresh_token=session['token'].get('refresh_token'),
        token_uri='https://oauth2.googleapis.com/token',
        client_id=os.getenv('GCLIEND_ID'),
        client_secret=os.getenv('GSECRET_KEY')
    )

    print(creds)

    # Cria o serviço Gmail com as credenciais
    service = build('gmail', 'v1', credentials=creds)
    message = create_message(to, subject, message_text)
    sent_message = service.users().messages().send(userId="me", body=message).execute()
    return f"Mensagem enviada! ID da mensagem: {sent_message['id']}"

@app.route('/enviar-email')
def enviar_email():
    to = request.args.get('to')
    subject = request.args.get('subject')
    message_text = request.args.get('message')
    return send_email(to, subject, message_text)

if __name__ == '__main__':
    app.run(port=3002)

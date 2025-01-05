import logging
import httplib2
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError
from oauth2client.client import Credentials
import sqlite3
import os
import json

DB_NAME = './auth/dbSysroot.db'
EMAIL = os.getenv('EMAIL_FROM')
CLIENTSECRETS_LOCATION = './auth/credentials.json'
REDIRECT_URI = 'http://localhost:3001/'
SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.insert'
]

class GetCredentialsException(Exception):

  def __init__(self, authorization_url):
    """Construct a GetCredentialsException."""
    self.authorization_url = authorization_url


class CodeExchangeException(GetCredentialsException):
  """Error raised when a code exchange has failed."""


class NoRefreshTokenException(GetCredentialsException):
  """Error raised when no refresh token has been found."""


class NoUserIdException(Exception):
  """Error raised when no user ID could be retrieved."""

def log(func, text):
  print(f"({func})>", text)

def init_db():
  log("init_db", "Iniciando banco de dados...")
  conn = sqlite3.connect(DB_NAME)
  cursor = conn.cursor()
  cursor.execute('''
      CREATE TABLE IF NOT EXISTS credentials (
          user_id TEXT PRIMARY KEY,
          credentials TEXT
      )
  ''')
  conn.commit()
  conn.close()

def get_stored_credentials(user_id):
  log("get_stored_credentials", "Acesso detectado.")
  try:
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT credentials FROM credentials WHERE user_id = ?', (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
      return Credentials.new_from_json(row[0])
  except Exception as e:
    log("get_stored_credentials", f"Ocorreu um erro: {e}")


def store_credentials(user_id, credentials):
  log("store_credentials", "Acesso detectado.")
  conn = sqlite3.connect(DB_NAME)
  cursor = conn.cursor()
  credentials_json = credentials.to_json()
  try:
    cursor.execute('''
        INSERT OR REPLACE INTO credentials (user_id, credentials)
        VALUES (?, ?)
    ''', (user_id, credentials_json))
    conn.commit()
    conn.close()
    log("store_credentials", "Credenciais armazenadas com sucesso!")
  except Exception as e:
    log("store_credentials", f"Erro: {e}")
    raise NotImplementedError()

def refresh_access_token(user_id):
  credentials = get_stored_credentials(user_id)
  if credentials.access_token_expired:
    try:
      credentials.refresh(httplib2.Http())
      store_credentials(user_id, credentials)  # Atualiza no banco
      print("Token de acesso renovado com sucesso!")
    except Exception as e:
      print(f"Erro ao renovar o token: {e}")
  else:
    print("O token de acesso ainda é válido.")


def exchange_code(authorization_code):
  log("exchange_code", "Acesso detectado.")
  flow = flow_from_clientsecrets(CLIENTSECRETS_LOCATION, ' '.join(SCOPES))
  flow.redirect_uri = REDIRECT_URI
  try:
    credentials = flow.step2_exchange(authorization_code)
    log("exchange_code", f"Sucesso ao obter as credenciais! {credentials}")
    return credentials
  except FlowExchangeError as error:
    logging.error('An error occurred: %s', error)
    raise CodeExchangeException(None)


def get_user_info(credentials):
  log("get_user_info", "Acesso detectado.")
  user_info_service = build(
      serviceName='oauth2', version='v2',
      http=credentials.authorize(httplib2.Http()))
  user_info = None
  try:
    user_info = user_info_service.userinfo().get().execute()
    log("get_user_info", f"Sucesso ao obter dados do usuário! {user_info}")
  except HttpError as e:
    logging.error('An error occurred: %s', e)
  if user_info and user_info.get('id'):
    return user_info
  else:
    raise NoUserIdException()


def get_authorization_url(email_address, state):
  log("get_authorization_url", "Acesso detectado.")
  flow = flow_from_clientsecrets(CLIENTSECRETS_LOCATION, ' '.join(SCOPES))
  flow.params['access_type'] = 'offline'
  flow.params['approval_prompt'] = 'force'
  flow.params['user_id'] = email_address
  flow.params['state'] = state
  return flow.step1_get_authorize_url(REDIRECT_URI)


def get_credentials(authorization_code, state):
  log("get_credentials", "Acesso detectado.")
  email_address = ''
  try:
    credentials = exchange_code(authorization_code)
    user_info = get_user_info(credentials)
    email_address = user_info.get('email')
    user_id = user_info.get('id')
    if credentials.refresh_token is not None:
      store_credentials(user_id, credentials)
      return credentials
    else:
      credentials = get_stored_credentials(user_id)
      if credentials and credentials.refresh_token is not None:
        return credentials
  except CodeExchangeException as error:
    logging.error('An error occurred during code exchange.')
    error.authorization_url = get_authorization_url(email_address, state)
    raise error
  except NoUserIdException:
    logging.error('No user ID could be retrieved.')

  authorization_url = get_authorization_url(email_address, state)
  raise NoRefreshTokenException(authorization_url)

if __name__ == "__main__":
  init_db()

  state = "test_state"
  authorization_url = get_authorization_url(EMAIL, state)
  print("Acesse esta URL para autenticar:", authorization_url)

  authorization_code = input("authorization_code ('code' na url): ")
  print(get_credentials(authorization_code, state))

  '''
  try:
    credentials = exchange_code(authorization_code)
    print("Credenciais obtidas com sucesso:")
    print(credentials.to_json())
    user_id = "test_user"
    store_credentials(user_id, credentials)
    print("Credenciais armazenadas com sucesso.")
  except Exception as e:
    print(f"Erro ao trocar código de autorização: {e}")

  print('Testando banco de dados...')
  user_id = "test_user"
  credentials = get_stored_credentials(user_id)
  if credentials:
    print("Credenciais recuperadas do banco:")
    print(credentials.to_json())
  else:
    print("Nenhuma credencial encontrada para o usuário.")
  '''
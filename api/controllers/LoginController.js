import loginService from '../services/LoginService.js';

export async function setLogin(req, res) {
  try {
    const { type, identification, password } = req.body;
    const userAgent = req.headers['user-agent'];

    const result = await loginService.handleLogin(type, identification, password, userAgent);

    res.cookie('accessToken', result.accessToken, result.accessCookieConfig);
    res.cookie('refreshToken', result.refreshToken, result.refreshCookieConfig);

    res.status(200).json({ message: 'Login bem-sucedido!' });
  } catch (error) {
    console.error('Erro ao processar solicitação de setLogin:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
}

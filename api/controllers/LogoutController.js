function logoutUser(req, res) {
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')
  res.status(200).json({ message: 'Usuário deslogado com sucesso' })
}

function logoutAllSessions(req, res) {
  try {
    res.status(200).json({ message: 'Todos os dispositivos foram desconectados!' })
  } catch (error) {
    console.error('Erro ao processar solicitação de logoutAll:', error)
    res.status(500).json({ message: 'Erro interno no servidor' })
  }
}

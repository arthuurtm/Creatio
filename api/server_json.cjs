const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Rota segura para acessar JSONs
app.get('/api/game-data/:fileName', (req, res) => {
  const { fileName } = req.params;

  // Verifica se o arquivo é um JSON válido
  if (!fileName.endsWith('.json')) {
    return res.status(400).send('Tipo de arquivo inválido');
  }

  // Caminho seguro para os arquivos JSON
  const filePath = path.join(__dirname, 'private/json', fileName);

  // Verifica se o arquivo existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Arquivo não encontrado');
  }

  // Lê o arquivo e envia o conteúdo
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).send('Erro ao ler o arquivo');
    }
    res.json(JSON.parse(data));
  });
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log('.::: JSON BACKEND :::.');
    console.log(`Servidor rodando na porta ${PORT}`);
});

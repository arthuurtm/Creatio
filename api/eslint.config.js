import globals from 'globals'

export default [
  {
    languageOptions: {
      ecmaVersion: 'latest', // Usa a versão mais recente do JavaScript
      sourceType: 'module', // Habilita o uso de import/export
      globals: {
        ...globals.node, // variáveis globais do Node.js
      },
    },
    rules: {
      'import/extensions': [
        'error',
        'always',
        {
          ignorePackages: true,
        },
      ],
    },
  },
]

export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(superagent)/)'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  // Ajouter un délai d'attente pour fermer correctement les processus
  testTimeout: 10000,
  // Détection des ressources ouvertes
  detectOpenHandles: true
}
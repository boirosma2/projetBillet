#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Convertir import.meta.url en __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Liste des commandes
const commands = {
  migrate: 'npx sequelize-cli db:migrate',
  'migrate:undo': 'npx sequelize-cli db:migrate:undo',
  'migrate:undo:all': 'npx sequelize-cli db:migrate:undo:all',
  seed: 'npx sequelize-cli db:seed:all',
  'seed:undo': 'npx sequelize-cli db:seed:undo',
  'seed:undo:all': 'npx sequelize-cli db:seed:undo:all',
  reset: 'npx sequelize-cli db:migrate:undo:all && npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all',
  status: 'npx sequelize-cli db:migrate:status',
};

// Fonction pour exécuter une commande
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Exécution de la commande: ${command}`);
    
    // Diviser la commande en parties pour spawn
    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);
    
    const process = spawn(cmd, args, { 
      stdio: 'inherit',
      shell: true,
      cwd: rootDir
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`La commande a échoué avec le code: ${code}`));
      }
    });
    
    process.on('error', (err) => {
      reject(err);
    });
  });
}

// Récupérer l'argument de la ligne de commande
const action = process.argv[2];

// Vérifier si l'action est valide
if (!action) {
  console.log('Usage: node migrate.js <action>');
  console.log('Actions disponibles:');
  Object.keys(commands).forEach(cmd => {
    console.log(`  - ${cmd}`);
  });
  process.exit(1);
}

// Exécuter la commande correspondante
if (commands[action]) {
  executeCommand(commands[action])
    .then(() => {
      console.log(`Action "${action}" terminée avec succès.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(`Erreur lors de l'exécution de l'action "${action}":`, error.message);
      process.exit(1);
    });
} else {
  console.error(`Action inconnue: ${action}`);
  console.log('Actions disponibles:');
  Object.keys(commands).forEach(cmd => {
    console.log(`  - ${cmd}`);
  });
  process.exit(1);
}
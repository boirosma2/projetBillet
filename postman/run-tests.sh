#!/bin/bash

# Assurer que le script s'arrête en cas d'erreur
set -e

# Vérifier que Newman est installé
if ! command -v newman &> /dev/null; then
    echo "Newman n'est pas installé. Veuillez l'installer avec: npm install -g newman"
    exit 1
fi

# Couleurs pour la sortie
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Tests Postman pour SmartTicket API ===${NC}\n"

echo -e "${BLUE}Démarrage du serveur en arrière-plan...${NC}"
# Garder un track du PID du serveur pour l'arrêter plus tard
cd .. && npm run dev > /dev/null 2>&1 &
SERVER_PID=$!

# Attendre que le serveur démarre
echo -e "${BLUE}Attente du démarrage du serveur...${NC}"
sleep 5

# Fonction pour nettoyer et quitter
cleanup() {
    echo -e "\n${BLUE}Arrêt du serveur...${NC}"
    kill $SERVER_PID
    echo -e "${GREEN}Tests terminés.${NC}"
}

# S'assurer de nettoyer même si le script est interrompu
trap cleanup EXIT

echo -e "\n${BLUE}Exécution des tests complets sans authentification...${NC}"
newman run api-tests.json -e no-auth.json

echo -e "\n${BLUE}Exécution des tests complets en tant qu'utilisateur normal...${NC}"
newman run api-tests.json -e regular-user.json

echo -e "\n${BLUE}Exécution des tests complets en tant qu'administrateur...${NC}"
newman run api-tests.json -e admin-user.json

echo -e "\n${GREEN}Tous les tests ont été exécutés avec succès !${NC}"
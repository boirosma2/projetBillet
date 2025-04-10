# SmartTicket Backend

SmartTicket est une plateforme de billetterie en ligne qui permet aux utilisateurs de consulter des événements, acheter des billets et aux administrateurs de gérer ces événements ainsi que des bannières promotionnelles.

## Architecture technique

### Stack technique

- **Backend**: Node.js avec Express.js
- **Base de données**: PostgreSQL 
- **ORM**: Sequelize
- **Validation**: Joi
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation API**: Swagger UI

### Structure du projet

```
smartticket-backend/
├── config/               # Configuration (base de données, etc.)
├── controllers/          # Contrôleurs pour la logique métier
├── middleware/           # Middleware Express (auth, upload, validation, etc.)
├── migrations/           # Migrations de base de données (Sequelize)
├── models/               # Modèles de données (Sequelize)
├── public/               # Fichiers publics (uploads, etc.)
├── routes/               # Routes API
├── scripts/              # Scripts utilitaires
├── seeders/              # Seeds pour initialiser la base de données
├── validators/           # Validation des données (Joi)
├── index.js              # Point d'entrée de l'application
└── package.json          # Dépendances et scripts
```

## Fonctionnalités implémentées

### Authentification

- Inscription d'utilisateur avec validation (username, email, mot de passe fort)
- Connexion avec génération de JWT
- Middleware d'authentification pour protéger les routes
- Rôles utilisateur (regular, admin)

### Gestion des lieux et villes

- Modèles City (ville) et Venue (lieu) pour organiser les événements
- Relations hiérarchiques (City > Venue)
- Informations détaillées sur les lieux (capacité, adresse, etc.)
- Filtrage des lieux par ville

### Gestion des organisateurs et artistes

- Modèles Organizer (organisateur) et Artist (artiste)
- Profils détaillés pour les artistes (genre, bio)
- Association des organisateurs aux événements
- Relation many-to-many entre événements et artistes

### Gestion des types d'événements

- Modèle EventType pour catégoriser les événements
- Types standardisés (concert, festival, théâtre, etc.)
- Association des types aux événements

### Gestion des événements

- Création, récupération, mise à jour et suppression d'événements
- Validation complète des données d'événements
- Gestion de la quantité de billets disponibles
- Filtrage des événements par statut, date, lieu, type, organisateur, etc.
- Association aux artistes, lieux, organisateurs et types d'événements

### Billetterie et achats de tickets

- Achat de billets pour un événement avec transactions sécurisées
- Génération d'un code unique pour chaque billet
- Vérification de la disponibilité des billets avec verrouillage pour éviter les conflits
- Consultation des billets achetés par l'utilisateur avec relations chargées

### Bannières promotionnelles

- Gestion de bannières pour promouvoir des événements
- Upload d'images avec validation via multer
- Une seule bannière active à la fois (l'activation d'une bannière désactive les autres)
- Programmation temporelle (dates de début/fin)
- Association optionnelle à un événement via relations Sequelize
- Système complet de suivi des clics pour analyser l'efficacité
- Ventilation des statistiques par jour et par type d'utilisateur
- Gestion de l'ordre d'affichage des bannières

## Améliorations techniques apportées

### 1. Validation des données

Nous avons implémenté un système de validation robuste avec Joi:
- Validation des entrées utilisateur au niveau de l'API
- Messages d'erreur personnalisés et clairs
- Règles de validation complexes (ex: mot de passe fort, dates cohérentes)
- Middleware réutilisable pour appliquer les validations

### 2. ORM et modèles

Introduction de Sequelize comme ORM:
- Modèles pour User, Event, Ticket, Banner, City, Venue, Artist, Organizer, EventType et EventArtist
- Validation au niveau du modèle
- Associations complexes entre entités (one-to-many, many-to-many)
- Structure hiérarchique (City > Venue > Event)
- Table de jointure pour relations many-to-many (EventArtist)
- Hooks pour la logique pré/post opération (ex: hachage des mots de passe)

### 3. Migrations et seeds

Mise en place d'un système de gestion de schéma de base de données:
- Migrations pour versionner le schéma
- Migrations pour créer les tables initiales
- Seeders pour peupler la base de données de test
- Scripts pour faciliter les opérations de migration

### 4. Transactions et intégrité des données

- Utilisation de transactions Sequelize pour les opérations critiques
- Verrouillage optimiste pour éviter les conflits (notamment pour l'achat de tickets)
- Rollback automatique en cas d'erreur
- Gestion cohérente des erreurs

### 5. Chargement de relations (eager loading)

- Utilisation des associations Sequelize pour charger les données liées
- Réduction du nombre de requêtes grâce au chargement eager
- Retour de données structurées avec leurs relations

## Sécurité

L'application intègre plusieurs niveaux de sécurité:

### Protection des données et prévention des vulnérabilités
- Hachage des mots de passe avec bcrypt
- Validation stricte des entrées pour prévenir les injections
- Requêtes SQL paramétrées via Sequelize
- Middleware CORS et Helmet pour les en-têtes de sécurité
- Transactions pour garantir l'intégrité des données
- Verrouillage lors des opérations critiques

### Authentification et Autorisation
- Authentification par JWT (JSON Web Tokens)
- Système à trois niveaux d'accès:
  - Routes publiques (sans authentification)
  - Routes authentifiées (JWT requis)
  - Routes administratives (JWT avec rôle admin requis)
- Vérification du propriétaire des ressources (un utilisateur ne peut accéder qu'à ses propres données)

### Rate Limiting et Protection contre les attaques
- Limitation globale du nombre de requêtes par IP (~100 requêtes/minute)
- Limitation renforcée sur les endpoints d'authentification (~10 requêtes/minute)
- Limitation légèrement plus permissive pour les comptes administrateurs
- Protection contre les attaques par force brute
- Réponse "429 Too Many Requests" lorsque les limites sont dépassées

### Classification des Routes par Niveau de Sécurité

#### Routes Publiques (sans authentification)
- Inscription et connexion utilisateur
- Consultation des événements, lieux, villes, artistes, organisateurs, types d'événements
- Consultation des bannières publiques
- Suivi des clics sur les bannières

#### Routes Authentifiées (JWT requis)
- Accès au profil utilisateur
- Achat et gestion des billets
- Gestion des informations personnelles

#### Routes Administratives (JWT + rôle admin requis)
- Gestion des utilisateurs (liste, suppression, changement de statut)
- Gestion des villes, lieux, types d'événements (création, modification, suppression)
- Gestion complète des bannières et accès aux statistiques
- Création et gestion des événements

## Utilisation

### Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer le fichier .env avec vos informations

# Créer et initialiser la base de données
npm run migrate:reset
```

### Commandes disponibles

```bash
# Démarrer le serveur en production
npm start

# Démarrer le serveur en développement (avec hot-reload)
npm run dev

# Exécuter les tests
npm test

# Gestion de la base de données
npm run migrate          # Exécuter les migrations en attente
npm run migrate:undo     # Annuler la dernière migration
npm run migrate:reset    # Réinitialiser la base de données (toutes migrations + seeds)
npm run migrate:status   # Afficher le statut des migrations
npm run seed             # Exécuter les seeders
npm run seed:undo        # Annuler le dernier seeder
```

## Documentation API

La documentation API est disponible via Swagger UI lorsque le serveur est en cours d'exécution:
http://localhost:5000/api-docs

## Tests automatisés

### Tests unitaires et d'intégration
Les tests sont écrits avec Jest et supertest pour tester les API.

```bash
# Exécuter tous les tests
npm test

# Exécuter un fichier de test spécifique
npx jest tests/path/file.test.js
```

### Tests via Postman
Une collection Postman est disponible dans le fichier `ticketing_platform_collection.json` pour tester manuellement l'API.

#### Configuration des tests automatisés avec différents utilisateurs
Pour exécuter les tests avec plusieurs types d'utilisateurs:

1. Dans Postman, importez la collection depuis `ticketing_platform_collection.json` 
2. Importez les environnements depuis le dossier `postman/`:
   - `no-auth.json` pour tester sans authentification (accès public)
   - `regular-user.json` pour un compte utilisateur standard
   - `admin-user.json` pour un compte administrateur
3. Pour chaque environnement authentifié, les variables suivantes sont préconfigurées:
   ```
   baseUrl: http://localhost:5000
   email: admin@example.com ou user@example.com
   password: Password123!
   ```
4. Utilisez Collection Runner dans Postman pour exécuter la suite de tests avec chaque environnement

#### Automatisation avec Newman
Pour exécuter les tests en ligne de commande:

```bash
# Installer Newman
npm install -g newman

# Exécuter les tests avec différents environnements
cd postman
newman run api-tests.json -e no-auth.json     # Tests sans authentification
newman run api-tests.json -e regular-user.json # Tests avec utilisateur standard
newman run api-tests.json -e admin-user.json   # Tests avec administrateur

# Si vous rencontrez des erreurs "429 Too Many Requests" (rate limiting)
# Ajoutez un délai entre les requêtes
newman run api-tests.json -e regular-user.json --delay-request 500
```

#### Script d'automatisation des tests
Un script pratique est fourni pour exécuter automatiquement tous les tests API:

```bash
# Rendre le script exécutable si nécessaire
chmod +x postman/run-tests.sh

# Exécuter les tests automatiquement
cd postman && ./run-tests.sh
```

Ce script:
1. Démarre automatiquement le serveur en arrière-plan
2. Exécute les tests complets (plus de 30 endpoints) dans trois contextes différents:
   - Sans authentification (accès public uniquement)
   - Avec un utilisateur standard (permissions limitées)
   - Avec un administrateur (permissions complètes)
3. Arrête proprement le serveur à la fin des tests

Les tests couvrent l'ensemble des fonctionnalités de l'API:
- Authentification et gestion utilisateur
- Gestion des villes et lieux
- Gestion des artistes et organisateurs
- Gestion des types d'événements
- Gestion des événements
- Achat et consultation de billets
- Gestion des bannières promotionnelles
- Suivi des clics et analytics

## Améliorations récentes

- Remplacement des requêtes SQL directes par l'utilisation de l'ORM Sequelize
- Implémentation de transactions pour les opérations critiques (achat de tickets, gestion de bannières)
- Extension du modèle de données avec de nouvelles entités (City, Venue, Artist, Organizer, EventType)
- Mise en place de relations complexes entre entités, y compris des relations many-to-many
- Utilisation des associations Sequelize pour les relations entre entités
- Optimisation des requêtes avec eager loading pour réduire le nombre d'appels à la base de données
- Amélioration de la gestion des erreurs et de la validation des données
- Système plus complet pour la gestion d'événements avec localisation, organisateurs et artistes
- Ajout de l'endpoint `/api/auth/profile` pour récupérer les informations complètes de l'utilisateur connecté
- Implémentation de l'endpoint `/api/users/my/tickets` pour un accès facile aux tickets de l'utilisateur courant
- Mise à jour du système d'achat de tickets avec l'endpoint `/api/tickets/buy` pour plus de clarté
- Renforcement des contrôles d'accès pour les opérations administratives (création/modification/suppression de villes)
- Amélioration des tests automatisés avec Jest et Postman pour tous les endpoints

## Améliorations futures

- Développement des API pour les nouvelles entités
- Implémentation de tests unitaires et d'intégration complets pour tous les modèles
- Système de recherche avancée (full-text search) pour les événements, artistes, lieux
- Système de paiement
- Notifications par email
- Gestion des catégories de billets
- Système de réservation temporaire
- Tableau de bord d'administration
- Système de recommandation d'événements basé sur les préférences utilisateur
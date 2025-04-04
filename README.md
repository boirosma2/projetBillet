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

### Gestion des événements

- Création, récupération, mise à jour et suppression d'événements
- Validation complète des données d'événements
- Gestion de la quantité de billets disponibles
- Filtrage des événements par statut, date, etc.

### Billetterie

- Achat de billets pour un événement avec transactions sécurisées
- Génération d'un code unique pour chaque billet
- Vérification de la disponibilité des billets avec verrouillage pour éviter les conflits
- Consultation des billets achetés par l'utilisateur avec relations chargées

### Bannières promotionnelles

- Gestion de bannières pour promouvoir des événements
- Upload d'images avec validation
- Planification par dates (début/fin)
- Association optionnelle à un événement via relations Sequelize

## Améliorations techniques apportées

### 1. Validation des données

Nous avons implémenté un système de validation robuste avec Joi:
- Validation des entrées utilisateur au niveau de l'API
- Messages d'erreur personnalisés et clairs
- Règles de validation complexes (ex: mot de passe fort, dates cohérentes)
- Middleware réutilisable pour appliquer les validations

### 2. ORM et modèles

Introduction de Sequelize comme ORM:
- Modèles pour User, Event, Ticket et Banner
- Validation au niveau du modèle
- Associations entre entités (relations)
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
- Hachage des mots de passe avec bcrypt
- Validation stricte des entrées pour prévenir les injections
- Requêtes SQL paramétrées via Sequelize
- Authentification par JWT
- Middleware CORS et Helmet pour les en-têtes de sécurité
- Rate limiting pour prévenir les attaques par force brute
- Transactions pour garantir l'intégrité des données
- Verrouillage lors des opérations critiques

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

## Améliorations récentes

- Remplacement des requêtes SQL directes par l'utilisation de l'ORM Sequelize
- Implémentation de transactions pour les opérations critiques (achat de tickets, gestion de bannières)
- Utilisation des associations Sequelize pour les relations entre entités
- Optimisation des requêtes avec eager loading pour réduire le nombre d'appels à la base de données
- Amélioration de la gestion des erreurs et de la validation des données

## Améliorations futures

- Implémentation de tests unitaires et d'intégration
- Système de paiement
- Notifications par email
- Gestion des catégories de billets
- Système de réservation temporaire
- Tableau de bord d'administration
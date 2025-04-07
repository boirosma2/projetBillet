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
- Extension du modèle de données avec de nouvelles entités (City, Venue, Artist, Organizer, EventType)
- Mise en place de relations complexes entre entités, y compris des relations many-to-many
- Utilisation des associations Sequelize pour les relations entre entités
- Optimisation des requêtes avec eager loading pour réduire le nombre d'appels à la base de données
- Amélioration de la gestion des erreurs et de la validation des données
- Système plus complet pour la gestion d'événements avec localisation, organisateurs et artistes

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
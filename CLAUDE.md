# SmartTicket Backend Development Guide

## Commands
- Build/Start: `npm start` - Start server
- Development: `npm run dev` - Start in dev mode
- Test: `npm test` - Run all tests
- Single test: `npx jest tests/path/file.test.js` - Run specific test file
- API docs: Available at http://localhost:5000/api-docs when server is running

### Database Commands
- Migrations: `npm run migrate` - Run pending migrations
- Undo last migration: `npm run migrate:undo`
- Reset database: `npm run migrate:reset` - Undo all migrations, then migrate and seed
- Check migration status: `npm run migrate:status`
- Seed database: `npm run seed` - Add sample data
- Undo last seeder: `npm run seed:undo`

### Testing Commands
- Run all tests: `npm test`
- Run specific test: `npx jest tests/path/file.test.js`
- Run Postman tests:
  ```
  cd postman
  npm install -g newman   # First time only
  newman run api-tests.json -e regular-user.json  # Regular user tests
  newman run api-tests.json -e admin-user.json    # Admin user tests
  ```
- Run all Postman tests automatically: `cd postman && ./run-tests.sh`

### Users in demo data
- Admin: `admin@example.com` / `Password123!`
- Regular user: `user@example.com` / `Password123!`

## Code Style
- **Imports**: ES modules style (`import x from 'y'`)
- **Error handling**: Use try/catch with appropriate status codes and error messages
- **Async**: All database operations should use async/await
- **Security**: Validate all user inputs, sanitize SQL queries, use prepared statements
- **Routes**: Organize by resource (auth, events, tickets, users, orders)
- **Response format**: Consistent JSON with appropriate status codes
- **Authentication**: JWT tokens with proper validation in middleware
- **Environment**: Use .env file and process.env for configuration
- **Transactions**: Use Sequelize transactions for operations that update multiple records

## Database
- PostgreSQL with `pg` driver
- Sequelize ORM for database operations
- Migrations in the `migrations/` directory
- Seeders in the `seeders/` directory

## Models (ORM)
- Models defined in `models/` directory
- Using Sequelize as ORM
- Associations between models defined in `models/index.js`
- Validation both at model level (Sequelize) and API level (Joi)
- Database operations use Sequelize methods (findAll, findByPk, create, update, destroy)

### Core Models
- **User**: User accounts with authentication
- **Event**: Events with tickets, venue, organizer, type and artists
- **Ticket**: Purchased tickets for events
- **Banner**: Promotional banners for events with click tracking and analytics

### Extension Models
- **City**: Cities where venues are located
- **Venue**: Event venues with capacity and location
- **Organizer**: Event organizers/producers
- **Artist**: Artists performing at events
- **EventType**: Categories of events (concert, festival, etc.)
- **EventArtist**: Junction table for many-to-many relationship between events and artists
- **BannerClick**: Records clicks on promotional banners for analytics

## Data Access Patterns
- Direct access through Sequelize models
- Use of Sequelize associations for related data (include)
- Complex relationships (one-to-many, many-to-many)
- Table joins via Sequelize association includes
- Transactions for operations involving multiple tables
- Eager loading to minimize database queries
- Nested includes for multi-level relationships (e.g., Event > Venue > City)

## Validation
- Data validation uses Joi
- Validators are in the `validators/` directory, organized by resource
- Validation middleware in `middleware/validate.js`
- Apply validation with `validate(schema)` middleware in routes
- Password requirements: minimum 8 characters, includes uppercase, lowercase, number, and special character
- Secondary validation at model level with Sequelize validators

## Transaction Management
- Use transactions for operations that update multiple tables
- Always commit or rollback transactions to prevent hanging database connections
- Include error handling in transaction blocks
- Use locking when necessary to prevent race conditions (especially for ticket purchases)
- Multiple database operations in single atomic transactions
- Complex transactions for event creation with artists
- Foreign key constraints enforced at database level

## Authentication Implementation
- JWT tokens are used for authentication
- The middleware/auth.js middleware extracts and verifies tokens
- The role is included in the token and used for authorization
- The auth middleware extracts user id, email, and role to req.user
- Certain routes require admin role (getAllUsers, deleteUser, changeUserStatus)
- Test your role-based features with different account types

## Banner System Implementation
- Banners are promotional images that can be linked to events
- Only administrators can create, update, or delete banners
- Only one banner can be active at a time (activating one deactivates others)
- Banners can have scheduled display periods with start_date and end_date
- Banner clicks are tracked in the BannerClick model with analytics
- User agent and IP address are stored to analyze demographics
- Click analytics are broken down by day and user type (anonymous/registered)
- Banners are stored with title, description, image, and optional event link

## Entity Relationships
- User (1) → Tickets (N)
- Event (1) → Tickets (N)
- Event (N) ↔ Artist (N) via EventArtist
- Event (N) → Venue (1)
- Venue (N) → City (1)
- Event (N) → Organizer (1)
- Event (N) → EventType (1)
- Event (1) → Banners (N)
- Banner (1) → BannerClicks (N)
- User (1) → BannerClicks (N)

## API Endpoints and Security

### User Authentication
- `POST /api/auth/register` - Register a new user (public)
- `POST /api/auth/login` - Login with email/password and get a JWT token (public)
- `GET /api/auth/me` - Get basic information about the current user (authenticated)
- `GET /api/auth/profile` - Get complete profile information for the current user (authenticated)

### User Management
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get a specific user (admin or the user themselves)
- `PUT /api/users/:id` - Update a user (admin or the user themselves)
- `DELETE /api/users/:id` - Delete a user (admin only)
- `PATCH /api/users/:id/status` - Change user active status (admin only)
- `GET /api/users/my/tickets` - Get tickets for the current authenticated user (authenticated)
- `GET /api/users/:id/tickets` - Get tickets for a specific user (admin or the user themselves)

### Ticket Management
- `POST /api/tickets/buy` - Purchase a ticket for an event (authenticated)
- `GET /api/tickets/user` - Get tickets for the current user (authenticated)
- `GET /api/tickets/:id` - Get a specific ticket by ID (authenticated)

### City Management
- `GET /api/cities` - Get all cities (public)
- `GET /api/cities/:id` - Get a specific city (public)
- `POST /api/cities` - Create a new city (admin only)
- `PUT /api/cities/:id` - Update a city (admin only)
- `DELETE /api/cities/:id` - Delete a city (admin only)

### Banner Management
- `GET /api/banners` - Get all banners (admin only)
- `GET /api/banners/active` - Get the currently active banner (public)
- `GET /api/banners/featured` - Get featured banners (public)
- `POST /api/banners/:id/click` - Track a click on a banner (public)
- `GET /api/banners/:id/stats` - Get statistics for a banner (admin only)

## Security Implementation

### Authentication Levels
- **Public routes**: Accessible without authentication
- **Authenticated routes**: Require a valid JWT token
- **Admin-only routes**: Require a valid JWT token with admin role

### Rate Limiting
To protect the API from abuse, rate limiting is implemented with the following rules:

- **Global rate limit**: All API endpoints are protected by a rate limiter that restricts the number of requests from a single IP address (typically 100 requests per minute)
- **Authentication endpoints**: More strict rate limiting on login and register endpoints to prevent brute force attacks (typically 10 requests per minute)
- **Admin endpoints**: Slightly higher limits for admin users to support administrative operations

When rate limits are exceeded, the API returns a "429 Too Many Requests" status code.

### Route Protection Summary

#### Public Routes (No Authentication Required)
- User registration and login
- Listing and viewing events, venues, cities, artists, organizers, event types
- Viewing public banners and tracking banner clicks

#### Authenticated Routes (JWT Required)
- User profile access
- Ticket purchase and management
- Management of own user information

#### Admin-Only Routes (JWT with Admin Role Required)
- User management (listing all, deletion, status changes)
- City, venue, event type management (creation, modification, deletion)
- Banner management (creation, modification, deletion, statistics)
- Event creation and management
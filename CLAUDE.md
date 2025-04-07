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
- **Banner**: Promotional banners for events

### Extension Models
- **City**: Cities where venues are located
- **Venue**: Event venues with capacity and location
- **Organizer**: Event organizers/producers
- **Artist**: Artists performing at events
- **EventType**: Categories of events (concert, festival, etc.)
- **EventArtist**: Junction table for many-to-many relationship between events and artists

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

## Entity Relationships
- User (1) → Tickets (N)
- Event (1) → Tickets (N)
- Event (N) ↔ Artist (N) via EventArtist
- Event (N) → Venue (1)
- Venue (N) → City (1)
- Event (N) → Organizer (1)
- Event (N) → EventType (1)
- Event (1) → Banners (N)
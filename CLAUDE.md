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

## Data Access Patterns
- Direct access through Sequelize models
- Use of Sequelize associations for related data (include)
- Transactions for operations involving multiple tables
- Eager loading to minimize database queries

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
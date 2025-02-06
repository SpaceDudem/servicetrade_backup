# ServiceTrade Backup Tool

A robust tool for backing up ServiceTrade data to a local database.

## Project Structure

## Features

- 🔒 Secure authentication handling
- 📝 Full TypeScript support
- 🚦 Built-in rate limiting
- 📊 Comprehensive logging
- ⚡️ Promise-based API
- 🔄 Automatic token refresh

## Installation

Full documentation of ServiceTrade's API is available [here](https://api.servicetrade.com/api/docs).

See `example.js` for a usage example

## Development

- `npm run dev` - Run with hot reload
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code

## Architecture

### Core Components

1. **API Client** (`src/api/client.ts`)
   - Handles authentication
   - Manages API requests
   - Rate limiting
   - Error handling

2. **Backup Service** (`src/services/backup.ts`)
   - Orchestrates backup process
   - Handles pagination
   - Progress tracking
   - Error recovery

3. **Database Models** (`src/db/models/`)
   - Type-safe Sequelize models
   - Data validation
   - Relationship management

4. **Utilities** (`src/utils/`)
   - Logging
   - Progress reporting
   - State management
   - Error handling

## Error Handling

The tool implements multiple layers of error handling:

1. **API Level**
   - Authentication errors
   - Rate limiting
   - Network issues

2. **Database Level**
   - Connection errors
   - Constraint violations
   - Transaction management

3. **Business Logic**
   - Data validation
   - Dependency checks
   - State management

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

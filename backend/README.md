# Nexa Order Flow Backend

Complete order management system with smart assignment and ADL validation.

## Features

- 📋 Order management with customer details and GPS tracking
- 👨‍🔧 Smart master assignment based on distance, rating, and load
- 📸 ADL (Activity Daily Living) validation with GPS metadata extraction
- 🗄️ PostgreSQL database with automatic migration
- 🐳 Docker Compose support for easy local development
- 🧪 Comprehensive test suite with Jest
- 📚 OpenAPI/Swagger documentation
- 🔍 ESLint for code quality

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start PostgreSQL with Docker Compose:
```bash
docker compose up -d postgres
```

5. Run migrations:
```bash
npm run db:migrate
```

6. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Development

### Project Structure

```
backend/
├── src/
│   ├── app.js              # Express app setup
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic services
│   └── __tests__/          # Test files
├── docker-compose.yml      # Docker services
├── Dockerfile              # Backend Docker image
├── .env.example           # Environment variables template
├── openapi.yaml           # OpenAPI/Swagger spec
└── package.json           # Dependencies
```

### Environment Variables

See `.env.example` for all available configuration options.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

## API Documentation

- **OpenAPI Spec**: `openapi.yaml`
- **Postman Collection**: `nexa-order-flow.postman_collection.json`

Import the Postman collection or visit the Swagger UI for interactive API documentation.

## Docker Development

Start all services with Docker Compose:

```bash
docker compose up
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3001

To stop all services:

```bash
docker compose down
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/v1/orders` - List all orders
- `GET /api/v1/orders/:id` - Get order by ID
- `POST /api/v1/orders` - Create new order
- `POST /api/v1/orders/:id/assign` - Assign master to order
- `POST /api/v1/orders/:id/adl` - Upload ADL file
- `POST /api/v1/orders/:id/complete` - Complete order
- `GET /api/v1/masters` - List all masters

## Testing

The test suite includes:

- **Unit tests** for GPS extraction and validation
- **Integration tests** for order routes
- **Edge case testing** for boundaries and error handling
- **Validation tests** for input data

Tests are located in `src/__tests__/` and include:
- `gpsService.test.js` - GPS metadata extraction
- `orderRoutes.test.js` - Order API endpoints
- `haversineService.test.js` - Distance calculations
- `validation.test.js` - Input validation

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push:
- Linting with ESLint
- Unit and integration tests
- Docker build verification

## License

MIT

## Support

For issues or questions, please contact the Nexa Team.


# Nexa Order Flow MVP

A complete order management system with master assignment and ADL (Activity Data Logging) validation, structured as a microservice architecture with PostgreSQL database.

## 🏗️ Project Structure

```
nexa-order-flow/
├── backend/                 # Backend API service
│   ├── src/
│   │   ├── app.js          # Main Express application
│   │   ├── controllers/   # Request handlers
│   │   │   ├── orderController.js
│   │   │   └── masterController.js
│   │   ├── routes/        # Route definitions
│   │   │   ├── index.js   # Health and info routes
│   │   │   └── orderRoutes.js
│   │   ├── services/      # Business logic
│   │   │   ├── index.js
│   │   │   ├── databaseService.js
│   │   │   ├── assignmentService.js
│   │   │   └── adlValidationService.js
│   │   └── scripts/       # Database scripts
│   │       ├── migrate.js
│   │       └── seed.js
│   ├── package.json
│   ├── tsconfig.json
│   ├── docker-compose.yml  # PostgreSQL setup
│   ├── init.sql           # Database initialization
│   └── env.example        # Environment variables template
├── frontend/               # React frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx    # Main React component
│   │   │   ├── components/ # Reusable components
│   │   │   ├── pages/     # Page components
│   │   │   ├── services/  # API services
│   │   │   └── styles/    # CSS styles
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   └── vite.config.ts
│   └── env.example        # Frontend environment variables template
├── package.json            # Root workspace configuration
├── README.md
└── setup.sh/.bat          # Setup scripts
```

## 🚀 Features

- **Order Management**: Create, assign, and complete orders
- **Smart Assignment**: Assign masters based on distance (Haversine), rating, and current load
- **ADL Validation**: Enforce photo/video uploads with GPS coordinates and timestamps
- **RESTful API**: Complete API endpoints for all operations
- **React UI**: Modern operator interface for testing
- **PostgreSQL Database**: Robust, scalable database with proper indexing
- **Microservice Architecture**: Separate backend and frontend services
- **Clean Architecture**: Controllers, Routes, Services pattern

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, PostgreSQL, ES Modules
- **Frontend**: React, TypeScript, Vite
- **Database**: PostgreSQL with UUID primary keys
- **File Processing**: Sharp, ExifR for metadata extraction
- **Geolocation**: Haversine distance calculation
- **Workspace Management**: npm workspaces

## 📋 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+ (or Docker)
- npm or yarn

### Database Setup

#### Option 1: Using Docker (Recommended)
```bash
# Start PostgreSQL with Docker Compose
cd backend
docker-compose up -d

# Wait for PostgreSQL to be ready
docker-compose logs -f postgres
```

#### Option 2: Local PostgreSQL Installation
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Install PostgreSQL (Windows)
# Download from https://www.postgresql.org/download/windows/

# Create database
createdb nexa_order_flow
```

### Environment Configuration
```bash
# Copy backend environment template
cp backend/env.example backend/.env

# Copy frontend environment template
cp frontend/env.example frontend/.env

# Edit environment variables
# Update database credentials and API URLs if needed
```

### Installation

```bash
# Install all dependencies (root + backend + frontend)
npm run install-all

# Build the entire project
npm run build

# Start backend server
npm run start:backend

# In another terminal, start frontend
npm run start:frontend
```

### Development Mode

```bash
# Start both backend and frontend in development mode
npm run dev:all

# Or start them separately:
npm run dev:backend    # Backend with hot reload
npm run dev:frontend   # Frontend with hot reload
```

## 🗄️ Database Schema

### PostgreSQL Tables

#### Masters Table
```sql
CREATE TABLE masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  active_orders INTEGER DEFAULT 0 CHECK (active_orders >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed')),
  master_id UUID REFERENCES masters(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);
```

#### ADL Attachments Table
```sql
CREATE TABLE adl_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('photo', 'video')),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Database Features
- **UUID Primary Keys**: Better for distributed systems
- **Constraints**: Data integrity with CHECK constraints
- **Indexes**: Optimized queries with proper indexing
- **Foreign Keys**: Referential integrity
- **Time Zones**: Proper timestamp handling
- **Connection Pooling**: Efficient database connections

## 🔌 API Endpoints

### Health & Info
- `GET /api/health` - Health check with database status
- `GET /api` - API information

### Orders (v1)
- `POST /api/v1/orders` - Create a new order
- `GET /api/v1/orders` - Get all orders
- `GET /api/v1/orders/:id` - Get order details
- `POST /api/v1/orders/:id/assign` - Assign master to order
- `POST /api/v1/orders/:id/adl` - Upload ADL (photo/video + GPS)
- `POST /api/v1/orders/:id/complete` - Complete order

### Masters (v1)
- `GET /api/v1/masters` - List all masters
- `GET /api/v1/masters/:id` - Get master details

## 📊 Example Flow

### 1. Create Order
```bash
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_phone": "+1234567890",
    "address": "123 Main St, New York, NY",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "description": "Kitchen repair needed"
  }'
```

### 2. Assign Master
```bash
curl -X POST http://localhost:3001/api/v1/orders/ORDER_ID/assign \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "maxDistance": 50
  }'
```

### 3. Upload ADL
```bash
curl -X POST http://localhost:3001/api/v1/orders/ORDER_ID/adl \
  -F "file=@photo.jpg"
```

### 4. Complete Order
```bash
curl -X POST http://localhost:3001/api/v1/orders/ORDER_ID/complete
```

## 🎯 Assignment Algorithm

Masters are assigned based on priority:

1. **Distance**: Haversine formula for geographic proximity
2. **Rating**: Higher rated masters preferred (0-5 scale)
3. **Load**: Masters with fewer active orders preferred

### Assignment Criteria
- Maximum distance: 50km (configurable)
- Rating weight: 20%
- Load weight: 10%
- Distance weight: 70%

## 📸 ADL Requirements

### File Requirements
- **Types**: JPEG, PNG, MP4, MOV
- **Size**: Maximum 10MB
- **GPS**: Must contain embedded GPS coordinates
- **Timestamp**: Must be recent (within 24 hours)

### Validation Process
1. File type and size validation
2. GPS metadata extraction from EXIF data
3. Timestamp validation
4. Database storage with metadata

## 🧪 Testing the System

### Using the React UI
1. Open http://localhost:3000
2. Create a new order with customer details
3. Assign a master (system will find the best match)
4. Upload a photo/video with GPS data
5. Complete the order

### Using cURL/Postman
Follow the example flow above with the provided cURL commands.

### Automated Testing
```bash
# Run automated API tests
chmod +x test-api.sh
./test-api.sh
```

## 🔧 Workspace Commands

### Root Level Commands
```bash
npm run install-all      # Install all dependencies
npm run build           # Build both backend and frontend
npm run start:backend   # Start backend server
npm run start:frontend  # Start frontend dev server
npm run dev:all         # Start both in development mode
npm run test            # Run all tests
npm run clean           # Clean all build artifacts
```

### Backend Commands
```bash
cd backend
npm run build          # Build backend
npm start              # Start production server
npm run dev            # Start development server
npm run db:migrate     # Run database migrations
npm run db:seed        # Seed database with sample data
npm test               # Run backend tests
npm run lint           # Lint backend code
```

### Frontend Commands
```bash
cd frontend
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm test               # Run frontend tests
npm run lint           # Lint frontend code
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
- `DB_HOST`: PostgreSQL host (default: localhost)
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_NAME`: Database name (default: nexa_order_flow)
- `DB_USER`: Database user (default: postgres)
- `DB_PASSWORD`: Database password (default: password)
- `PORT`: Backend server port (default: 3001)
- `CORS_ORIGIN`: CORS origin for frontend (default: http://localhost:3000)
- `NODE_ENV`: Environment mode (development/production)

#### Frontend (.env)
- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:3001)
- `VITE_APP_NAME`: Application name (default: Nexa Order Flow MVP)
- `VITE_APP_VERSION`: Application version (default: 1.0.0)
- `VITE_NODE_ENV`: Environment mode (default: development)
- `VITE_ENABLE_DEBUG`: Enable debug mode (default: true)
- `VITE_ENABLE_MOCK_DATA`: Enable mock data (default: false)
- `VITE_MAX_FILE_SIZE`: Maximum file size in bytes (default: 10485760)
- `VITE_ALLOWED_FILE_TYPES`: Comma-separated allowed file types
- `VITE_MAP_API_KEY`: Map API key (optional)
- `VITE_ANALYTICS_ID`: Analytics ID (optional)

### File Upload Settings
- Upload directory: `./uploads`
- Maximum file size: 10MB
- Allowed types: image/jpeg, image/png, video/mp4, video/quicktime

## 🚨 Error Handling

The system includes comprehensive error handling for:
- Database connection issues
- Invalid file uploads
- Missing GPS data
- Assignment failures
- Order status validation
- Input validation with detailed error messages

## 📈 Performance Considerations

- **PostgreSQL**: Robust, scalable database
- **Connection Pooling**: Efficient database connections
- **Indexes**: Optimized queries for better performance
- **File cleanup**: Automatic cleanup of old uploads
- **Efficient Haversine**: Optimized distance calculation
- **Separate services**: Frontend and backend for scalability

## 🔒 Security Notes

- **Prepared Statements**: SQL injection prevention
- **File type validation**: Secure file uploads
- **File size limits**: Prevent DoS attacks
- **GPS data validation**: Ensure data integrity
- **Input sanitization**: XSS prevention
- **CORS configuration**: Secure cross-origin requests
- **Helmet**: Security headers
- **Environment variables**: Secure configuration

## 🐳 Docker Support

### PostgreSQL with Docker Compose
```bash
# Start PostgreSQL
cd backend
docker-compose up -d

# Check logs
docker-compose logs -f postgres

# Stop PostgreSQL
docker-compose down
```

### Database Management
```bash
# Connect to PostgreSQL
docker exec -it nexa-postgres psql -U postgres -d nexa_order_flow

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

## 🤝 Contributing

This is an MVP implementation. For production use, consider:
- **Database**: Connection pooling optimization
- **Caching**: Redis for frequently accessed data
- **Authentication**: JWT or OAuth2
- **Rate Limiting**: Prevent API abuse
- **Monitoring**: Comprehensive logging and metrics
- **Testing**: Unit and integration tests
- **CI/CD**: Automated deployment pipeline
- **Scaling**: Horizontal scaling with load balancers

## 📄 License

MIT License - see LICENSE file for details.

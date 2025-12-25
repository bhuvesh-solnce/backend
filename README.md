# Backend API Server

Express.js backend server with Sequelize ORM and MySQL database.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with the following variables:
```env
# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
# Option 1: Single frontend URL (default)
FRONTEND_URL=http://localhost:3000

# Option 2: Multiple allowed origins (comma-separated)
# ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://yourapp.com,https://api-client.example.com

# Option 3: Development mode - allow all origins (NOT for production!)
# CORS_ALLOW_ALL=true

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

3. Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

The server will run on `http://localhost:4000` (or the port specified in `.env`).

## API Endpoints

### Base URL
- `http://localhost:4000/api`

### Available Endpoints

- `POST /api/common/test-connection` - Test connection endpoint
  ```json
  {
    "message": "Hello Backend!"
  }
  ```

- `GET /api/common/health` - Health check endpoint

- `GET /` - Root endpoint

## Project Structure

```
backend/
├── src/
│   ├── app.js              # Express app configuration
│   ├── routes/
│   │   ├── index.js        # Main router (mounts all route modules)
│   │   ├── common/
│   │   │   └── common.routes.js  # Common routes (health, test-connection)
│   │   └── README.md       # Route structure documentation
│   └── config/
│       └── database.js     # Database configuration
├── server.js               # Server entry point
└── package.json
```

## Multi-Application Support

The backend can accept requests from multiple applications and APIs. Configure CORS using one of these methods:

### Option 1: Single Application (Default)
Set `FRONTEND_URL` in your `.env`:
```env
FRONTEND_URL=http://localhost:3000
```

### Option 2: Multiple Applications (Recommended)
Set `ALLOWED_ORIGINS` with comma-separated URLs:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://your-app.com,https://mobile-app.example.com
```
This allows requests from:
- Your Next.js frontend
- Mobile applications
- Third-party integrations
- Other microservices
- Postman/API testing tools (originless requests are allowed)

### Option 3: Development Mode (Allow All)
⚠️ **Only for development/testing:**
```env
NODE_ENV=development
CORS_ALLOW_ALL=true
```
This allows requests from any origin. **Never use in production!**

### Supported HTTP Methods
- GET, POST, PUT, DELETE, PATCH, OPTIONS

### Supported Headers
- Content-Type
- Authorization
- X-Requested-With

### Examples

**Frontend Application:**
```javascript
fetch('http://localhost:4000/api/common/test-connection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ message: 'Hello' })
});
```

**Mobile App or External API:**
```javascript
// Just include the origin in ALLOWED_ORIGINS
axios.post('http://your-backend:4000/api/common/test-connection', {
  message: 'Hello from external app'
}, {
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});
```

**cURL / Postman:**
```bash
curl -X POST http://localhost:4000/api/common/test-connection \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from cURL"}'
```
Note: Originless requests (like cURL) are automatically allowed.

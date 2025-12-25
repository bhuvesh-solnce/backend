# Backend Routes Structure

This directory contains modular route files organized by feature.

## Structure

```
routes/
├── index.js              # Main router that mounts all route modules
├── common/
│   └── common.routes.js  # Common routes (health, test-connection)
└── README.md
```

## Adding New Routes

### 1. Create a new route file

Create a new file in the appropriate directory:

```javascript
// routes/admin/admin.routes.js
const router = require('express').Router();

const initRoutes = () => {
  router.post('/users', (req, res) => {
    // Your route handler
    res.json({ message: 'Get users' });
  });

  router.post('/users/:id', (req, res) => {
    // Your route handler
    res.json({ message: 'Get user by id' });
  });

  return router;
};

module.exports = initRoutes;
```

### 2. Mount the route in index.js

```javascript
// routes/index.js
const adminRoute = require('./admin/admin.routes');

const initRoutes = () => {
  router.use('/admin', adminRoute());
  // ... other routes
  return router;
};
```

### 3. Access the route

The route will be available at: `/api/admin/users`

## Example Route Files

- `common/common.routes.js` - Common utilities (health check, test connection)
- `admin/admin.routes.js` - Admin-specific routes
- `user/user.routes.js` - User management routes
- `vendor/vendor.routes.js` - Vendor management routes

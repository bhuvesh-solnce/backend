# Backend Middleware

This directory contains Express middleware for authentication and authorization.

## Middleware Files

### `auth.middleware.js`
Authentication middleware that verifies JWT tokens and attaches user data to the request.

**Features:**
- Verifies JWT from cookie (`authToken`) or Authorization header
- Fetches user with role and permissions from database
- Attaches user object to `req.user`
- Handles token expiration and invalid tokens

**Usage:**
```javascript
const authenticate = require('./middleware/auth.middleware');

router.get('/protected', authenticate, (req, res) => {
  // req.user is now available
  res.json({ user: req.user });
});
```

### `permission.middleware.js`
Authorization middleware that checks user permissions.

**Exports:**
- `requirePermission(slug)` - Requires a single permission
- `requireAnyPermission([slugs])` - Requires any one of the permissions
- `requireAllPermissions([slugs])` - Requires all permissions

**Usage:**

Single Permission:
```javascript
const { requirePermission } = require('./middleware/permission.middleware');
const authenticate = require('./middleware/auth.middleware');

router.get('/projects', authenticate, requirePermission('projects.view'), getProjects);
router.post('/projects', authenticate, requirePermission('projects.create'), createProject);
router.put('/projects/:id', authenticate, requirePermission('projects.edit'), updateProject);
router.delete('/projects/:id', authenticate, requirePermission('projects.delete'), deleteProject);
```

Multiple Permissions (Any):
```javascript
const { requireAnyPermission } = require('./middleware/permission.middleware');

router.get('/projects', authenticate, requireAnyPermission(['projects.view', 'projects.view.all']), getProjects);
```

Multiple Permissions (All):
```javascript
const { requireAllPermissions } = require('./middleware/permission.middleware');

router.post('/projects/:id/approve', authenticate, requireAllPermissions(['projects.edit', 'projects.approve']), approveProject);
```

## Admin Bypass

All permission middleware automatically grants access to Admin users (role_id === 1).

## Example Route Implementation

```javascript
const router = require('express').Router();
const authenticate = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/permission.middleware');
const ProjectsController = require('../../controllers/projects/projects.controller');

// Public route (no auth)
router.get('/public', (req, res) => {
  res.json({ message: 'Public endpoint' });
});

// Protected route (auth only)
router.get('/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Protected route with permission check
router.get('/', authenticate, requirePermission('projects.view'), ProjectsController.getAll);
router.post('/', authenticate, requirePermission('projects.create'), ProjectsController.create);
router.get('/:id', authenticate, requirePermission('projects.view'), ProjectsController.getById);
router.put('/:id', authenticate, requirePermission('projects.edit'), ProjectsController.update);
router.delete('/:id', authenticate, requirePermission('projects.delete'), ProjectsController.delete);

module.exports = router;
```

## Error Responses

### Authentication Errors (401)
```json
{
  "message": "Authentication required"
}
```

### Permission Errors (403)
```json
{
  "message": "Forbidden: Insufficient permissions",
  "required": "projects.view"
}
```

## Notes

- Always use `authenticate` middleware before permission middleware
- Permission middleware will fail if `authenticate` wasn't called first
- Admin users (role_id === 1) bypass all permission checks
- Permissions are loaded from database on each request (not cached from JWT)


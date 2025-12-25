# Stored Procedures

This directory contains MySQL stored procedures for database operations. Procedures are automatically loaded when the server starts.

## Structure

```
procedures/
├── index.js              # Procedure loader
├── auth/                 # Authentication-related procedures
│   ├── sp_create_user.sql
│   ├── sp_change_password.sql
│   ├── sp_get_user_by_email.sql
│   ├── sp_get_user_by_id.sql
│   ├── sp_update_last_login.sql
│   ├── sp_activate_user.sql
│   └── sp_deactivate_user.sql
└── README.md
```

## How It Works

The `index.js` file recursively scans the procedures directory and executes all `.sql` files. It:
1. Drops existing procedures/functions with the same name
2. Creates new procedures from SQL files
3. Handles nested folders

## Available Procedures

### Authentication Procedures

#### `sp_create_user`
Creates a new user in the database.

**Parameters:**
- `p_username` (VARCHAR): Username
- `p_email` (VARCHAR): Email address
- `p_password` (VARCHAR): Hashed password (should be hashed before calling)
- `p_first_name` (VARCHAR, optional): First name
- `p_last_name` (VARCHAR, optional): Last name
- `p_phone` (VARCHAR, optional): Phone number
- `p_role` (ENUM, optional): User role (defaults to 'user')

**Output:**
- `p_user_id` (INT): ID of created user
- `p_success` (BOOLEAN): Success status
- `p_message` (VARCHAR): Status message

#### `sp_change_password`
Changes a user's password.

**Parameters:**
- `p_user_id` (INT): User ID
- `p_new_password` (VARCHAR): New hashed password (should be hashed before calling)

**Output:**
- `p_success` (BOOLEAN): Success status
- `p_message` (VARCHAR): Status message

#### `sp_get_user_by_email`
Retrieves a user by email address.

**Parameters:**
- `p_email` (VARCHAR): Email address

**Returns:** User record (without password in some cases)

#### `sp_get_user_by_id`
Retrieves a user by ID.

**Parameters:**
- `p_user_id` (INT): User ID

**Returns:** User record (without password)

#### `sp_update_last_login`
Updates the last login timestamp for a user.

**Parameters:**
- `p_user_id` (INT): User ID

**Output:**
- `p_success` (BOOLEAN): Success status
- `p_message` (VARCHAR): Status message

#### `sp_activate_user`
Activates a user account.

**Parameters:**
- `p_user_id` (INT): User ID

**Output:**
- `p_success` (BOOLEAN): Success status
- `p_message` (VARCHAR): Status message

#### `sp_deactivate_user`
Deactivates a user account.

**Parameters:**
- `p_user_id` (INT): User ID

**Output:**
- `p_success` (BOOLEAN): Success status
- `p_message` (VARCHAR): Status message

## Usage in Code

Procedures are accessed through the `ProceduresService` class:

```javascript
const ProceduresService = require('../services/procedures.service');

// Create user
const result = await ProceduresService.createUser({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'plaintext_password', // Will be hashed automatically
  first_name: 'John',
  last_name: 'Doe',
  role: 'user'
});

// Get user by email
const user = await ProceduresService.getUserByEmail('john@example.com');

// Change password
await ProceduresService.changePassword(userId, 'new_plaintext_password');

// Update last login
await ProceduresService.updateLastLogin(userId);
```

## Important Notes

1. **Password Hashing**: All passwords are hashed using bcrypt in the application layer before being passed to stored procedures. MySQL stored procedures do not perform password hashing.

2. **Password Comparison**: Password verification (comparing plain text with hash) must be done in the application layer using bcrypt, as MySQL doesn't have bcrypt functionality.

3. **Output Parameters**: Procedures with output parameters require two separate queries - one to call the procedure and one to retrieve the output values.

4. **Error Handling**: All procedures include transaction handling and error management.

5. **Soft Deletes**: Procedures respect the `deleted_at` field for soft deletes.

## Adding New Procedures

1. Create a new `.sql` file in the appropriate subdirectory (or create a new one)
2. Follow the naming convention: `sp_<procedure_name>.sql`
3. The procedure will be automatically loaded on server startup
4. Add corresponding methods to `ProceduresService` if needed

## Example: Adding a New Procedure

1. Create `procedures/auth/sp_get_active_users.sql`:

```sql
DELIMITER $$

CREATE PROCEDURE sp_get_active_users()
BEGIN
    SELECT id, username, email, role, first_name, last_name, created_at
    FROM users
    WHERE is_active = 1
    AND deleted_at IS NULL
    ORDER BY created_at DESC;
END$$

DELIMITER ;
```

2. Add method to `ProceduresService`:

```javascript
static async getActiveUsers() {
  const [results] = await sequelize.query('CALL sp_get_active_users()');
  return results[0] || [];
}
```

3. Restart the server - the procedure will be automatically loaded!

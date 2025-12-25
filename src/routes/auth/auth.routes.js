const router = require('express').Router();
const AuthController = require('../../controllers/auth/auth.controller');

// Note: No authentication middleware needed for login/register
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

module.exports = router;
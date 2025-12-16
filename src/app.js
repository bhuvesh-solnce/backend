const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import Routes (You will create these later)
// const workflowRoutes = require('./routes/workflow.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json()); // Parser for JSON body

// Note: Initialize Casbin in server.js after database connection
// Casbin will be available through the authorization middleware

// Routes
app.get('/', (req, res) => res.json({ message: "Dynamic Backend Running" }));

module.exports = app;
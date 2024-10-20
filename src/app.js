const express = require('express');
const apiRoutes = require('./routes/apiRoutes'); // Importing routes
const { checkWhitelist } = require('./middleware/accessControl');  // Importing middleware

const app = express();

app.use(express.json());

// This middleware checks whitelist first, and if the IP isn't whitelisted, it checks the blacklist
app.use(checkWhitelist); // Automatically calls checkBlacklist if not whitelisted

// Use API routes
app.use('/api', apiRoutes);

// Global error handler (optional, for catching errors)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports = app;

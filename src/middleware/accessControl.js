const db = require('../utils/db'); // Importing the database connection

// Middleware to check if an IP is blacklisted
exports.checkBlacklist = (req, res, next) => {
    const userIP = req.ip || req.connection.remoteAddress;

    const sql = `SELECT COUNT(*) AS count FROM blacklist WHERE ip_address = ?`;
    
    db.query(sql, [userIP], (err, results) => {
        if (err) {
            console.error('Database error while checking blacklist:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        const isBlacklisted = results[0]?.count > 0;

        if (isBlacklisted) {
            return res.status(403).json({ message: 'Your IP is blacklisted.' });
        }

        next(); // Allow the request to proceed if not blacklisted
    });
};

// Middleware to check if an IP is whitelisted (Optional)
exports.checkWhitelist = (req, res, next) => {
    const userIP = req.ip || req.connection.remoteAddress;

    const sql = `SELECT COUNT(*) AS count FROM whitelist WHERE ip_address = ?`;
    
    db.query(sql, [userIP], (err, results) => {
        if (err) {
            console.error('Database error while checking whitelist:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        const isWhitelisted = results[0]?.count > 0;

        if (isWhitelisted) {
            return next(); // Skip blacklist check if IP is whitelisted
        }

        // If not whitelisted, proceed to check blacklist
        exports.checkBlacklist(req, res, next);
    });
};

// Adding IP to Blacklist
exports.addToBlacklist = (req, res) => {
    const { ip_address } = req.body;

    const sql = `INSERT INTO blacklist (ip_address) VALUES (?)`;

    db.query(sql, [ip_address], (err, result) => {
        if (err) {
            console.error('Database error while adding to blacklist:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        res.json({ message: `IP ${ip_address} has been blacklisted.` });
    });
};

// Removing IP from Blacklist
exports.removeFromBlacklist = (req, res) => {
    const { ip_address } = req.body;

    const sql = `DELETE FROM blacklist WHERE ip_address = ?`;

    db.query(sql, [ip_address], (err, result) => {
        if (err) {
            console.error('Database error while removing from blacklist:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        res.json({ message: `IP ${ip_address} has been removed from the blacklist.` });
    });
};

// Adding IP to Whitelist
exports.addToWhitelist = (req, res) => {
    const { ip_address } = req.body;

    const sql = `INSERT INTO whitelist (ip_address) VALUES (?)`;

    db.query(sql, [ip_address], (err, result) => {
        if (err) {
            console.error('Database error while adding to whitelist:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        res.json({ message: `IP ${ip_address} has been whitelisted.` });
    });
};

// Removing IP from Whitelist
exports.removeFromWhitelist = (req, res) => {
    const { ip_address } = req.body;

    const sql = `DELETE FROM whitelist WHERE ip_address = ?`;

    db.query(sql, [ip_address], (err, result) => {
        if (err) {
            console.error('Database error while removing from whitelist:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        res.json({ message: `IP ${ip_address} has been removed from the whitelist.` });
    });
};

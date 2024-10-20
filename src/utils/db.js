const mysql = require('mysql2'); // Importing MySQL library

// Create a connection to the database
const db = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USERNAME,
    password: process.env.PASS,
    database: process.env.DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// Connect to the database
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack); // Handle connection error
        process.exit(1); // Exit process if the connection fails
    } else {
        console.log('Connected to the database!');
        connection.release(); // Release the connection back to the pool
    }
});

module.exports = db;

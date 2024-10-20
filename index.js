require('dotenv').config();

const app = require('./src/app');
const PORT = process.env.PORT;

const startServer = () => {
    try {
        // Start listening for incoming requests
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        // Handle graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM signal received: closing HTTP server');
            server.close(() => {
                console.log('HTTP server closed');
                process.exit(0); // Exit process after closing the server
            });
        });

    } catch (error) {
        console.error('Error starting the server:', error.stack || error);
        process.exit(1); // Exit the application with failure
    }
};
 // Check if it prints the value from your .env file

startServer(); // Start the server safely

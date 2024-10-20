const db = require('./db'); // Importing the database connection

exports.checkCapacity = (locationId, currentParticipants, callback) => {
    const sql = `
        SELECT capacity 
        FROM locations 
        WHERE location_id = ?`;

    db.query(sql, [locationId], (err, results) => {
        if (err) {
            console.error('Database error while checking capacity:', err);
            return callback(err, null); // Handle error
        }

        // Check if results are empty
        if (results.length === 0) {
            return callback(new Error('Location not found'), null); // Location ID does not exist
        }

        const capacity = results[0]?.capacity; // Get venue capacity

        // Check if current participants exceed capacity
        if (currentParticipants >= capacity) {
            return callback(new Error('Venue capacity exceeded'), null);
        }
        callback(null); // Capacity is respected
    });
};

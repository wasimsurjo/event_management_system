const db = require('../utils/db'); // Importing database connection


exports.getEventsByDate = (req, res) => {
    const { date } = req.query; // Fetch date from query parameters
    const sql = 'SELECT * FROM events WHERE event_date = ?';
    
    try {
        db.query(sql, [date], (err, results) => {
            if (err) {
                console.error('Database error while fetching events by date:', err); // Log error
                return res.status(500).json({ message: 'Database error', error: err });
            }
            res.json(results); // Return the results as JSON
        });
    } catch (error) {
        console.error('Unexpected error occurred while fetching events by date:', error);
        res.status(500).json({ message: 'Unexpected error occurred', error: error.message });
    }
};

exports.getParticipantsByStatus = (req, res) => {
    const { status } = req.query; // Fetch status from query parameters
    const sql = 'SELECT * FROM participants WHERE status = ?';
    
    try {
        db.query(sql, [status], (err, results) => {
            if (err) {
                console.error('Database error while fetching participants by status:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Unexpected error occurred while fetching participants by status:', error);
        res.status(500).json({ message: 'Unexpected error occurred', error: error.message });
    }
};

exports.getFeedbackByEventId = (req, res) => {
    const { eventId } = req.params; // Fetch event ID from params
    const sql = 'SELECT * FROM feedback WHERE event_id = ?';
    
    try {
        db.query(sql, [eventId], (err, results) => {
            if (err) {
                console.error('Database error while fetching feedback:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Unexpected error occurred while fetching feedback:', error);
        res.status(500).json({ message: 'Unexpected error occurred', error: error.message });
    }
};

exports.getSponsorsByEventId = (req, res) => {
    const { eventId } = req.params; // Fetch event ID from params
    const sql = 'SELECT * FROM sponsors WHERE event_id = ?';
    
    try {
        db.query(sql, [eventId], (err, results) => {
            if (err) {
                console.error('Database error while fetching sponsors:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Unexpected error occurred while fetching sponsors:', error);
        res.status(500).json({ message: 'Unexpected error occurred', error: error.message });
    }
};

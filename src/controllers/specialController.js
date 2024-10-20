const { query, param, validationResult } = require('express-validator');
const db = require('../utils/db'); // Importing database connection

// Event controller methods

// Get Events by Date with validation
exports.getEventsByDate = [
    query('date').isISO8601().withMessage('Valid date is required'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { date } = req.query;
        const sql = 'SELECT * FROM events WHERE event_date = ?';

        try {
            db.query(sql, [date], (err, results) => {
                if (err) {
                    console.error('Database error while fetching events by date:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                if (results.length === 0) {
                    return res.status(404).json({ message: 'No events found for this date' });
                }
                res.json(results); // Return the results as JSON
            });
        } catch (error) {
            console.error('Unexpected error occurred while fetching events by date:', error);
            res.status(500).json({ message: 'Unexpected error occurred', error: error.message });
        }
    }
];

// Get Participants by Status with validation
exports.getParticipantsByStatus = [
    query('status').isIn(['registered', 'canceled', 'waitlisted']).withMessage('Invalid status'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { status } = req.query;
        const sql = 'SELECT * FROM participants WHERE status = ?';

        try {
            db.query(sql, [status], (err, results) => {
                if (err) {
                    console.error('Database error while fetching participants by status:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                if (results.length === 0) {
                    return res.status(404).json({ message: 'No participants found for this status' });
                }
                res.json(results);
            });
        } catch (error) {
            console.error('Unexpected error occurred while fetching participants by status:', error);
            res.status(500).json({ message: 'Unexpected error occurred', error: error.message });
        }
    }
];

// Get Feedback by Event ID with validation
exports.getFeedbackByEventId = [
    param('eventId').isInt().withMessage('Event ID must be an integer'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { eventId } = req.params;
        const sql = 'SELECT * FROM feedback WHERE event_id = ?';

        try {
            db.query(sql, [eventId], (err, results) => {
                if (err) {
                    console.error('Database error while fetching feedback:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                if (results.length === 0) {
                    return res.status(404).json({ message: 'No feedback found for this event' });
                }
                res.json(results);
            });
        } catch (error) {
            console.error('Unexpected error occurred while fetching feedback:', error);
            res.status(500).json({ message: 'Unexpected error occurred', error: error.message });
        }
    }
];

// Get Sponsors by Event ID with validation
exports.getSponsorsByEventId = [
    param('eventId').isInt().withMessage('Event ID must be an integer'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { eventId } = req.params;
        const sql = 'SELECT * FROM sponsors WHERE event_id = ?';

        try {
            db.query(sql, [eventId], (err, results) => {
                if (err) {
                    console.error('Database error while fetching sponsors:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                if (results.length === 0) {
                    return res.status(404).json({ message: 'No sponsors found for this event' });
                }
                res.json(results);
            });
        } catch (error) {
            console.error('Unexpected error occurred while fetching sponsors:', error);
            res.status(500).json({ message: 'Unexpected error occurred', error: error.message });
        }
    }
];

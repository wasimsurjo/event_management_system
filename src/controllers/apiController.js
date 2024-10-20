const { body, validationResult } = require('express-validator');
const db = require('../utils/db'); // Importing database connection
const { checkCapacity } = require('../utils/capacityCheck');

// Event controller methods
exports.getAllEvents = (req, res) => {
    const sql = 'SELECT * FROM events';
    try {
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Database error while fetching events:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Unexpected error occurred while fetching events:', error);
        res.status(500).json({ message: 'Unexpected error occurred', error: error.message });
    }
};

exports.createEvent = [
    body('name').isString().notEmpty().withMessage('Event name is required.'),
    body('event_date').isDate().withMessage('Valid event date is required.'),
    body('description').optional().isString(),
    body('organizer_name').optional().isString(),
    body('location_id').isInt().withMessage('Valid location ID is required.'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const newEvent = req.body;

        // Get current participants count for the specific event
        const sqlParticipantsCount = `
            SELECT COUNT(*) AS count 
            FROM event_participants 
            WHERE event_id = ?`;

        db.query(sqlParticipantsCount, [newEvent.event_id], (err, countResults) => {
            if (err) {
                console.error('Database error while counting participants:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }

            const currentCount = countResults[0]?.count || 0;

            // Call the capacity check function
            checkCapacity(newEvent.location_id, currentCount, (err) => {
                if (err) {
                    return res.status(400).json({ message: err.message });
                }

                const sql = 'INSERT INTO events SET ?';
                db.query(sql, newEvent, (err, result) => {
                    if (err) {
                        console.error('Database error while creating event:', err);
                        return res.status(500).json({ message: 'Database error', error: err });
                    }
                    res.json({ message: 'Event created', eventId: result.insertId });
                });
            });
        });
    }
];

exports.updateEvent = [
    body('name').optional().isString(),
    body('event_date').optional().isDate(),
    body('description').optional().isString(),
    body('organizer_name').optional().isString(),
    body('location_id').optional().isInt(),
    (req, res) => {
        const { id } = req.params; // Event ID from the request parameters
        const updatedEvent = req.body; // The updated event data

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Get current participants count for the event
        const sqlParticipantsCount = `
            SELECT COUNT(*) AS count 
            FROM event_participants 
            WHERE event_id = ?`;

        db.query(sqlParticipantsCount, [id], (err, countResults) => {
            if (err) {
                console.error('Database error while counting participants:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }

            const currentCount = countResults[0]?.count || 0; // Get current participant count

            // Check if location_id is being updated
            if (updatedEvent.location_id) {
                // Check capacity with new location
                checkCapacity(updatedEvent.location_id, currentCount, (err) => {
                    if (err) {
                        return res.status(400).json({ message: err.message });
                    }
                    // Proceed to update the event
                    const sql = 'UPDATE events SET ? WHERE event_id = ?'; 
                    db.query(sql, [updatedEvent, id], (err, result) => {
                        if (err) {
                            console.error('Database error while updating event:', err);
                            return res.status(500).json({ message: 'Database error', error: err });
                        }
                        if (result.affectedRows === 0) {
                            return res.status(404).json({ message: 'Event not found' });
                        }
                        res.json({ message: 'Event updated' });
                    });
                });
            } else {
                // If location_id is not updated, check capacity with current location
                const sqlCurrentLocation = 'SELECT location_id FROM events WHERE event_id = ?';
                db.query(sqlCurrentLocation, [id], (err, locationResults) => {
                    if (err) {
                        console.error('Database error while getting current location:', err);
                        return res.status(500).json({ message: 'Database error', error: err });
                    }
                    const currentLocationId = locationResults[0]?.location_id; // Get current location_id

                    checkCapacity(currentLocationId, currentCount, (err) => {
                        if (err) {
                            return res.status(400).json({ message: err.message }); // Capacity exceeded for the current location
                        }

                        // Proceed to update the event
                        const sql = 'UPDATE events SET ? WHERE event_id = ?';
                        db.query(sql, [updatedEvent, id], (err, result) => {
                            if (err) {
                                console.error('Database error while updating event:', err);
                                return res.status(500).json({ message: 'Database error', error: err });
                            }
                            if (result.affectedRows === 0) {
                                return res.status(404).json({ message: 'Event not found' });
                            }
                            res.json({ message: 'Event updated' });
                        });
                    });
                });
            }
        });
    }
];

exports.deleteEvent = (req, res) => {
    const { id } = req.params;

    const sqlDeleteParticipants = 'DELETE FROM event_participants WHERE event_id = ?';
    db.query(sqlDeleteParticipants, [id], (err) => {
        if (err) {
            console.error('Database error while deleting participants:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        const sql = 'DELETE FROM events WHERE event_id = ?';
        db.query(sql, id, (err, result) => {
            if (err) {
                console.error('Database error while deleting event:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Event not found' });
            }
            res.json({ message: 'Event deleted' });
        });
    });
};

// Participant controller methods
exports.getAllParticipants = (req, res) => {
    const sql = 'SELECT * FROM participants';
    try {
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Database error while fetching participants:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Unexpected error occurred while fetching participants:', error);
        res.status(500).json({ message: 'Unexpected error occurred', error: error.message });
    }
};

exports.createParticipant = [
    body('name').isString().notEmpty().withMessage('Participant name is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('phone_number').optional().isString(),
    body('status').optional().isIn(['registered', 'canceled', 'waitlisted']),
    body('event_id').isInt().withMessage('Valid event ID is required.'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const newParticipant = req.body;

        // Ensure that the event exists before adding a participant
        const sqlEventCheck = 'SELECT event_id, location_id FROM events WHERE event_id = ?';
        db.query(sqlEventCheck, [newParticipant.event_id], (err, results) => {
            if (err) {
                console.error('Database error while checking event:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'Event not found' });
            }

            const { location_id } = results[0]; // Get the location_id from the event

            // Get current participant count for the specific event
            const sqlParticipantsCount = `
                SELECT COUNT(*) AS count 
                FROM event_participants 
                WHERE event_id = ?`;
            
            db.query(sqlParticipantsCount, [newParticipant.event_id], (err, countResults) => {
                if (err) {
                    console.error('Database error while counting participants:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }

                const currentCount = countResults[0]?.count || 0; // Get current participant count

                // Call the capacity check function
                checkCapacity(location_id, currentCount, (err) => {
                    if (err) {
                        return res.status(400).json({ message: err.message }); // Capacity exceeded or location not found
                    }

                    // Create the participant without the event_id
                    const { event_id, ...participantData } = newParticipant; // Remove event_id
                    const sql = 'INSERT INTO participants SET ?';
                    db.query(sql, participantData, (err, result) => {
                        if (err) {
                            console.error('Database error while creating participant:', err);
                            return res.status(500).json({ message: 'Database error', error: err });
                        }

                        // Add participant to event_participants table
                        const sqlAddToEvent = 'INSERT INTO event_participants (event_id, participant_id) VALUES (?, ?)';
                        db.query(sqlAddToEvent, [newParticipant.event_id, result.insertId], (err) => {
                            if (err) {
                                console.error('Database error while linking participant to event:', err);
                                return res.status(500).json({ message: 'Database error', error: err });
                            }
                            res.json({ message: 'Participant registered', participantId: result.insertId });
                        });
                    });
                });
            });
        });
    }
];

exports.updateParticipant = [
    body('name').optional().isString(),
    body('email').optional().isEmail(),
    body('phone_number').optional().isString(),
    body('status').optional().isIn(['registered', 'canceled', 'waitlisted']),
    (req, res) => {
        const { id } = req.params;
        const updatedParticipant = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const sql = 'UPDATE participants SET ? WHERE participant_id = ?';
        db.query(sql, [updatedParticipant, id], (err, result) => {
            if (err) {
                console.error('Database error while updating participant:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Participant not found' });
            }
            res.json({ message: 'Participant updated' });
        });
    }
];

exports.deleteParticipant = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM participants WHERE participant_id = ?';
    try {
        db.query(sql, id, (err, result) => {
            if (err) {
                console.error('Database error while deleting participant:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Participant not found' });
            }
            // Also remove from event_participants table
            const sqlRemoveFromEvent = 'DELETE FROM event_participants WHERE participant_id = ?';
            db.query(sqlRemoveFromEvent, [id], (err) => {
                if (err) {
                    console.error('Database error while removing participant from event:', err);
                }
                // Get total participants count after deletion
                const sqlCountParticipants = `
                    SELECT COUNT(*) AS count 
                    FROM event_participants 
                    WHERE event_id = (SELECT event_id FROM event_participants WHERE participant_id = ?)`;
                db.query(sqlCountParticipants, [id], (err, countResults) => {
                    if (err) {
                        console.error('Database error while counting participants:', err);
                        return res.status(500).json({ message: 'Database error', error: err });
                    }
                    const totalParticipants = countResults[0]?.count || 0;
                    res.json({ message: 'Participant deleted', totalParticipants });
                });
            });
        });
    } catch (error) {
        console.error('Unexpected error occurred while deleting participant:', error);
        res.status(500).json({ message: 'Unexpected error occurred', error: error.message });
    }
};

// Location controller methods
exports.getAllLocations = (req, res) => {
    const sql = 'SELECT * FROM locations';
    try {
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Database error while fetching locations:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Unexpected error occurred while fetching locations:', error);
        res.status(500).json({ message: 'Unexpected error occurred', error: error.message });
    }
};

exports.createLocation = [
    body('name').isString().notEmpty().withMessage('Location name is required.'),
    body('capacity').isInt().withMessage('Capacity must be an integer.'),
    body('address').isString().notEmpty().withMessage('Address is required.'),
    body('city').isString().notEmpty().withMessage('City is required.'),
    body('postal_code').optional().isString(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const newLocation = req.body;
        const sql = 'INSERT INTO locations SET ?';
        try {
            db.query(sql, newLocation, (err, result) => {
                if (err) {
                    console.error('Database error while creating location:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                res.json({ message: 'Location created', locationId: result.insertId });
            });
        } catch (error) {
            console.error('Unexpected error occurred while creating location:', error);
            res.status(500).json({ message: 'Unexpected error occurred', error: error.message });
        }
    }
];

exports.updateLocation = [
    body('name').optional().isString(),
    body('capacity').optional().isInt(),
    body('address').optional().isString(),
    body('city').optional().isString(),
    body('postal_code').optional().isString(),
    (req, res) => {
        const { id } = req.params;
        const updatedLocation = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const sql = 'UPDATE locations SET ? WHERE location_id = ?';
        try {
            db.query(sql, [updatedLocation, id], (err, result) => {
                if (err) {
                    console.error('Database error while updating location:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Location not found' });
                }
                res.json({ message: 'Location updated' });
            });
        } catch (error) {
            console.error('Unexpected error occurred while updating location:', error);
            res.status(500).json({ message: 'Unexpected error occurred', error: error.message });
        }
    }
];

exports.deleteLocation = (req, res) => {
    const { id } = req.params;
    
    // Check if any events reference this location
    const sqlEventCheck = 'SELECT event_id FROM events WHERE location_id = ?';
    db.query(sqlEventCheck, [id], (err, results) => {
        if (err) {
            console.error('Database error while checking for events:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'Cannot delete location with active events.' });
        }

        const sql = 'DELETE FROM locations WHERE location_id = ?';
        try {
            db.query(sql, id, (err, result) => {
                if (err) {
                    console.error('Database error while deleting location:', err);
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Location not found' });
                }
                res.json({ message: 'Location deleted' });
            });
        } catch (error) {
            console.error('Unexpected error occurred while deleting location:', error);
            res.status(500).json({ message: 'Unexpected error occurred', error: error.message });
        }
    });
};


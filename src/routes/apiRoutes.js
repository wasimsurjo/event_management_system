const express = require('express');
const apiController = require('../controllers/apiController'); //  CRUD operations
const specialController = require('../controllers/specialController'); // Special filtering functions

const router = express.Router();
const accessControl = require('../middleware/accessControl'); // New access control middleware

// Event routes
router.get('/events', apiController.getAllEvents); // Fetch all events
router.post('/events', apiController.createEvent); // Create a new event
router.get('/events/date', specialController.getEventsByDate); // Fetch events by date
router.put('/events/:id', apiController.updateEvent); // Update an existing event
router.delete('/events/:id', apiController.deleteEvent); // Delete an event

// Participant routes
router.get('/participants', apiController.getAllParticipants); // Fetch all participants
router.get('/participants/status', specialController.getParticipantsByStatus); // Fetch participants by status
router.post('/participants', apiController.createParticipant); // Create a new participant
router.put('/participants/:id', apiController.updateParticipant); // Update an existing participant
router.delete('/participants/:id', apiController.deleteParticipant); // Delete a participant

// Location routes
router.get('/locations', apiController.getAllLocations); // Fetch all locations
router.post('/locations', apiController.createLocation); // Create a new location
router.put('/locations/:id', apiController.updateLocation); // Update an existing location
router.delete('/locations/:id', apiController.deleteLocation); // Delete a location

// Special routes
router.get('/events/:eventId/feedback', specialController.getFeedbackByEventId); // Fetch feedback for an event
router.get('/events/:eventId/sponsors', specialController.getSponsorsByEventId); // Fetch sponsors for an event

router.post('/blacklist', accessControl.addToBlacklist);
router.post('/whitelist', accessControl.addToWhitelist);
router.delete('/blacklist', accessControl.removeFromBlacklist);
router.delete('/whitelist', accessControl.removeFromWhitelist);


module.exports = router; 

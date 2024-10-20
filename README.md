
# Event Management System

## Overview
The **Event Management System** is a RESTful API designed to manage events, participants, and venues. It provides full CRUD operations for events, locations, and participants, along with abuse protection via a blacklist and whitelist system. The system is built using Node.js, Express.js, and MySQL.

## Features
- Create, Read, Update, and Delete (CRUD) operations for events, participants, and locations.
- Venue capacity management to ensure event registration limits.
- Filter events by date and participants by status.
- Feedback and sponsor management per event.
- Abuse protection using blacklist and whitelist functionality.

## Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: MySQL (UTF8MB4)
- **Validation**: express-validator
- **ORM/Querying**: MySQL2
- **Middleware**: Custom access control for blacklist/whitelist

## API Endpoints

### Events
- `GET /events`: Get all events
- `POST /events`: Create an event
- `PUT /events/:id`: Update an event
- `DELETE /events/:id`: Delete an event
- `GET /events/date?date=<date>`: Get events by date

### Participants
- `GET /participants`: Get all participants
- `POST /participants`: Register a participant
- `PUT /participants/:id`: Update participant details
- `DELETE /participants/:id`: Remove a participant
- `GET /participants/status?status=<status>`: Get participants by status

### Locations
- `GET /locations`: Get all locations
- `POST /locations`: Add a new location
- `PUT /locations/:id`: Update location details
- `DELETE /locations/:id`: Delete a location

### Feedback & Sponsors
- `GET /events/:eventId/feedback`: Get feedback for an event
- `GET /events/:eventId/sponsors`: Get sponsors for an event

### Blacklist/Whitelist
- `POST /blacklist`: Add an IP to the blacklist
- `DELETE /blacklist`: Remove an IP from the blacklist
- `POST /whitelist`: Add an IP to the whitelist
- `DELETE /whitelist`: Remove an IP from the whitelist

## Setup Instructions

### Prerequisites
- Node.js v14+
- MySQL Database

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/wasimsurjo/event_management_system.git
   ```
2. Navigate to the project directory:
   ```bash
   cd event_management_system
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up the MySQL database with the provided schema (ensure UTF8MB4 encoding).
5. Configure database credentials in `.env` file.

### Running the Application
```bash
npm start
```

## Testing
Use Postman or cURL to test the API endpoints. Example test for getting events by date:
```bash
curl -X GET 'http://localhost:3000/events/date?date=2024-11-20'
```

## License
This project is licensed under the MIT License.

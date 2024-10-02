# FallBackOffice

FallBackOffice is a backend server application for managing elderly fall reports. It provides an API for creating and retrieving fall incident reports, storing the data in a SQLite database.

## Features

* Create new fall incident reports
* Retrieve all fall incident reports
* Store detailed information about each fall incident
* Support for multiple related data points (fall reasons, user activities, etc.)
* CORS enabled for frontend integration

## Prerequisites
Before you begin, ensure you have met the following requirements:

* Node.js installed (version 12.x or higher recommended)
* npm (Node Package Manager) installed

## Installation

1. Clone the repository:
`` git clone https://github.com/your-username/fallbackoffice.git
cd fallbackoffice ``

2. Install the dependencies:
`` npm install ``

3. Install CORS separately:
`` npm install cors ``


## Usage
To start the server, run:
`` node index.js ``
The server will start on port 3000 by default, or on the port specified by the PORT environment variable.
API Endpoints

* ` POST /api/reports `: Create a new fall incident report
* ` GET /api/reports `: Retrieve all fall incident reports

## Database Schema
The application uses SQLite with the following main tables:

* ` reports `: Main table for storing report data
* ` fall_reasons `, ` user_activities `, ` preceding_symptoms `, ` fall_consequences `, ` injury_types `, ` taken_measures `, ` report_photos `: Related tables for storing list data

## Configuration

* The server is configured to allow CORS for ` http://localhost:5173 `. Modify the CORS settings in ` index.js ` if your frontend is hosted on a different origin.
* The SQLite database file is named ` elderly_reports.db ` and is created in the project root directory.

License
This project is licensed under the ISC License.
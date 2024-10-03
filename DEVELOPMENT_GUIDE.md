# Project Setup README

This guide will walk you through setting up and running all components of the Fall App project.

## Prerequisites

- Git
- Node.js and npm
- Expo CLI (for the mobile app)

## Step 1: Clone Repositories

Clone all three project repositories:

```bash
git clone https://github.com/AGORAGroupp/fall
git clone https://github.com/KatyaNichi/FallAppBackend
git clone https://github.com/frontendprg/fallDashboard
```

## Step 2: Set Up Backend

1. Navigate to the backend directory:
   ```bash
   cd FallAppBackend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   node server.js
   ```

## Step 3: Set Up Mobile App

1. Navigate to the app directory:
   ```bash
   cd ../fall
   ```

2. Install dependencies:
   ```bash
   npm i
   ```

3. Update the API base URL:
   - Open `src/utils/reportAPI.js`
   - Locate the line: `const API_BASE_URL = "http://172.24.11.211:3000"`
   - Replace `172.24.11.211` with your IP address
     - You can find your IP address by running `ifconfig` in the terminal

4. Start the Expo development server:
   ```bash
   npx expo start
   ```

## Step 4: Set Up Frontend Dashboard

1. Navigate to the frontend directory:
   ```bash
   cd ../fallDashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the API URL:
   - Open `src/data/fetchReports.ts`
   - Locate the line: `const response = await fetch("http://172.24.11.211:3000/api/reports", {`
   - Replace `172.24.11.211` with the same IP address you used for the mobile app

4. Start the development server:
   ```bash
   npm run dev
   ```

## Troubleshooting

If you encounter any issues:
- Ensure all dependencies are correctly installed
- Double-check that the IP addresses are correctly set in both the mobile app and frontend dashboard
- Verify that the backend server is running and accessible

For further assistance, please contact the project maintainers.

// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: This is the main entry point of the ClickWork backend API. It sets up the Express server, configures middleware, and defines the routes for handling authentication, user management, announcements, applications, and admin functionalities. The server listens on a specified port and uses environment variables for configuration. Additionally, it includes a custom error handler to manage errors across the API.
// Date: April 28th 2026

// Lastest Update:
// Date:
// By: 

import express  from 'express';     // Import Express framework to build web servers and APIs.
import cors     from  'cors';       // Import Cors middleware to allow request form differente domains.
import dotenv   from 'dotenv';      // Import dontenv to load environment variables form .env file.

import authRoutes           from './src/routes/authRoutes.js';          // Import authentication routes (handles login, register, verify email and so on).
import userRoutes           from './src/routes/userRoutes.js';          // Import user routes (manages user profile, resume upload, roll me features) 
import announcementRoutes   from './src/routes/announcementRoutes.js';  // Import announcemente routes (job posting created by companies)
import applicationsRoutes   from './src/routes/applicationsRoutes.js';  // Import application routes (Applications submitted by students)
import adminRoutes          from './src/routes/adminRoutes.js';         // Import admin routes (approve announcements, manage users and so on).
import companyRoutes        from './src/routes/companyRoutes.js';       // Import company routes (company registration, company profile management and so on).

import {errorHandler} from './src/middlewares/errorHandler.js'; // Import custom error handler (centralized error handler for the API).

dotenv.config(); // Load environment variables

const app =   express();                // Create an instance of Express
const PORT =  process.env.PORT || 5000; // Define the port to run the server

app.use( cors({ origin: process.env.FRONTEND_URL }) );  // Allow to make request APIs from the frontend  
app.use( express.json() );                              // Activate JSON body parser so the server can understand and process request bodies in JSON format


// Mount routes under /api/route prefix to organize API endpoints and void conflicts 
app.use( '/api/auth',          authRoutes ); 
app.use( '/api/users',         userRoutes );
app.use( '/api/announcements', announcementRoutes );
app.use( '/api/applications',  applicationsRoutes );
app.use( '/api/company',       companyRoutes );
app.use( '/api/admin',         adminRoutes );



app.use( errorHandler ); // Activate custom error handler to manage errors across the API

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

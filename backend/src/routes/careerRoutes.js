// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Routes for career-related endpoints. 
// Date: June 14th 2026

// Latest Update:
// Date:
// By:

import { Router } from 'express';

import{

    getAllCareers,
    getCareerById

    } from '../controllers/careerController.js';

const router = Router();

// GET /api/careers
router.get( '/', getAllCareers );

// GET /api/careers/:id
router.get( '/:id', getCareerById );

export default router;
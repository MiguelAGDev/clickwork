// Authors: 
//      * Azucena Rodriguez Flores  
//      * Miguel Angel Avila Garcia
// Description: Career controller — handles requests for the careers table
// Date: June 14th 2026

// Latest Update:
// Date:
// By:

import {  getAll, getById } from '../models/careerModels.js';

// GET /api/careers
async function getAllCareers( req, res, next ){

    try{
        const careers = await getAll();

        res.status(200).json({
            success: true,
            data: careers

        });

    }catch( err ){
        next( err );
    }

};

// GET /api/careers/:id
async function getCareerById( req, res, next ){

    try{

        const careerId = req.params.id;
        const career = await getById( careerId );

        if( !career ){
            const err = new Error( 'Career not found' );
            err.statusCode = 404;
            return next( err );
        }

        res.status(200).json({
            success: true,
            data: career
        });


    }catch( err ){ 
        next( err )
    }


};
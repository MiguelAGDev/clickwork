// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
// Description: Multer middleware for CV uploads.
//              Accepts PDF files only, enforces a 5 MB size limit,
//              and saves them to uploads/cvs/ with a unique filename.
// Date: June 8th 2026
 
// Latest Update:
// Date:
// By:

// Imports
import multer from 'multer';    // Library for handling uploads in Express
import path   from 'path';      // Manage files path
import fs     from 'fs';        // File Systems (create/view directories)
import { fileURLToPath } from 'url'; // Convert import.meta in a real file path

// Get the current directory path
const __filename = fileURLToPath(import.meta.url); // Get current path
const __dirname  = path.dirname(__filename);       // Get the directory of the current file

// Upload CONST
const UPLOAD_DIR     = path.join( __dirname, '../../uploads/cvs' );
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Create directory if it doesn't exist
if ( !fs.existsSync( UPLOAD_DIR ) ){
    fs.mkdirSync( UPLOAD_DIR, { recursive: true } ); // mkdir uploads/cvs
}

// Storage settings 
const storage = multer.diskStorage({

    // Destination folder: always UPLOAD_DIR
    destination: ( _req, _file, cb ) => {
        cb( null, UPLOAD_DIR );
    },

    // Filename: cv_<userId>_<timstamp>.pdf
    // req.user from authMiddleware so always exist
    filename: ( req, _file, cb ) => {
        const userId = req.user?.id ?? 'unknown';
        const timestamp = Date.now();
        cb( null, `cv_${ userId }_${ timestamp }.pdf` );
    },

});

// File filter — reject anything that is not a PDF
const fileFilter = (_req, file, cb) => {

    if( file.mimitype === 'application/pdf' ){
        cb( null, true );
    }


}


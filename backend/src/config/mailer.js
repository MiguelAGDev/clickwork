// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
// Description: Nodemailer transport configuration. Creates and exports a reusable
//              transporter instance using SMTP credentials from environment variables.
// Date: April 29th 2026
 
// Latest Update:
// Date:
// By:
 

import nodemailer from 'nodemailer'; // Import nodemailer to send emails from the backend


// Build a reusable object thath knows how to connect to an SMTP server
const transporter = nodemailer.createTransport({

    host: process.env.MAIL_HOST, // SMTP server host
    port: Number(process.env.MAIL_PORT),// Port number
    secure: Number(process.env.MAIL_PORT) === 465,
    auth: {
        user: process.env.MAIL_USER, // Username, email address
        pass: process.env.MAIL_PASS  // Token to send emails
    }

});


// Error handling: Run only in development mode
// if it fails, it logs the error message
// else logs confirmation message
if( process.env.NODE_ENV === 'development'){

    transporter.verify((error) => {

        if(error){
            console.error('[MAILER] Connection failed: ', error.message);
        }else{
            console.log('[MAILER] Ready to send emails');
        }

    });

}

// Export the transporter to be used in any part of the backend that needs to send emails
export default transporter;
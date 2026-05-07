// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
// Description: Email service. Contains all email-sending functions and their HTML templates.
//              Every function receives the required data, builds the email, and sends it
//              using the shared Nodemailer transporter from config/mailer.js.
// Date: April 29th 2026

// Latest Update:
// Date:
// By:

import transporter from '../config/mailer.js';


// Base HTML function, wraps any given contend inside a syled HTML email layout
const buildTemplate = (content) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ClickWork</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: #f4f4f5; font-family: Arial, sans-serif; color: #18181b; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background-color: #2563eb; padding: 28px 32px; }
    .header h1 { color: #ffffff; font-size: 24px; letter-spacing: 0.5px; }
    .body { padding: 32px; line-height: 1.7; font-size: 15px; }
    .body p { margin-bottom: 16px; }
    .btn { display: inline-block; margin: 8px 0 20px; padding: 12px 28px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; }
    .footer { background-color: #f4f4f5; padding: 20px 32px; font-size: 12px; color: #71717a; text-align: center; }
    .divider { border: none; border-top: 1px solid #e4e4e7; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>ClickWork</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} ClickWork · Este correo fue generado automáticamente, por favor no respondas a él.
    </div>
  </div>
</body>
</html>
`;

//  Sends a verification email after a new user registers.
//  The link redirects to the frontend verify page which calls GET /api/auth/verify/:token.
 
export const sendVerificationEmail = async ({ to, token }) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${token}`;

    const html = buildTemplate(`
        <p>Hola, usuario 👋</p>
        <p>Gracias por registrarte en ClickWork. Para activar tu cuenta, haz clic en el botón de abajo:</p>
        <a href="${verifyUrl}" class="btn">Verificar mi cuenta</a>
        <hr class="divider"/>
        <p>Si no creaste una cuenta, puedes ignorar este correo sin problema.</p>
        <p style="font-size:13px; color:#71717a;">Este enlace expirará en <strong>24 horas</strong>.</p>
    `);

    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject: 'Verifica tu cuenta de ClickWork',
        html,
    });
};

// Sends a welcome email once the user has verified their account.
export const sendWelcomeEmail = async ({ to, name }) => {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;

    const html = buildTemplate(`
        <p>¡Bienvenido/a a ClickWork, <strong>${name}</strong>! 🎉</p>
        <p>Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión y comenzar a explorar las convocatorias disponibles.</p>
        <a href="${loginUrl}" class="btn">Ir al inicio de sesión</a>
        <hr class="divider"/>
        <p>Si tienes alguna duda, contáctanos a través de la plataforma.</p>
    `);

    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject: '¡Tu cuenta de ClickWork está lista!',
        html,
    });
};

//   Sends the student's CV as an attachment to the company's registered email.
//   This is the "Roll me" feature.
export const sendRollMeEmail = async ({ to, companyName, studentName, announcementTitle, cvPath }) => {
    const html = buildTemplate(`
        <p>Estimada empresa <strong>${companyName}</strong>,</p>
        <p>El/la estudiante <strong>${studentName}</strong> está interesado/a en la siguiente convocatoria:</p>
        <p style="font-size:16px; font-weight:bold; color:#2563eb;">${announcementTitle}</p>
        <p>Adjunto a este correo encontrarás su CV en formato PDF para su revisión.</p>
        <hr class="divider"/>
        <p style="font-size:13px; color:#71717a;">Este mensaje fue enviado a través de la plataforma ClickWork.</p>
    `);

    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject: `CV de ${studentName} — ${announcementTitle}`,
        html,
        attachments: [
            {
                filename: `CV_${studentName.replace(/\s+/g, '_')}.pdf`,
                path: cvPath,
                contentType: 'application/pdf',
            },
        ],
    });
};

//   Sends a password-reset email with a time-limited link.
//   (Scaffold — implement when the reset flow is built.)
export const sendPasswordResetEmail = async ({ to, name, token }) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const html = buildTemplate(`
        <p>Hola, <strong>${name}</strong>.</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo:</p>
        <a href="${resetUrl}" class="btn">Restablecer contraseña</a>
        <hr class="divider"/>
        <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
        <p style="font-size:13px; color:#71717a;">Este enlace expirará en <strong>1 hora</strong>.</p>
    `);

    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject: 'Restablece tu contraseña de ClickWork',
        html,
    });
};

// -------------------------------------
//             WORKING ON
// -------------------------------------

/*
//  Sends an email to notify a student that their application status has changed.
//  e.g. "Pending" → "Accepted" or "Rejected".
export const sendApplicationStatusEmail = async ({ to, studentName, announcementTitle, status }) => {
    const statusMessages = {
        accepted: { label: 'Aceptada ✅', text: 'Felicidades, tu postulación ha sido <strong>aceptada</strong>. La empresa se pondrá en contacto contigo próximamente.' },
        rejected: { label: 'No seleccionado', text: 'Lamentablemente tu postulación <strong>no fue seleccionada</strong> en esta ocasión. Te animamos a seguir explorando otras convocatorias.' },
        pending:  { label: 'En revisión 🕐', text: 'Tu postulación está siendo <strong>revisada</strong> por la empresa. Te notificaremos cuando haya una actualización.' },
    };

    const { label, text } = statusMessages[status] ?? statusMessages.pending;
    const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;

    const html = buildTemplate(`
        <p>Hola, <strong>${studentName}</strong>.</p>
        <p>Ha habido una actualización en tu postulación para:</p>
        <p style="font-size:16px; font-weight:bold; color:#2563eb;">${announcementTitle}</p>
        <p>Estado: <strong>${label}</strong></p>
        <p>${text}</p>
        <a href="${dashboardUrl}" class="btn">Ver mis postulaciones</a>
    `);

    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject: `Actualización de tu postulación — ${announcementTitle}`,
        html,
    });
};
*/
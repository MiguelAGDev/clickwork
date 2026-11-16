// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      The backend writes its messages in English and the UI is in
//      Spanish. This maps every message the backend is known to send
//      (read from its controllers, services and validators) to Spanish.
//      Unknown messages are shown as they come, so a new backend
//      message is never hidden.
//
// Date: November 16th 2026

// Latest Update:
// Date:
// By:

const MESSAGES: Record<string, string> = {
    // --- auth ---
    "Invalid email or password.": "Correo o contraseña incorrectos.",
    "Please verify your email before logging in.": "Verifica tu correo antes de iniciar sesión.",
    "Your account has been deactivated. Contact support.": "Tu cuenta está desactivada. Contacta a soporte.",
    "Your account has been deactived. Contact support.": "Tu cuenta está desactivada. Contacta a soporte.",
    "Please verify your email before accessing this resource.": "Verifica tu correo para continuar.",
    "An account with this email already exists.": "Ya existe una cuenta con este correo.",
    "Verification link is invalid.": "El enlace de verificación no es válido.",
    "Verification link has expired. Please register again or request a new link.": "El enlace de verificación venció. Solicita uno nuevo.",
    "Reset link is invalid.": "El enlace para restablecer la contraseña no es válido.",
    "Reset link has expired. Please request a new one.": "El enlace para restablecer la contraseña venció. Solicita uno nuevo.",
    "Invalid or expired token": "Tu sesión expiró. Inicia sesión de nuevo.",
    "No token provided": "Inicia sesión para continuar.",
    "Current password is incorrect.": "La contraseña actual es incorrecta.",
    "New password must be different from the current password.": "La nueva contraseña debe ser distinta a la actual.",
    "Validation failed": "Revisa los campos marcados.",

    // --- rate limits (429) ---
    "Too many login attempts from this IP, please try again after 15 minutes": "Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.",
    "Too many accounts created from this IP, please try again after an hour": "Se crearon demasiadas cuentas desde esta red. Intenta de nuevo en una hora.",
    "Too many forgot password attempts from this IP, please try again after an hour": "Demasiadas solicitudes de recuperación. Intenta de nuevo en una hora.",
    "Too many resend verification attempts from this IP, please try again after 24 hours": "Demasiados reenvíos de verificación. Intenta de nuevo en 24 horas.",
    "Too many reset password attempts from this IP, please try again after an hour": "Demasiados intentos de restablecer la contraseña. Intenta de nuevo en una hora.",
    "Too many change password attempts from this IP, please try again after 24 hours": "Demasiados cambios de contraseña. Intenta de nuevo en 24 horas.",

    // --- field validation (422) ---
    "A valid email addres is required": "Escribe un correo válido.",
    "A valid email addres is required.": "Escribe un correo válido.",
    "A valid email address is required.": "Escribe un correo válido.",
    "Pasword must be at least 8 characteres.": "La contraseña debe tener al menos 8 caracteres.",
    "Password must be at least 8 characters.": "La contraseña debe tener al menos 8 caracteres.",
    "Password must contain at least one uppercase letter.": "La contraseña debe incluir al menos una mayúscula.",
    "Pasword must contain at least one number.": "La contraseña debe incluir al menos un número.",
    "Password must contain at least one number.": "La contraseña debe incluir al menos un número.",
    "Password is required.": "Escribe tu contraseña.",
    "Current password is required.": "Escribe tu contraseña actual.",
    "New password is required.": "Escribe la nueva contraseña.",
    "New password must be at least 8 characters long.": "La nueva contraseña debe tener al menos 8 caracteres.",
    "New password must contain at least one uppercase letter.": "La nueva contraseña debe incluir al menos una mayúscula.",
    "New password must contain at least one number.": "La nueva contraseña debe incluir al menos un número.",
    "Invalid phone number.": "Escribe un teléfono válido.",
    "Phone must not exceed 20 characters.": "El teléfono no puede pasar de 20 caracteres.",
    "Select a valid career.": "Selecciona una carrera válida.",
    "careerId must be a valid integer.": "Selecciona una carrera válida.",
    "Invalid role. Insert a valid role.": "Selecciona un tipo de cuenta válido.",
    "Semester is required.": "Indica tu semestre.",
    "Insert a valid semester (1-12).": "El semestre debe estar entre 1 y 12.",
    "Semester must be a valid integer (1-12).": "El semestre debe estar entre 1 y 12.",
    "Start Date must be a valid date (YYYY-MM-DD).": "La fecha de inicio no es válida.",
    "End Date must be a valid date (YYYY-MM-DD).": "La fecha de término no es válida.",
    "Graduation Year is required for graduates.": "Indica tu año de egreso.",
    "Graduation must be a valid year.": "El año de egreso no es válido.",
    "Company name is required.": "Escribe el nombre de la empresa.",
    "Company name is required": "Escribe el nombre de la empresa.",
    "Company name must not exceed 100 characters.": "El nombre no puede pasar de 100 caracteres.",
    "Company size is required.": "Selecciona el tamaño de la empresa.",
    "Company size is required": "Selecciona el tamaño de la empresa.",
    "Insert a valid company size.": "Selecciona un tamaño válido.",
    "Invalid company size": "Selecciona un tamaño válido.",
    "Industry is required.": "Escribe el giro de la empresa.",
    "Industry is required": "Escribe el giro de la empresa.",
    "Company contact email must be valid.": "El correo de contacto no es válido.",
    "A valid contact email is required.": "Escribe un correo de contacto válido.",
    "City is required": "Escribe la ciudad.",
    "State is required": "Escribe el estado.",
    "Address is required": "Escribe la dirección.",
    "Job title is required.": "Escribe el título de la vacante.",
    "Job title must not exceed 100 characters.": "El título no puede pasar de 100 caracteres.",
    "Requirements are required.": "Describe los requisitos.",
    "Modality is required.": "Selecciona la modalidad.",
    "Modality must be remote, on-site or hybrid.": "Selecciona una modalidad válida.",
    "Schedule is required.": "Indica el horario.",
    "Contract type is required.": "Selecciona el tipo de contrato.",
    "Invalid contract type.": "Selecciona un tipo de contrato válido.",
    "Experience level is required.": "Selecciona el nivel de experiencia.",
    "Invalid experience level.": "Selecciona un nivel de experiencia válido.",
    "Expiration date is required.": "Indica la fecha de cierre.",
    "Expiration date must be a valid date (YYYY-MM-DD).": "La fecha de cierre no es válida.",
    "Salary must be a positive number.": "El sueldo debe ser un número positivo.",
    "Each careerId must be a valid integer.": "Selecciona carreras válidas.",
    "reason must not exceed 255 characters.": "El motivo no puede pasar de 255 caracteres.",

    // --- users / cv / applications ---
    "CV file is required": "Selecciona un archivo PDF.",
    "The uploaded file is not a valid PDF.": "El archivo no es un PDF válido.",
    "Only PDF files are allowed": "Solo se aceptan archivos PDF.",
    "File too large": "El archivo pesa más de 5 MB.",
    "You must upload a CV before applying.": "Sube tu CV antes de postularte.",
    "Job posting not found.": "No encontramos esta vacante.",
    "Job posting not found": "No encontramos esta vacante.",
    "Cannot apply to a job posting that is not approved.": "Esta vacante todavía no está publicada.",
    "Cannot apply to a job posting that is not approved": "Esta vacante todavía no está publicada.",
    "Company not found.": "No encontramos la empresa.",
    "Company not found": "No encontramos la empresa.",
    "Company contact email is not available.": "La empresa no tiene un correo de contacto para recibir tu CV.",
    "You have already applied to this job posting.": "Ya te postulaste a esta vacante.",
    "Your CV could not be sent to the company. Please try again.": "No pudimos enviar tu CV a la empresa. Intenta de nuevo.",
    "Application not found": "No encontramos esta postulación.",
    "You are not authorized to view applicants for this job posting.": "Esta vacante no pertenece a tu empresa.",
    "You are not authorized to update this application.": "Esta postulación no pertenece a tu empresa.",

    // --- company / job postings ---
    "You must have a registered company to create job posting": "Necesitas una empresa registrada para publicar vacantes.",
    "Your company must be approved before posting jobs": "Tu empresa debe estar aprobada para publicar vacantes.",
    "You are not authorized to edit this job posting": "Esta vacante no pertenece a tu empresa.",
    "No company found for this user": "No encontramos una empresa ligada a tu cuenta.",
    "Company not found for this user": "No encontramos una empresa ligada a tu cuenta.",
    "Company not found or nothing changed": "No se guardó ningún cambio.",
    "Only company accounts can use this endpoint.": "Solo las cuentas de empresa pueden hacer esto.",

    // --- admin ---
    "Rejection reason required": "Escribe el motivo del rechazo.",
    "User not found.": "No encontramos este usuario.",
    "User not authenticated": "Inicia sesión para continuar.",
    "Career not found": "No encontramos esta carrera.",
}

// Generic text by status, for errors whose message we do not know.
const STATUS_FALLBACK: Record<number, string> = {
    0: "No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.",
    403: "No tienes permiso para hacer esto.",
    404: "No encontramos lo que buscabas.",
    429: "Demasiados intentos. Espera un momento e intenta de nuevo.",
    500: "Ocurrió un error en el servidor. Intenta de nuevo más tarde.",
}

function translateApiMessage( message: string | undefined, status: number ): string {
    if( message && MESSAGES[ message ] ) return MESSAGES[ message ]

    // "Access denied. Required role: admin, but you are: student" carries
    // the roles inside the text, so it cannot be an exact key.
    if( message?.startsWith( "Access denied" ) ) return STATUS_FALLBACK[ 403 ]

    // A 500 message is an internal detail (SQL, stack). Never show it raw.
    // 502 is the exception: the backend uses it for "the email did not go
    // out", which the user needs to read.
    if( status >= 500 && status !== 502 ) return STATUS_FALLBACK[ 500 ]

    return message || STATUS_FALLBACK[ status ] || "Ocurrió un error inesperado."
}

export { translateApiMessage }

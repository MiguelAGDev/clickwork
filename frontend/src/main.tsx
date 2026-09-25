// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      App entry point. First file that runs — index.html loads it
//      directly (<script type="module" src="/src/main.tsx">). Mounts
//      the <App /> component inside the real <div id="root"> from the
//      HTML.
//
// Date: September 24th 2026

// Latest Update:
// Date:
// By:

import { StrictMode } from "react";             // StrictMode: React dev-only mode that catches common bugs (impure side-effects, etc.) by running some parts twice — does nothing in production.
import { createRoot } from "react-dom/client";  // createRoot: connects Reat to a real DOM element in the browser. Bridge between 'Real World' and HTML 

// IT DON EXIST YET;
import { App }            from "@/App.tsx"          // The root component for the whole app. Everything else lives inside it.
import "@/index.css"                            // Base CSS ( Tailwind + Shadcn theme ). Imported here to use it in the WHOLE app.
// '@/' Search on src instead './' that says in this root
// for this case is the same but @ looks prettier 


// getElement( "root" ) looks up the <div id="root"> that exist in index.html
// The '!' at the end tells the TS "Trust me dawg, it exists fr" (It always exists, 
// not null beacuae it's hardcored in the HTML).
createRoot ( document.getElementById( "root" )! ).render(

    <StrictMode>  
        <App />
    </StrictMode>

)
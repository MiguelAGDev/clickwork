// Authors:
//      * Azucena Rodriguez Flores
//      * Miguel Angel Avila Garcia
//
// Description:
//      Root component of the app. For now it just renders fixed text
//      to confirm main.tsx -> App.tsx -> screen works end to end. The
//      router and real routes are added in Paso 1.B.
//
// Date: September 24th 2026

// Latest Update:
// Date:
// By:

// Component: a TS function return JSX ( a description of 
// what should show on screen ). React calls this function every
// time it  neet to know what to paint
function App(){

    // JSX: this is HTML - looking sintax inside TS function is not real HTML
    // it compiles in JS, thats why .tsx intead .ts
    return <h1>ClickWork</h1>

}

export { App }

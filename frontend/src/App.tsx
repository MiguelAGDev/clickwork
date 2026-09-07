import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"

// Placeholder trivial: las páginas reales llegan en pasos posteriores,
// una vez elegido el diseño de login (Paso 2).
function Placeholder({ name }: { name: string }) {
  return <div>{name}</div>
}

// Shell de ruteo. Los 4 paths de abajo son obligatorios tal cual —
// backend/src/services/emailService.js ya manda correos reales con links
// a estas rutas exactas (verify/reset-password/login/dashboard).
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Placeholder name="login" />} />
          <Route path="/verify/:token" element={<Placeholder name="verify" />} />
          <Route
            path="/reset-password/:token"
            element={<Placeholder name="reset-password" />}
          />
          <Route path="/dashboard" element={<Placeholder name="dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

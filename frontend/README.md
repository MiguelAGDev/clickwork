# ClickWork — Frontend

Interfaz web de ClickWork (bolsa de trabajo y residencias profesionales).
React 19 + TypeScript + Vite 8 + Tailwind 4.

## Requisitos

- Node.js 20 o superior.
- El backend de este repo corriendo (ver `../backend`).

## Configuración

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env` y ajusta el puerto si tu backend usa otro:

   ```bash
   VITE_API_URL=http://localhost:3000
   ```

   `VITE_API_URL` es el origen del backend **sin** `/api`. Debe coincidir con
   `PORT` en `backend/.env` (si `PORT` no está definido, el backend usa 5000).

3. En `backend/.env` deja `FRONTEND_URL=http://localhost:5173`. El backend
   solo acepta peticiones de ese origen (CORS) y arma con él los enlaces de
   sus correos.

## Scripts

| Comando              | Qué hace                                            |
| -------------------- | --------------------------------------------------- |
| `npm run dev`        | Servidor de desarrollo en `http://localhost:5173`.  |
| `npm run build`      | Revisa tipos (`tsc -b`) y genera `dist/`.           |
| `npm run lint`       | ESLint sobre todo el proyecto.                      |
| `npm test`           | Pruebas con Vitest + Testing Library + MSW.         |
| `npm run test:watch` | Pruebas en modo observador.                         |
| `npm run preview`    | Sirve el build de `dist/` para revisarlo.           |

El servidor de desarrollo usa el puerto 5173 de forma estricta: si está
ocupado, Vite falla en lugar de moverse a otro puerto, porque el backend
rechazaría las peticiones por CORS.

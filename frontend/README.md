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

4. Aplica a tu base de desarrollo las migraciones de `backend/migrations/`
   que aún no tenga (cada archivo dice cómo correrlo). La base de pruebas
   `clickwork_test` también las necesita.

## Scripts

| Comando              | Qué hace                                            |
| -------------------- | --------------------------------------------------- |
| `npm run dev`        | Servidor de desarrollo en `http://localhost:5173`.  |
| `npm run build`      | Revisa tipos (`tsc -b`) y genera `dist/`.           |
| `npm run lint`       | ESLint sobre todo el proyecto.                      |
| `npm test`           | Pruebas con Vitest + Testing Library + MSW.         |
| `npm run test:watch` | Pruebas en modo observador.                         |
| `npm run test:e2e`   | Pruebas de extremo a extremo con Playwright.        |
| `npm run preview`    | Sirve el build de `dist/` para revisarlo.           |

El servidor de desarrollo usa el puerto 5173 de forma estricta: si está
ocupado, Vite falla en lugar de moverse a otro puerto, porque el backend
rechazaría las peticiones por CORS.

## Pruebas de extremo a extremo

`npm run test:e2e` abre un navegador real (Edge) contra el backend real y la
base de pruebas. Levanta por su cuenta un backend en el puerto 3100
(`NODE_ENV=test`) y un Vite en el 5174, así que puede correr mientras usas
los servidores normales de desarrollo.

Requisitos:

- MySQL encendido y la base definida en `DB_NAME_TEST` de `backend/.env`
  (la misma que usa `npm run test:newman` del backend).
- El cliente `mysql` en el PATH.

Antes de empezar vacía esa base y carga `backend/test/newman/resource/seed.sql`.
Nunca toca la base de desarrollo. Cubre sesión, candidato, empresa, admin, el
ciclo completo (empresa publica, admin aprueba, candidato la ve) y un escaneo
de accesibilidad con axe.

## Estructura de `src/`

| Carpeta            | Qué vive ahí                                                        |
| ------------------ | ------------------------------------------------------------------- |
| `pages/`           | Una pantalla por archivo, agrupadas por rol (`auth`, `candidate`, `company`, `admin`). |
| `components/ui/`   | Piezas reutilizables sin lógica de negocio (botón, campos, alertas). |
| `components/`      | Piezas con dominio: `layout` (shell y login), `jobs`, `admin`, `account`, `routing` (guards). |
| `context/`         | Sesión global (`AuthProvider`).                                     |
| `hooks/`           | Lógica reutilizable (`useAuth`, `useAsyncData`, `useSavedJobs`).    |
| `services/`        | Toda la comunicación con el backend. `mappers.ts` traduce los nombres de columnas a los tipos de `types/`. |
| `lib/`             | Funciones puras: fechas, etiquetas en español, validación, reglas de vacantes. |
| `test/`            | Configuración de Vitest, servidor MSW y respuestas de ejemplo.      |

## Decisiones que conviene conocer

- **Rutas fijas.** `/login`, `/dashboard`, `/verify/:token` y
  `/reset-password/:token` son las que el backend escribe en sus correos.
- **Sesión.** El token vive en `localStorage`, dura 3 horas y no se renueva;
  al vencer, la app regresa al login y explica por qué.
- **Vacantes guardadas.** Se guardan en el navegador, por usuario, porque el
  backend aún no tiene ese endpoint.
- **Mensajes.** El backend responde en inglés; `lib/apiMessages.ts` los
  traduce. Un mensaje desconocido se muestra tal cual.

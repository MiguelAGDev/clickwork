<h1 align=center>PENDING TASKS </h1>
<br>

## Labels Dictionary

<div align="center">

| Label                                                                             | Meaning                                    |
| --------------------------------------------------------------------------------- | ------------------------------------------ |
| ![bug](https://img.shields.io/badge/bug-d73a4a)                                   | Something isn't working                    |
| ![documentation](https://img.shields.io/badge/documentation-0075ca)               | Improvements or additions to documentation |
| ![duplicate](https://img.shields.io/badge/duplicate-cfd3d7)                       | This issue or pull request already exists  |
| ![enhancement](https://img.shields.io/badge/enhancement-a2eeef)                   | New feature or request                     |
| ![good%20first%20issue](https://img.shields.io/badge/good%20first%20issue-7057ff) | Good for newcomers                         |
| ![help%20wanted](https://img.shields.io/badge/help%20wanted-008672)               | Extra attention is needed                  |
| ![invalid](https://img.shields.io/badge/invalid-e4e669)                           | This doesn't seem right                    |
| ![question](https://img.shields.io/badge/question-d876e3)                         | Further information is requested           |
| ![wontfix](https://img.shields.io/badge/wontfix-bfbfbf)                           | This will not be worked on                 |
</div>


<br>

<h1 align=center>TO DO </h1>


<br>

# <img src="https://img.shields.io/badge/backend-475569" alt="backend" height="30" />

> Ver contexto y el por qué de cada uno en `notclaude/CONTEXT.md` y
> `notclaude/bitacora/`. Permisos, reportes y notificaciones están en
> stand-by, no listados aquí.

* [ ] ❓ Admin: borrar usuario — pendiente decidir si entra aquí o se va a
  stand-by junto con el sistema de permisos.
* [ ] 🗣️ Borrar vacante — diseño propuesto (soft-delete, ver
  `notclaude/bitacora/2026-09-02-borrar-vacante-pendiente-equipo.md`),
  pendiente de platicarlo con el equipo antes de implementar (implica
  migración de schema).
* [ ] 🗣️ Borrar empresa (hard-delete real) — mismo problema/diseño que
  borrar vacante, también pendiente de platicarlo con el equipo. El
  toggle de desactivarse a sí misma ya existe y no depende de esto.
* [ ] 🐛 Bug menor en `rollMeToCompany` (`userController.js`) — usa
  comillas simples en vez de backticks en
  `'Job posting #${ jobPostingId }'`, el placeholder nunca interpola.
  Detectado desde el análisis inicial del repo, sigue sin corregirse.
* [ ] 🧹 Repo `.git` anidado y vacío dentro de `backend/` (branch
  `master`, cero commits) — decidir si se borra, probablemente
  generado por accidente al inicializar el proyecto.
* [ ] 📄 Paginación en listados sin límite — `getAllJobPostings`,
  `getAllCompanies`, y similares. No urge con poca data de prueba,
  sí antes de manejar datos reales.
* [ ] 💡 Exponer `audit_log` vía endpoint admin — los datos ya se
  generan solos (triggers de DB ya existen: `trg_user_insert`,
  `trg_job_posting_update`, `trg_insert_application`, etc.), falta
  únicamente el endpoint que los lea. Parte del permiso
  `VIEW_AUDIT_LOG`, en stand-by con el resto de permisos.

> Los siguientes los detectó el frontend al conectarse al API (nov 2026).
> Ninguno se arregló desde el frontend: son propuestas. El frontend ya
> funciona con cada uno tal como está (se indica cómo).

* [x] 🐛 Filtros de vacantes que no filtran — resuelto el 16-nov-2026 en
  `feat/miguel-backend-fixes-1`: el controlador manda las claves que lee el modelo y la URL
  acepta `careerId` o `career_id`.
* [x] 🐛 Vacantes duplicadas en el listado público — resuelto el 16-nov-2026 en
  `feat/miguel-backend-fixes-1`: el JOIN con carreras solo se hace al filtrar
  por carrera, y el SELECT es DISTINCT.
* [x] 🐛 El listado público incluye vacantes vencidas — resuelto el 16-nov-2026 en
  `feat/miguel-backend-fixes-1`: se filtran en SQL por
  `jb_pst_expiration_date`.
* [x] 💡 Las vacantes no traen el nombre ni la ciudad de la empresa — resuelto el 16-nov-2026 en
  `feat/miguel-backend-fixes-1`: `company_name`,
  `company_city` y `company_state` en listado, detalle, mis vacantes y mis
  aplicaciones.
* [ ] 💡 La vacante no regresa sus carreras — `GET /announcements/:id` no
  incluye las filas de `job_posting_career`, y `createJobPosting` no
  llena `jb_pst_id_career`. Al editar, el formulario no puede mostrar las
  carreras actuales (solo las conserva si no se marca ninguna).
* [ ] 💡 CV no descargable — no hay `express.static` para `uploads/`, así
  que la empresa no puede abrir `applicant_cv_url` desde la lista de
  aplicantes. Hoy el CV solo llega por correo con Roll Me.
* [ ] ❓ Dos caminos para postularse — `POST /applications` (solo
  registra) y `POST /users/roll-me` (registra y manda el CV por correo).
  El frontend ofrece los dos botones. Decidir si se queda uno solo.
* [x] 🐛 Una empresa que se desactiva no puede reactivarse — resuelto el 16-nov-2026 en
  `feat/miguel-backend-fixes-1`: columna `cmp_active`
  (migración en `backend/migrations/`); `toggle-active` pausa la empresa
  (oculta sus vacantes) sin tocar la cuenta, y ella misma la reanuda.
* [ ] 💡 Empresa rechazada sin forma de pedir nueva revisión — editar el
  perfil no regresa `cmp_approval_status` a `pending`; depende de que un
  admin la vuelva a abrir.
* [x] 💡 Sin nombre de persona en `app_user` — resuelto el 16-nov-2026 en
  `feat/miguel-user-names`: columnas `ap_usr_first_name` y
  `ap_usr_last_name` (migración en `backend/migrations/`).
* [ ] 💡 Faltan endpoints que el diseño sugiere — vacantes guardadas (hoy
  en `localStorage` del navegador) y notificaciones (la campana del
  diseño no se muestra).
* [ ] 🧹 `GET /users/me` regresa `graduate_year` y el registro usa
  `graduationYear` — el frontend lo normaliza en `services/mappers.ts`.
* [ ] 🧹 `updateIntern` reescribe los tres campos juntos — un campo que no
  viaja en el body se guarda como `NULL`, y una fecha vacía (`""`)
  llegaría tal cual a una columna `DATE`. El frontend siempre manda los
  tres, con `null` en los vacíos.
* [ ] 🧹 `authMiddleware` truena con 500 si el usuario del token ya no
  existe (`user.active` sobre `null`). Debería ser 401.
* [ ] 🧹 Subir un CV de más de 5 MB responde 500 ("File too large") porque
  el error de multer no trae `statusCode`. El frontend valida el tamaño
  antes de subir.
* [ ] 🧹 `GET /announcements/:id` es público y regresa vacantes
  `pending` o `rejected`. El frontend no deja postularse a esas.

<br>

# <img src="https://img.shields.io/badge/frontend-0f766e" alt="frontend" height="30"/>

> El frontend completo (candidato, empresa, admin) está en las ramas
> `feat/miguel-front-f0` a `feat/miguel-front-f6`. Ver `frontend/README.md`.

* [ ] ❓ Texto del botón principal — el diseño D2 usa texto blanco sobre
  dorado (contraste 2.3:1). Se dejó texto tinta sobre dorado (7:1), igual
  que el avatar y el badge "Nuevo" del diseño interior. Confirmar.
* [ ] ❓ Links dorados — el dorado de marca no se lee como texto sobre
  fondo claro; los links usan un dorado más oscuro (`--palette-accent-text`).
  Confirmar el tono.
* [ ] 📄 Contenido de Ayuda, Privacidad y Términos — las tres páginas del
  footer existen pero solo dicen que el texto está en preparación.
* [ ] 💡 Cuando el backend mande nombre y ciudad de la empresa en las
  vacantes, mostrarlos en `JobCard` (hoy muestra modalidad, contrato,
  nivel y sueldo).
* [ ] 💡 Pasar "vacantes guardadas" al backend cuando exista el endpoint
  (solo cambia `hooks/useSavedJobs.ts`).

<br>

# <img src="https://img.shields.io/badge/testing-16a34a" alt="testing" height="30" />

> Nada implementado aún — discutido el 2026-09-03, sin empezar hasta
> que se decida.

* [ ] 🧪 Integration tests (recomendado: `vitest`/`jest` + `supertest`
  contra una DB de pruebas) — uno por endpoint crítico (happy path +
  el 401/403 de ownership) para dejar de validar cada ruta a mano en
  Postman y cachar automáticamente bugs como los de renombrar campos
  entre capas (varios encontrados hoy).

<br>

# <img src="https://img.shields.io/badge/documentation-0075ca" alt="documentation" height="30" />

<br>

---

<br>

<h1 align=center> NOTES </h1>

<br>

# <img src="https://img.shields.io/badge/backend-475569" alt="backend" height="30" />


* Notes related to backend tasks.

<br>

# <img src="https://img.shields.io/badge/frontend-0f766e" alt="frontend" height="30"/>

* Notes related to frontend tasks.

<br>

# <img src="https://img.shields.io/badge/testing-16a34a" alt="testing" height="30" />



* Notes related to testing tasks.



<br>

# <img src="https://img.shields.io/badge/documentation-0075ca" alt="frontend" height="30" />

* Notes related to documentation tasks.

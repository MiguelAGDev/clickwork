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

<br>

# <img src="https://img.shields.io/badge/frontend-0f766e" alt="frontend" height="30"/>

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

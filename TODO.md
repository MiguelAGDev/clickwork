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



* [ ] <b>Database refactor (both agree first)</b>
    - Add ap_usr_role and ap_usr_permissions columns to app_user
    - Drop permissions columns from student, intern, graduate, company tables

    ![enhancement](https://img.shields.io/badge/enhancement-a2eeef)

<br>

* [ ] <b>authService.js refactor</b>
    - Simplify _detectRole() — reads ap_usr_role from app_user
    - Simplify _getPermissions() — reads ap_usr_permissions from app_user  
    - Simplify _updatePermissions() — updates ap_usr_permissions in app_user

    ![enhancement](https://img.shields.io/badge/enhancement-a2eeef)

<br>

* [ ] <b>Middlewares</b>
    - uploadMiddleware.js    ← Multer, PDF only, 5MB max
    - roleMiddleware.js      ← checks req.user.role === 'admin'

    ![enhancement](https://img.shields.io/badge/enhancement-a2eeef)

<br>

* [ ] <b>Career</b>
    - careerController.js   ← getAllCareers()
    - careerRoutes.js       ← GET /api/careers

    ![enhancement](https://img.shields.io/badge/enhancement-a2eeef)

<br>

* [ ] <b>User</b>
    - userController.js     ← getMe(), updateMe(), uploadCv()
    - userRoutes.js         ← wire routes with authMiddleware + uploadMiddleware

    ![enhancement](https://img.shields.io/badge/enhancement-a2eeef)

<br>

* [ ] <b>Admin</b>
    - adminController.js    ← getPendingCompanies(), updateCompanyApproval(),
                               getPendingJobPostings(), updateJobPostingApproval(),
                               getAllUsers(), toggleUserActive()
    - adminRoutes.js        ← wire routes with authMiddleware + roleMiddleware

    ![enhancement](https://img.shields.io/badge/enhancement-a2eeef)

<br>

* [ ] <b>userModel.js — two new functions needed for admin</b>
    - getAllUsers()          ← admin needs to list all users
    - toggleUserActive()    ← admin needs to activate/deactivate users

    ![enhancement](https://img.shields.io/badge/enhancement-a2eeef)

<br>

* [ ] <b>Wire authMiddleware into Azucena's routes</b>
    - companyRoutes.js
    - jobPostingRoutes.js
    - applicationRouter.js

    ![enhancement](https://img.shields.io/badge/enhancement-a2eeef)

<br>

* [ ] <b>index.js</b>
    - Mount all routes
    - Mount errorHandler last

    ![enhancement](https://img.shields.io/badge/enhancement-a2eeef)

<br>

# <img src="https://img.shields.io/badge/frontend-0f766e" alt="frontend" height="30"/>


* [ ] Do all the frontend jajaj



<br>

# <img src="https://img.shields.io/badge/testing-16a34a" alt="testing" height="30" />


* [ ] Example testing task


<br>

# <img src="https://img.shields.io/badge/documentation-0075ca" alt="documentation" height="30" />

* [ ] Example documentation task

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

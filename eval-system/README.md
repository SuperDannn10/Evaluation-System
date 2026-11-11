# Evaluation System

React + TypeScript + Vite. Data and demo accounts are saved in the browser (localStorage).

    npm install
    npm run dev

- **Setup**: define weighted criteria and the people to evaluate.
- **Evaluate**: score each criterion 1-5; the weighted percent updates live.
- **Results**: ranking, per-criterion averages, evaluation log, CSV export.
- **Accounts**: students and administrators use separate sign-in views. Students can create their own account from the Student Portal sign-in screen; student ID is optional during self-registration. Student accounts are saved only in the current browser. Administrators can view and remove accounts in the admin dashboard’s **Student accounts** tab. The local demo admin login is `admin@gmail.com` / `admin12345`.

Rating bands live in `rating()` in `src/store.ts`.

Authentication is for local demonstration only. The demo admin password is included in the frontend and is visible to anyone who can load the app; do not use it to protect real data. Browser-stored credentials do not protect the app from someone who can access the browser or its data. Use a server-backed authentication system before deploying this app for real student or administrator accounts. Sign-in requires a secure browser context such as `localhost` or HTTPS.

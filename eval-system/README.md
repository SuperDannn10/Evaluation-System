# Evaluation System

React + TypeScript + Vite. Data and demo accounts are saved in the browser (localStorage).

    npm install
    npm run dev

- **Setup**: define weighted criteria and the people to evaluate.
- **Evaluate**: score each criterion 1-5; the weighted percent updates live.
- **Results**: ranking, per-criterion averages, evaluation log, CSV export.
- **Accounts**: students and administrators use separate sign-in views. The local demo admin login is `admin@gmail.com` / `admin12345`; use the admin dashboard’s **Student accounts** tab to create student credentials with a unique student ID. The ID appears in the student portal profile.
- **Google student sign-in**: from the `eval-system` folder, run `Copy-Item .env.example .env.local` and fill in the Firebase web app settings from Firebase Console → Project settings → Your apps. Enable Google under Authentication → Sign-in method and add `localhost`, `127.0.0.1`, and your deployed host under Authorized domains. Restart the Vite server after changing environment settings. The first successful Google sign-in creates a student profile in this browser. Firebase uses the Google provider configured in the console; no client secret belongs in this frontend.

Rating bands live in `rating()` in `src/store.ts`.

Authentication is for local demonstration only. The demo admin password is included in the frontend and is visible to anyone who can load the app; do not use it to protect real data. Browser-stored credentials do not protect the app from someone who can access the browser or its data. Use a server-backed authentication system before deploying this app for real student or administrator accounts. Sign-in requires a secure browser context such as `localhost` or HTTPS.

Firebase web config values are public browser configuration, not service-account credentials. Never put a Firebase service-account key or OAuth client secret in `.env.local` or frontend code.

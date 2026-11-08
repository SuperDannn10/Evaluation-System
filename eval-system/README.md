# Evaluation System

React + TypeScript + Vite. Data is saved in the browser (localStorage).

    npm install
    npm run dev

- **Setup**: define weighted criteria and the people to evaluate.
- **Evaluate**: score each criterion 1-5; the weighted percent updates live.
- **Results**: ranking, per-criterion averages, evaluation log, CSV export.

Rating bands live in `rating()` in `src/store.ts`.

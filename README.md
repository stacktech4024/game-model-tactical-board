# Canada Soccer Game Model

Checkpoint 1 establishes the clean project scaffold for the future tactical board tool.

## Stack

- Vite
- React
- TypeScript
- ESLint

## Project shape

- `api/` is reserved for future Vercel serverless functions.
- `src/app/` is reserved for app-shell composition.
- `src/domain/` will hold the scenario truth model.
- `src/pitch/`, `src/players/`, `src/scenarios/`, and `src/simulation/` will hold the tactical model.
- `src/renderers/pixi/` and `src/renderers/layers/` are reserved for the future Pixi renderer.
- `src/data/` and `src/styles/` are ready for shared data and styling assets.

## Scripts

- `npm run dev` starts the local dev server.
- `npm run build` type-checks and builds the app.
- `npm run lint` runs ESLint.

## Notes

React owns the app shell only. The pitch renderer will be Pixi, and the scenario engine will own the source of truth.

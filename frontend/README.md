# Frontend (Vite + React)

Dev server:

```bash
cd frontend
npm install
npm run dev
```

- App available at http://localhost:5173
- Vite proxy forwards `/api` to `http://localhost:8080` so backend should run on port 8080

Files of interest:
- `src/api/coffeeApi.ts` — API layer
- `src/components/*` — UI components
- `src/pages/HomePage.tsx` — main page

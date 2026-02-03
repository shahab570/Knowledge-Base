# Copilot / AI Agent Instructions ✅

Short, actionable notes to help an AI agent be productive in this repository.

## Big picture / architecture 🔧
- This is a small React + Vite single-page app (see `package.json` scripts). UI lives in `src/`.
- Global state is provided via React Contexts:
  - `src/contexts/AuthContext.jsx` — Firebase Authentication (Google sign-in). Use `useAuth()`.
  - `src/contexts/DataContext.jsx` — subscribes to Firestore via `DataService` and exposes `categories`, `subcategories`, helpers like `getSubcategories()` and `DataService` itself.
- Data layer is encapsulated in `src/services/data.js` (Firestore wrappers). Subscriptions return unsubscribe functions (onSnapshot pattern).
- Routing uses nested routes + `Outlet` in `src/App.jsx` with `MainLayout` (`src/components/Layout/MainLayout.jsx`). Notes are nested under subcategory routes.
- Editor is powered by Tiptap (`@tiptap/react`) in `src/pages/NoteEditor.jsx` with a debounced save strategy (1.5s).

## Important files & examples (quick references) 📁
- Firebase config and exports: `src/firebase.js` (auth, db, analytics, googleProvider).
- Firestore API wrappers: `src/services/data.js` (subscribe*, add*, update*, delete*). Example: `DataService.subscribeCategories(uid, cb)`.
- Editor behavior: `src/pages/NoteEditor.jsx` — uses `editor.getHTML()` and `DataService.updateNote()`; debounced autosave uses 1500ms.
- Export utility: `src/utils/exportUtils.js` — exports to `.docx` using `docx` and a simple HTML -> text extraction.
- UI composition examples: `src/components/Sidebar.jsx` (category/subcategory CRUD), `src/pages/SubcategoryView.jsx` (notes list + nested `Outlet`).

## Project-specific conventions & gotchas ⚠️
- Firestore queries do client-side sorting. In `DataService` you’ll see: items.sort((a,b) => (a.order||0)-(b.order||0)). This avoids adding `orderBy` to queries which previously caused a Composite Index error (see comment in `src/services/data.js`).
- Deleting a category currently only deletes the category document. Subcategories and notes are not cascaded automatically (see `src/pages/Settings.jsx` comments). Implement cascading deletes via a cloud function or a client-side recursive loop if needed.
- Firebase credentials are stored in `src/firebase.js` (not env-based in this prototype). Be mindful if moving to production.
- Editor saves are optimistic and debounced — changes set a local `status` and DataService.updateNote updates `updatedAt` using `serverTimestamp()`.

## Dev / build / lint workflows 🚀
- Start dev server: `npm run dev` (Vite + HMR, default port 5173).
- Build for production: `npm run build`.
- Lint: `npm run lint` (uses ESLint via `eslint.config.js`).
- No test runner or test directory is present — add tests alongside components (suggest jest or vitest) if introducing testing.

## Integration & dependency notes 🔗
- Key deps: `firebase` (auth + firestore), `@tiptap/react` (rich text), `docx` (export), `lucide-react` (icons), `react-router-dom` (nested routes).
- Realtime pattern: Data is kept in sync via Firestore `onSnapshot`. Subscriptions return cleanup functions; ensure to call these to avoid leaks (see `DataContext.jsx`).

## Guidance for common tasks / PR hints ✅
- To add a new Firestore-backed collection, follow `DataService` patterns: expose `subscribeX(uid, cb)` returning the `onSnapshot` unsub function, and `addX`, `updateX`, `deleteX` helpers.
- When changing query ordering, add appropriate Firestore indexes or prefer client-side sort for small datasets like this app.
- For features that affect cross-collection data (e.g., deleting category -> delete all notes), prefer server-side/cloud functions or clearly document client-side caveats.

---

If anything is unclear or you'd like more detail on a section (e.g., test setup, cascade-delete design, or migration of Firebase config to env vars), tell me which part to expand. ✨
# Client

This is the frontend of the application, built with **React**. It runs in the browser and communicates with the backend via HTTP requests.

The entry point is `src/main.js`, which mounts the React app to the DOM.

---

## Folder Structure

```
client/
├── public/
└── src/
    ├── main.js
    ├── App.js
    ├── assets/
    ├── components/
    ├── pages/
    ├── services/
    ├── context/
    ├── hooks/
    └── utils/
```

---

## `public/`

Contains **static files** that are served directly without being processed by React.

| File | Purpose |
|------|---------|
| `index.html` | The HTML shell that React mounts into |
| `favicon.ico` | The browser tab icon |

Do not put JavaScript or React components here.

---

## `src/main.js`

The main **entry point** of the frontend. It renders the root `App` component into the `index.html` DOM element. This is where React starts.

---

## `src/App.js`

The **root React component**. It typically sets up the router (e.g. React Router) and defines the top-level layout and navigation of the application.

---

## `src/assets/`

Contains all **static resources** used inside the React app.

Examples:
- Images and icons
- Global CSS or SCSS files
- Fonts

---

## `src/components/`

Contains small, **reusable UI pieces** that can be used across multiple pages.

Each component should do one thing and do it well. Components here are not tied to any specific page.

Examples:
- `Button.tsx`
- `Navbar.tsx`
- `Card.tsx`
- `Modal.tsx`
- `InputField.tsx`

> 💡 If a UI element appears in more than one page, it belongs here.

---

## `src/pages/`

Contains **full page views** that are composed of multiple components. Each file typically corresponds to a route in the application.

Examples:
- `HomePage.jsx`
- `LoginPage.jsx`
- `ProfilePage.jsx`
- `NotFoundPage.jsx`

> 💡 Pages are assembled from components. If a component is only used in one page, it can live in a subfolder of that page (e.g. `pages/Home/HeroBanner.jsx`).

---

## `src/services/`

Contains functions that **communicate with the backend API**. All `fetch` or `axios` calls live here — no page or component should call the API directly.

Examples:
- `personService.js` — `getAllPersons()`, `createPerson()`, `deletePersonById()`
- `authService.js` — `login()`, `logout()`, `register()`

> 💡 This mirrors the `services/` folder on the backend and keeps API logic in one place.

---

## `src/context/`

Contains **React Context** providers for managing global state that needs to be shared across multiple components without prop drilling.

Examples:
- `AuthContext.jsx` — stores the currently logged-in user
- `ThemeContext.jsx` — manages light/dark mode

---

## `src/hooks/`

Contains **custom React hooks** — reusable logic that components can share.

Examples:
- `useAuth.js` — returns the current user and auth functions from context
- `useFetch.js` — handles loading, error, and data state for API calls
- `useForm.js` — manages form input state and validation

---

## `src/utils/`

Small, reusable **helper functions** that do not belong to any specific component or page.

Examples:
- `formatDate.js` — formats date strings consistently
- `validateEmail.js` — checks if an email address is valid
- `capitalize.js` — capitalizes the first letter of a string

---

## Component vs Page — Quick Reference

| Question | Answer |
|----------|--------|
| Is it a full view tied to a URL? | → `pages/` |
| Is it a reusable UI piece? | → `components/` |
| Does it call the backend API? | → `services/` |
| Does it share state across the app? | → `context/` |
| Is it reusable logic (no UI)? | → `hooks/` |
| Is it a small helper function? | → `utils/` |

---

## Communication with the Backend

The client never talks to MongoDB directly. All data goes through the backend API:

```
React Component
  → calls src/services/
  → HTTP request to server (e.g. GET /api/persons)
  → server responds with JSON
  → component renders the data
```

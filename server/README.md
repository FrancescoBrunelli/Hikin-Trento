# Server

This is the backend of the application, built with **Node.js**, **Express**, and **MongoDB Atlas** via Mongoose.

The entry point is `app.js`, located at the root of this folder.

---

## Folder Structure

```
server/
├── app.js
└── src/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── services/
    └── utils/
```

---

## `app.js`

The main entry point of the backend. It initializes the Express app, connects to MongoDB Atlas, registers middleware, and mounts all routes.

---

## `src/config/`

Contains configuration and setup files for the application.

| File | Purpose |
|------|---------|
| `db.js` | Establishes the connection to MongoDB Atlas using the `MONGODB_URI` environment variable |
| `constants.js` | App-wide constants such as port number, token expiry times, and other fixed values |

> ⚠️ Never hardcode credentials here. Always use environment variables via `.env`.

---

## `src/models/`

Defines the **data structures** of the application using Mongoose schemas. Each file represents one entity (e.g. `Person`, `User`, `Product`).

Schemas define:
- Fields and their data types
- Validation rules
- Default values
- Relationships between entities

Example: `models/Person.js` defines the structure of a Person document in MongoDB.

---

## `src/routes/`

Maps **HTTP endpoints to controller functions**. Each file groups the routes for one entity.

No business logic lives here — routes simply define which controller function to call for each URL and HTTP method (GET, POST, PUT, DELETE).

Example: `routes/personRoutes.js` maps `GET /api/persons` to `personController.getAll`.

---

## `src/controllers/`

Handles the **HTTP layer** of the application. Each controller function:
- Receives the incoming request (`req`)
- Calls the appropriate service function
- Sends back the response (`res`)

Controllers do not contain business logic — they delegate to services and format the HTTP response.

Example: `controllers/personController.js` contains functions like `getAll`, `getById`, `create`, `update`, `delete`.

---

## `src/services/`

Contains the **business logic** of the application. This is the brain of the backend.

Services interact directly with models (MongoDB) and implement all the rules and operations of the application. Controllers call services — services never call controllers.

Example: `services/personService.js` contains functions like `getAllPersons()`, `createPerson()`, `deletePersonById()`.

---

## `src/middleware/`

Functions that execute **between the incoming request and the route handler**. Middleware is used for cross-cutting concerns that apply to multiple routes.

Common middleware files:

| File | Purpose |
|------|---------|
| `auth.js` | Verifies JWT tokens and protects private routes |
| `errorHandler.js` | Catches and formats errors globally |
| `logger.js` | Logs details of every incoming request |

---

## `src/utils/`

Small, reusable **helper functions** that do not belong to any specific layer. Used across the entire backend.

Examples:
- `generateToken.js` — creates a JWT token
- `hashPassword.js` — hashes a password using bcrypt
- `formatDate.js` — formats date values consistently

---

## Request Flow

```
Incoming Request
  → routes/        (which endpoint?)
  → middleware/    (is the request valid/authenticated?)
  → controllers/   (handle req and res)
  → services/      (apply business logic)
  → models/        (read/write to MongoDB Atlas)
  → controllers/   (send response)
Outgoing Response
```

---

## Environment Variables

Create a `.env` file at the root of the project (never commit it). Use `.env.example` as a template:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>
PORT=3000
JWT_SECRET=your_secret_key
```

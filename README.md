# Store Rating App (Frontend + Backend, PostgreSQL)

This version separates the project into:

- `frontend/` — Vite + React + Tailwind client.
- `backend/` — Node.js + Express API using **PostgreSQL**.

## Quick Start

### Backend

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Configure environment:

   update .env with credentials

3. Make sure PostgreSQL is running and the database exists.

4. Start the backend:

   ```bash
   npm run dev
   # or
   npm start
   ```

### Frontend

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Default CORS in the backend allows `http://localhost:5173`.

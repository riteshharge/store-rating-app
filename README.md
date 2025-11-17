# ⭐ Store Rating Application

A full-stack web application where users can rate stores, leave comments, and manage profiles.  
Built with **React + Tailwind + Node.js + Express + PostgreSQL**, deployed on **Render (Backend + Frontend)** and **Neon PostgreSQL**.

---

# 🚀 Live Project Links

### 🌐 Frontend

**https://store-rating-application-nusg.onrender.com**

### 🛠 Backend API

**https://store-rating-app-5p1c.onrender.com**

---

# 📦 1. TECHNOLOGIES USED

### **Frontend**

- React.js (Vite)
- Tailwind CSS
- Lucide React Icons
- Axios
- React Context API

### **Backend**

- Node.js
- Express.js
- PostgreSQL (Neon Cloud)
- Bcrypt
- Jsonwebtoken
- CORS
- pg (node-postgres)

### **Database**

- PostgreSQL (Neon Cloud)
- Connection Pooler Enabled
- Auto-migrated schema

---

# 🗂 2. PROJECT STRUCTURE

```
backend/
 ├── config/
 │   └── database.js
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middleware/
 ├── index.js
 └── .env

frontend/
 ├── src/
 │   ├── pages/
 │   ├── contexts/
 │   ├── services/
 │   ├── components/
 │   └── App.jsx
 ├── index.html
 ├── tailwind.config.js
 └── .env
```

---

# ⚙️ 3. INSTALLATION (LOCAL DEVELOPMENT)

### **Clone repository**

```sh
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

---

# 📌 4. BACKEND SETUP

### Install dependencies

```sh
cd backend
npm install
```

### Create `.env`

```
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret_here

# Local PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=YOUR_LOCAL_PG_PASSWORD
DB_NAME=store_rating_app

# Production Neon Database
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-plain-mouse-aduh4cka-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Start backend

```sh
npm start
```

Backend auto-creates:

- users
- stores
- ratings
- default admin user

---

# 🖥 5. FRONTEND SETUP

### Install dependencies

```sh
cd frontend
npm install
```

### Create `.env`

```
VITE_API_URL=http://localhost:5000/api
```

### Start frontend

```sh
npm run dev
```

---

# 🚀 6. DEPLOYMENT ON RENDER

## **Backend Deployment**

### Build Command

```
npm install
```

### Start Command

```
node index.js
```

### Add Environment Variables (IMPORTANT)

```
NODE_ENV=production
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-plain-mouse-aduh4cka-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Must Enable:

✔ Auto-Deploy  
✔ Connection Pooling (default)  
✔ Install from root directory (backend folder)

---

## **Frontend Deployment**

### Build Command

```
npm run build
```

### Publish Directory

```
dist
```

### Environment Variable

```
VITE_API_URL=https://store-rating-app-5p1c.onrender.com/api
```

---

# 🔄 7. DATABASE MIGRATION (LOCAL → NEON)

### Dump local database

```sh
pg_dump -U postgres -d store_rating_app -F c -f local_backup.dump
```

### Restore into Neon

```sh
pg_restore --verbose --clean --no-owner --no-privileges `
  -h ep-plain-mouse-aduh4cka-pooler.c-2.us-east-1.aws.neon.tech `
  -U neondb_owner `
  -d neondb `
  --schema=public local_backup.dump
```

---

# 📡 8. CORS CONFIGURATION

Backend auto-detects environment:

```js
const allowedOrigins = [
  "https://store-rating-application-nusg.onrender.com", // production frontend
];

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173");
}
```

---

# 🔑 9. DEFAULT ADMIN LOGIN

After DB init:

```
email: admin@store.com
password: Admin123!
```

---

# ✔️ 10. FEATURES

### 🔐 Authentication

- JWT login
- Role-based access: admin, store owner, user

### ⭐ User Features

- Rate stores (1–5 stars)
- Add comments
- Edit profile
- Change password
- View rating history

### 🏪 Store Owner Features

- Manage own stores
- View customer ratings

### 🛠 Admin Features

- Dashboard metrics
- Manage users
- View all stores
- System-wide control

---

# 🎨 11. UI / UX

- Tailwind custom theme
- Modern card layout
- Animated components
- Professional design for recruiters

---

# 🧪 12. HEALTH CHECKS

### Backend

```
/api/health
/api/db-health
```

---

# ❤️ 13. AUTHOR

**Ritesh Shivappa Harge**  
Full Stack Developer — React | Node | Express | PostgreSQL | MongoDB
GitHub: https://github.com/riteshharge

---

# 📜 License

This project is open-source and free to use.

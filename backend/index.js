const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initializeDatabase, pool } = require("./config/database");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const storeRoutes = require("./routes/stores");
const ratingRoutes = require("./routes/ratings");

const app = express();

/*
    CORS CONFIG — COMPLETE FIX FOR DEPLOYMENT
*/
/*
    CORS CONFIG — COMPLETE FIX FOR DEPLOYMENT  
*/
const allowedOrigins = [
  "https://store-rating-application-nusg.onrender.com",
  "https://store-rating-app-5p1c.onrender.com",
];

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173");
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.log("❌ CORS BLOCKED ORIGIN:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// IMPORTANT — FIX FOR DEPLOYMENT
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* 
   ROUTES
*/
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);

/*
   HEALTH CHECK — REQUIRED BY RENDER
*/
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/*
   DATABASE HEALTH CHECK
*/
app.get("/api/db-health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ DB health failed:", error.message);
    res.status(500).json({ db: "error", error: error.message });
  }
});

/*
   GLOBAL ERROR HANDLER
*/
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.message);
  res.status(500).json({
    error: "Internal Server Error",
    detail: err.message,
  });
});

/*
   404 HANDLER — SAFE FOR EXPRESS v5
*/
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/*
   START SERVER
*/
const PORT = process.env.PORT || 5000;

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log("🌍 Allowed CORS Origins:", allowedOrigins);
    });
  })
  .catch((error) => {
    console.error("❌ ERROR STARTING SERVER:", error);
    process.exit(1);
  });

module.exports = app;

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
   CORS CONFIG — detects DEV vs PROD automatically
 */
const allowedOrigins = [
  "https://store-rating-application-nusg.onrender.com", // FRONTEND on Render
];

// Allow localhost only when developing
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173");
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow Postman, mobile, Render internal

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS BLOCKED:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

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
   HEALTH CHECK — REQUIRED for Render
 */
app.get("/api/health", (req, res) => {
  res.json({
    message: "Server running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/*
   DB HEALTH CHECK
 */
app.get("/api/db-health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ DB health check failed:", error.message);
    res.status(500).json({ db: "error", error: error.message });
  }
});

/* 
   ERROR HANDLER
 */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({ error: "Internal server error", detail: err.message });
});

/* 
   404 HANDLER — MUST NOT USE "*" in Express v5
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
      console.log("Allowed CORS Origins:", allowedOrigins);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  });

module.exports = app;

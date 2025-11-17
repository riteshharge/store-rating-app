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
   CORS CONFIG — auto detects dev or production
 */
const allowedOrigins = [
  "https://store-rating-application-nusg.onrender.com", // FRONTEND (Render)
];

// Allow localhost only in development
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173");
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow mobile/postman etc.

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);

/* 
   HEALTH CHECK (RENDER requires this)
 */
app.get("/api/health", (req, res) => {
  res.json({
    message: "Server running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/* 
   DB HEALTH CHECK  (fixed pg connection)
 */
app.get("/api/db-health", async (req, res) => {
  try {
    await pool.query("SELECT 1"); // SIMPLE TEST QUERY

    res.json({
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ DB health failed:", error);
    res.status(500).json({ db: "error", error: error.message });
  }
});

/* 
   ERROR HANDLERS
 */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({ error: "Internal server error", detail: err.message });
});

// 404
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* 
   START SERVER
 */
const PORT = process.env.PORT || 5000;

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
      console.log("Allowed Origins:", allowedOrigins);
    });
  })
  .catch((err) => {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  });

module.exports = app;

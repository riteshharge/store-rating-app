const { validationResult } = require("express-validator");
const { pool } = require("../config/database"); // PG Pool
const Rating = require("../models/Rating");

// SUBMIT OR UPDATE RATING

// SUBMIT RATING CONTROLLER

exports.submitRating = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { store_id, rating, comment } = req.body;

    // 1. Create or Update rating
    await Rating.createOrUpdate({
      user_id,
      store_id,
      rating,
      comment,
    });

    // 2. Recalculate average rating
    const [avgResult] = await pool.execute(
      `SELECT 
         ROUND(AVG(rating)::numeric, 2) AS average_rating,
         COUNT(*) AS total_ratings
       FROM ratings
       WHERE store_id = ?`,
      [store_id]
    );

    const newAverage = avgResult[0].average_rating || 0;
    const totalRatings = avgResult[0].total_ratings || 0;

    // 3. Update store table
    await pool.execute(
      `UPDATE stores 
       SET average_rating = ?, updated_at = NOW()
       WHERE id = ?`,
      [newAverage, store_id]
    );

    // 4. Success response
    return res.json({
      message: "Rating submitted successfully",
      average_rating: newAverage,
      total_ratings: totalRatings,
    });
  } catch (error) {
    console.error("Submit rating error:", error);
    return res.status(500).json({ error: "Failed to submit rating" });
  }
};

exports.getStoreRatings = async (req, res) => {
  try {
    const storeId = req.params.storeId; // ⭐ FIXED

    const ratings = await Rating.getStoreRatings(storeId);

    return res.json({ ratings });
  } catch (error) {
    console.error("Get store ratings error:", error);
    return res.status(500).json({ error: "Failed to load ratings" });
  }
};

// GET USER RATINGS

exports.getUserRatings = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, r.store_id,
              s.name AS store_name, s.address AS store_address
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [user_id]
    );

    return res.json({ ratings: result.rows });
  } catch (err) {
    console.error("Get user ratings error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET STORE WITH ITS RATINGS

exports.getStoreWithUserRating = async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await pool.query("SELECT * FROM stores WHERE id = $1", [
      storeId,
    ]);

    if (store.rowCount === 0) {
      return res.status(404).json({ error: "Store not found" });
    }

    const ratings = await pool.query(
      `SELECT r.*, u.name AS user_name
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [storeId]
    );

    return res.json({
      store: {
        ...store.rows[0],
        ratings: ratings.rows,
        average_rating: Number(store.rows[0].average_rating || 0).toFixed(2),
      },
    });
  } catch (err) {
    console.error("Get store rating list error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE RATING

exports.deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const user_id = req.user.id;

    // Check rating exists and belongs to the user
    const ratingCheck = await pool.query(
      "SELECT * FROM ratings WHERE id = $1 AND user_id = $2",
      [ratingId, user_id]
    );

    if (ratingCheck.rowCount === 0) {
      return res.status(404).json({
        error: "Rating not found or not owned by this user",
      });
    }

    const store_id = ratingCheck.rows[0].store_id;

    // Delete rating
    await pool.query("DELETE FROM ratings WHERE id = $1 AND user_id = $2", [
      ratingId,
      user_id,
    ]);

    // ⭐ Recalculate average rating (2 decimals)
    await pool.query(
      `UPDATE stores 
       SET average_rating = (
         SELECT ROUND(COALESCE(AVG(rating), 0)::numeric, 2)
         FROM ratings
         WHERE store_id = $1
       )
       WHERE id = $1`,
      [store_id]
    );

    return res.json({ message: "Rating deleted successfully" });
  } catch (err) {
    console.error("Delete rating error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

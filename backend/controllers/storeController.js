const { validationResult } = require("express-validator");
const Store = require("../models/Store");
const User = require("../models/User");

// CREATE STORE (Admin Only)

exports.createStore = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, address, owner_id } = req.body;

    console.log("Creating store:", name, email, address, owner_id);

    // Check if store exists
    const existing = await Store.findAll({ name });
    const found = existing.find(
      (s) => s.email === email || s.name.toLowerCase() === name.toLowerCase()
    );

    if (found) {
      return res.status(400).json({
        error: "Store already exists with this name or email",
      });
    }

    // Verify owner exists & role is store_owner
    const owner = await User.findById(owner_id);
    if (!owner || owner.role !== "store_owner") {
      return res.status(400).json({
        error: "Invalid owner. User must have store_owner role",
      });
    }

    const storeId = await Store.create({ name, email, address, owner_id });

    res.status(201).json({
      message: "Store created successfully",
      store: {
        id: storeId,
        name,
        email,
        address,
        owner_id,
      },
    });
  } catch (error) {
    console.error("Create store error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET ALL STORES (Public)

exports.getAllStores = async (req, res) => {
  try {
    const { name, address, sortBy, sortOrder } = req.query;

    const stores = await Store.findAll({
      name: name || null,
      address: address || null,
      sortBy,
      sortOrder,
    });

    res.json({ stores });
  } catch (error) {
    console.error("Get stores error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET STORE BY ID (Public)
// With rating summary

exports.getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Fetch ratings for this store
    const ratings = await Store.getStoreRatings(id);

    // Build rating distribution (1–5)
    const rating_distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    ratings.forEach((r) => {
      rating_distribution[r.rating] = (rating_distribution[r.rating] || 0) + 1;
    });

    // Compute average rating
    const total_ratings = ratings.length;
    const average_rating =
      total_ratings > 0
        ? Number(ratings.reduce((sum, r) => sum + r.rating, 0) / total_ratings)
        : 0;

    res.json({
      store: {
        ...store,
        average_rating: Number(average_rating), // Always number
        total_ratings,
        rating_distribution,
      },
    });
  } catch (error) {
    console.error("Get store error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// STORE OWNER DASHBOARD

exports.getStoreOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const stores = await Store.findByOwnerId(ownerId);
    if (!stores || stores.length === 0) {
      return res.status(404).json({ error: "Store not found for this owner" });
    }

    const store = stores[0];
    const storeDetails = await Store.findById(store.id);
    const ratings = await Store.getStoreRatings(store.id);

    res.json({
      store: storeDetails,
      ratings,
    });
  } catch (error) {
    console.error("Get store owner dashboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

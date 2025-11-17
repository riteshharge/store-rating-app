const { validationResult } = require("express-validator");
const User = require("../models/User");
const Store = require("../models/Store");
const Rating = require("../models/Rating");

/* 
   CREATE USER
 */
exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, address, role } = req.body;

    const allowedRoles = ["user", "store_owner", "admin"];
    const finalRole = allowedRoles.includes(role) ? role : "user";

    const existing = await User.findByEmail(email);
    if (existing) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    const userId = await User.create({
      name,
      email,
      password,
      address,
      role: finalRole,
    });

    const createdUser = await User.findById(userId);

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        address: createdUser.address,
        role: createdUser.role,
        created_at: createdUser.created_at,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* 
   GET ALL USERS WITH CLEAN FORMAT
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy, sortOrder } = req.query;

    const filters = { name, email, address, role, sortBy, sortOrder };
    const users = await User.getAllUsers(filters);

    const usersWithRatings = await Promise.all(
      users.map(async (user) => {
        if (user.role === "store_owner") {
          const stores = await Store.findByOwnerId(user.id);

          if (stores && stores.length > 0) {
            const store = stores[0];
            const storeDetails = await Store.findById(store.id);

            user.store_rating = storeDetails?.average_rating || 0;
          } else {
            user.store_rating = 0;
          }
        }

        return user;
      })
    );

    res.json({ users: usersWithRatings });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* 
   GET USER BY ID
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const ratings = await Rating.getUserRatings(user.id);
    const totalRatings = ratings.length;

    let store_rating = 0;
    if (user.role === "store_owner") {
      const stores = await Store.findByOwnerId(user.id);
      if (stores?.length > 0) {
        const storeDetails = await Store.findById(stores[0].id);
        store_rating = Number(storeDetails?.average_rating) || 0;
      }
    }

    const userData = {
      ...user,
      created_at: user.created_at,
      total_ratings: totalRatings,
      store_rating,
      member_since: user.created_at,
    };

    res.json({ user: userData });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* 
   GET USERS BY ROLE
 */
exports.getUsersByRole = async (req, res) => {
  try {
    const role = req.params.role;
    const users = await User.getUsersByRole(role);
    return res.json({ users });
  } catch (err) {
    console.error("Error fetching users by role:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/* 
   GET DASHBOARD STATS
*/
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.getUsersCount();
    const totalStores = await Store.getStoresCount();
    const totalRatings = await Rating.getRatingsCount();

    res.json({
      stats: {
        totalUsers,
        totalStores,
        totalRatings,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

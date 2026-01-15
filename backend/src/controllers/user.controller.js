const User = require("../models/User");

/**
 * @desc    Get all users (ADMIN only)
 * @route   GET /api/users
 * @access  ADMIN
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      { role: "USER" }, // only normal users
      { _id: 1, name: 1, email: 1 }
    );

    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

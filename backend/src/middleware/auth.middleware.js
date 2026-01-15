const admin = require("../config/firebase");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseUser = decoded;

    let user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      // Use decoded.name or first part of email before @
      const defaultName = decoded.name || (decoded.email ? decoded.email.split("@")[0] : "");
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: defaultName,
      });
    }

    req.dbUser = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

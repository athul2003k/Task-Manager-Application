const router = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
const authController = require("../controllers/auth.controller");

router.get("/me",authMiddleware, authController.getMe);

module.exports = router;


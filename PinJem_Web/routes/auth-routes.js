const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");

router.get("/", (req, res) => {
  res.redirect("/login");
});

router.get("/login", authController.showLoginPage);
router.post("/login", authController.getLogin);
router.get("/logout", authController.getLogout);

module.exports = router;

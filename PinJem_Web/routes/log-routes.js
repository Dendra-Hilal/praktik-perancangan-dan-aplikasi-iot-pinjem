const express = require("express");
const router = express.Router();
const LogController = require("../controllers/log-controller");
const { isAuthenticated } = require("../middlewares/auth-middleware");

router.get("/", isAuthenticated, LogController.showLogPage);

module.exports = router;

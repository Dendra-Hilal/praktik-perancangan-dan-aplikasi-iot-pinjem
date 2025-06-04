const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard-controller');
const { isAuthenticated } = require('../middlewares/auth-middleware');

router.get('/', isAuthenticated, dashboardController.getDashboardPage);
router.get('/data', isAuthenticated, dashboardController.getData);

module.exports = router;
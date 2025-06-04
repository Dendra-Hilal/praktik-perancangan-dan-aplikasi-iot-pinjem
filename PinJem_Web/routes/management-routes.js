const express = require("express");
const router = express.Router();
const managementController = require("../controllers/management-controller");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth-middleware");

router.get("/", isAuthenticated, authorizeRoles("administrator"), managementController.getManagementPage);
router.get("/create", isAuthenticated, authorizeRoles("administrator"), managementController.getCreateUserPage);
router.post("/create", isAuthenticated, authorizeRoles("administrator"), managementController.postCreateUser);
router.get("/edit/:id", isAuthenticated, authorizeRoles("administrator"), managementController.getEditUserPage);
router.post("/edit/:id", isAuthenticated, authorizeRoles("administrator"), managementController.postEditUser);
router.get("/delete/:id", isAuthenticated, authorizeRoles("administrator"), managementController.postDeleteUser);

module.exports = router;
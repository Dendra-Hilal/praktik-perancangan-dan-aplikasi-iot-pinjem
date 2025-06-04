const managementModel = require("../models/management-model");

exports.getManagementPage = async (req, res) => {
  try {
    const users = req.session.user;
    const data = await managementModel.getAllUsers();
    res.render("management/index", { title: "Management", data, users: users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCreateUserPage = (req, res) => {
  res.render("management/add", { title: "Create User" });
};

exports.postCreateUser = async (req, res) => {
  const { username, role, email, password } = req.body;

  try {
    await managementModel.createUser(username, role, email, password);
    res.redirect("/management");
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getEditUserPage = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await managementModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.render("management/edit", { title: "Edit User", user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.postEditUser = async (req, res) => {
  const id = req.params.id;
  const { username, role, email, password } = req.body;

  try {
    await managementModel.updateUser(id, username, role, email, password);
    res.redirect("/management");
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.postDeleteUser = async (req, res) => {
  const id = req.params.id;

  try {
    await managementModel.deleteUser(id);
    res.redirect("/management");
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

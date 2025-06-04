const dashboardModel = require("../models/dashboard-model");

exports.getDashboardPage = (req, res) => {
  const users = req.session.user;
  res.render("dashboard/index", { title: "Dashboard", users: users });
};

exports.getData = async (req, res) => {
  try {
    const history = await dashboardModel.getDashboardData();
    res.status(200).json(history);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ err: "Internal server error" });
  }
};

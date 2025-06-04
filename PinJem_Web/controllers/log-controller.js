const LogModel = require("../models/log-model");

exports.showLogPage = async (req, res) => {
  try {
    const users = req.session.user;
    const selectedDate = req.query.date || new Date().toISOString().split("T")[0];

    const readings = await LogModel.getReadingsByDate(selectedDate);
    const rainSummary = await LogModel.getRainSummary(selectedDate);
    const roofChanges = LogModel.getRoofChangesFromReadings(readings);

    const rainDetail = readings.map((r) => ({
      date: r.timestamp,
      is_raining: r.is_raining,
    }));

    res.render("log/index", {
      title: "System Log",
      users,
      selectedDate,
      rainSummary,
      rainDetail,
      roofChanges,
    });
  } catch (error) {
    console.error("Error fetching log data:", error);
    res.status(500).send("Internal Server Error");
  }
};

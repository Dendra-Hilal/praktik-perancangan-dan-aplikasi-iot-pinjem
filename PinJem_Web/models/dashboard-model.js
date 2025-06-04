const database = require("../configs/database");
const { HISTORY_LIMIT } = require("../configs/config");

module.exports = {
  getDashboardData: async () => {
    try {
      const sql = `SELECT ldr_value, is_raining, mode, roof_state FROM pinjem_readings ORDER BY timestamp DESC LIMIT ?`;
      const [rows] = await database.query(sql, [HISTORY_LIMIT]);
      return rows.reverse();
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      throw err;
    }
  },
};

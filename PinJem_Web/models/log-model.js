const database = require("../configs/database");

module.exports = {
  getReadingsByDate: async (date) => {
    const sql = `
      SELECT id, timestamp, roof_state, mode, is_raining
      FROM pinjem_readings
      WHERE DATE(timestamp) = ?
      ORDER BY timestamp ASC
    `;
    const [rows] = await database.query(sql, [date]);
    return rows;
  },

  getRainSummary: async (date) => {
    const sql = `
      SELECT MAX(is_raining) AS is_raining
      FROM pinjem_readings
      WHERE DATE(timestamp) = ?
    `;
    const [rows] = await database.query(sql, [date]);
    return rows[0];
  },

  getRoofChangesFromReadings: (readings) => {
    const changes = [];
    let prev = null;

    readings.forEach((item) => {
      if (prev === null || item.roof_state !== prev.roof_state) {
        changes.push(item);
      }
      prev = item;
    });

    return changes;
  },
};

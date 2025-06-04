const database = require("../configs/database");

module.exports = {
  getUserByEmail: async (email) => {
    try {
      const query = `SELECT * FROM users WHERE email = ?`;
      const [rows] = await database.query(query, [email]);
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      console.error("Error fetching user by email:", err);
      throw new Error("Database error");
    }
  },
};

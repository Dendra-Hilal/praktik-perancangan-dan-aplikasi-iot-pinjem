const database = require("../configs/database");
const bcrypt = require("bcrypt");

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

module.exports = {
  getAllUsers: async () => {
    try {
      const query = `SELECT * FROM users`;
      const [rows] = await database.query(query);
      return rows;
    } catch (err) {
      console.error("Error fetching users:", err);
      throw err;
    }
  },

  getUserById: async (id) => {
    try {
      const query = `SELECT * FROM users WHERE id = ?`;
      const [rows] = await database.query(query, [id]);
      return rows[0];
    } catch (err) {
      console.error("Error fetching user:", err);
      throw err;
    }
  },

  createUser: async (username, role, email, password) => {
    try {
      const query = `INSERT INTO users (username, role, email, password) VALUES (?, ?, ?, ?)`;
      const hashedPassword = await hashPassword(password);
      const [result] = await database.query(query, [username, role, email, hashedPassword]);
      return result;
    } catch (err) {
      console.error("Error creating user:", err);
      throw err;
    }
  },

  updateUser: async (id, username, role, email, password) => {
    try {
      const query = `UPDATE users SET username = ?, role = ?, email = ?, password = ? WHERE id = ?`;
      const [result] = await database.query(query, [username, role, email, password, id]);
      return result;
    } catch (err) {
      console.error("Error updating user:", err);
      throw err;
    }
  },

  deleteUser: async (id) => {
    try {
      const query = `DELETE FROM users WHERE id = ?`;
      const [result] = await database.query(query, [id]);
      return result;
    } catch (err) {
      console.error("Error deleting user:", err);
      throw err;
    }
  },
};

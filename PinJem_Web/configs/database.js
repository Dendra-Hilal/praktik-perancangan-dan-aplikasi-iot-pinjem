const mysql = require("mysql2/promise");
const { MYSQL_CONFIG } = require("./config");

const database = mysql.createPool(MYSQL_CONFIG);

database.getConnection((error) => {
  if (error) {
    console.error("Error connecting to the database:", error);
  } else {
    console.log("Connected to the database successfully.");
  }
});

module.exports = database;

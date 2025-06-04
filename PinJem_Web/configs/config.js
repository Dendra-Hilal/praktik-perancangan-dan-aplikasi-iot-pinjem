require("dotenv").config();

module.exports = {
  MQTT_BROKER_URL: process.env.MQTT_BROKER_URL || "mqtt://broker.emqx.io",

  MQTT_OPTIONS: {
    clientId: (process.env.MQTT_CLIENT_ID_PREFIX || "NodeJS_PinJem_Server_") + Math.random().toString(16).substr(2, 8),
    clean: true,
    connectTimeout: parseInt(process.env.MQTT_CONNECT_TIMEOUT) || 4000,
  },

  UNIQUE_ID: process.env.UNIQUE_ID || "AbCdEf1234",

  MYSQL_CONFIG: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "iot_data",
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0,
  },

  WEB_PORT: parseInt(process.env.WEB_PORT) || 3000,

  HISTORY_LIMIT: parseInt(process.env.HISTORY_LIMIT) || 100,
};

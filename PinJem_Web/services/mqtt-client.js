const mqtt = require("mqtt");
const database = require("../configs/database");
const { MQTT_BROKER_URL, MQTT_OPTIONS, UNIQUE_ID } = require("../configs/config");

const dataSensor = `sensor/pinjem/data/${UNIQUE_ID}`;

let mqttClient;

function connectMQTT(io) {
  console.log(`Connecting to ${MQTT_BROKER_URL} ...`);
  mqttClient = mqtt.connect(MQTT_BROKER_URL, MQTT_OPTIONS);

  mqttClient.on("connect", () => {
    console.log("Connected to MQTT broker");
    mqttClient.subscribe(dataSensor, { qos: 0 }, (err) => {
      if (err) {
        console.error("Failed to subscribe to topic:", err);
      } else {
        console.log(`Subscribed to topic: ${dataSensor}`);
      }
    });
  });

  mqttClient.on("message", async (topic, message) => {
    if (topic === dataSensor) {
      const data = JSON.parse(message.toString());
      console.log("Received data:", data);

      try {
        if (data.ldr_value === undefined || data.is_raining === undefined) {
          console.error("Invalid data format:", data);
          return;
        }

        const sql = `INSERT INTO pinjem_readings (ldr_value, is_raining, mode, roof_state) VALUES (?, ?, ?, ?)`;
        const values = [data.ldr_value, data.is_raining, data.mode, data.roof_state];
        const [result] = await database.query(sql, values);
        console.log("Data saved to database:", result);

        io.emit("updateData", { ...data, timestamp: new Date() });
      } catch (error) {
        console.error("Error saving data to database:", error);
      }
    }
  });

  mqttClient.on("error", (err) => {
    console.error("MQTT error:", err);
    setTimeout(() => {
      console.log("Reconnecting to MQTT broker...");
      connectMQTT(io);
    }, 5000);
  });

  mqttClient.on("close", () => {
    console.log("MQTT connection closed. Attempting to reconnect...");
    setTimeout(() => {
      connectMQTT(io);
    }, 5000);
  });

  mqttClient.on("offline", () => {
    console.log("MQTT client is offline. Attempting to reconnect...");
    setTimeout(() => {
      connectMQTT(io);
    }, 5000);
  });

  return mqttClient;
}

module.exports = { connectMQTT };

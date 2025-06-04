const { UNIQUE_ID } = require("../configs/config");

const servoCommand = `servo/pinjem/command/${UNIQUE_ID}`;
const modeCommand = `mode/pinjem/command/${UNIQUE_ID}`;

function setupSocketIO(io, mqttClient) {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });

    socket.on("sendServoCommand", (command) => {
      if (["OPEN", "CLOSE"].includes(command)) {
        console.log("Received servo command:", command);
        mqttClient.publish(servoCommand, command, { qos: 0 }, (err) => {
          if (err) {
            console.error("Failed to send servo command:", err);
          } else {
            console.log("Servo command sent successfully");
          }
        });
      }
    });

    socket.on("sendModeCommand", (command) => {
      if (command === "AUTO") {
        console.log("Received mode command:", command);
        mqttClient.publish(modeCommand, command, { qos: 0 }, (err) => {
          if (err) {
            console.error("Failed to send mode command:", err);
          } else {
            console.log("Mode command sent successfully");
          }
        });
      }
    });
  });
}

module.exports = { setupSocketIO };

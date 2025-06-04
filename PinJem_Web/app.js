const express = require("express");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const { WEB_PORT } = require("./configs/config");

const { Server } = require("socket.io");
const { connectMQTT } = require("./services/mqtt-client");
const { setupSocketIO } = require("./services/socket-handler");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const mqttClient = connectMQTT(io);
setupSocketIO(io, mqttClient);

app.set("view engine", "ejs");
app.set("views", "./views/pages");
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "pexuEaWz5edB",
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

const authRoutes = require("./routes/auth-routes");
const dashboardRoutes = require("./routes/dashboard-routes");
const managementRoutes = require("./routes/management-routes");
const logRoutes = require("./routes/log-routes");

app.use("/", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/management", managementRoutes);
app.use("/log", logRoutes);

server.listen(WEB_PORT, () => {
  console.log(`Server is running on http://localhost:${WEB_PORT}`);
});

process.on("SIGINT", () => {
  console.log("Shutting down server...");
  mqttClient.end(() => {
    console.log("MQTT client disconnected");
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  });
});

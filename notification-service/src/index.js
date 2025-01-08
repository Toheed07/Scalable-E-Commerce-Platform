const express = require("express");
const dotenv = require("dotenv");
const promClient = require("prom-client");
const notificationRoutes = require("../route/notificationRouter");

dotenv.config();

const app = express();

app.use(express.json());

const register = new promClient.Registry();

const httpRequestsTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "status"],
});

register.registerMetric(httpRequestsTotal);

app.get("/", (req, res) => {
  httpRequestsTotal.inc({ method: "GET", status: "200" });
  res.send("Hello World");
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.send(await register.metrics());
});

app.use("v1/api/notification", notificationRoutes);

const PORT = process.env.PORT || 4005;

app.listen(PORT, () =>
  console.log(`Notification Service running on port ${PORT}`)
);

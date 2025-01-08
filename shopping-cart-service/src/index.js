const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const promClient = require("prom-client");
const corsOptions = require("../config/corsOptions");
const connectDB = require("../config/dbConn");
const cartRouter = require("./route/cartRouter");

dotenv.config();

const PORT = process.env.PORT || 4002;

const app = express();

app.use(cors(corsOptions));

app.use(express.json());

connectDB();

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

app.use("/v1/api/cart", cartRouter);

mongoose.connection.once("open", () => {
  console.log("Cart Service Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

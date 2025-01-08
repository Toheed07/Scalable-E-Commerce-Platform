const express = require("express");
const dotenv = require("dotenv");
const notificationRoutes = require("../route/notificationRouter");

dotenv.config();

const app = express();

app.use(express.json());

app.use("v1/api/notification", notificationRoutes);

const PORT = process.env.PORT || 4005;

app.listen(PORT, () =>
  console.log(`Notification Service running on port ${PORT}`)
);

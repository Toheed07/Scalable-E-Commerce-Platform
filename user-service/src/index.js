const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const corsOptions = require("../config/corsOptions");
const connectDB = require("../config/dbConn");
const userRouter = require("./route/userRouter");

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();

app.use(cors(corsOptions));

app.use(express.json());

app.use("/v1/api/users", userRouter);

connectDB();

mongoose.connection.once("open", () => {
  console.log("User Service Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

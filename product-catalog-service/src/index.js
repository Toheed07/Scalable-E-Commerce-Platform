const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const corsOptions = require("../config/corsOptions");
const connectDB = require("../config/dbConn");
const productRouter = require("./route/productRouter");

dotenv.config();

const PORT = process.env.PORT || 4001;

const app = express();

app.use(cors(corsOptions));

app.use(express.json());

app.use("/v1/api/products", productRouter);

connectDB();

mongoose.connection.once("open", () => {
  console.log("Product Service Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

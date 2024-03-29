require("dotenv").config();
const express = require("express");

const mongoose = require("mongoose");
const app = express();
const authRouter = require("./routes/auth");
const statusRouter = require("./routes/status");
//process.env.PORT ||
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("mongoDB connected");
  })
  .catch((err) => {
    console.log(err);
  });
app.use(express.urlencoded({ extended: false }));
app.use(authRouter);
app.use(statusRouter);
app.listen(PORT, () => {
  console.log(`connect at ${PORT}`);
});

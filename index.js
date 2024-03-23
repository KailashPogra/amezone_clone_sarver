const express = require("express");
const mongoose = require("mongoose");
const app = express();
const authRouter = require("./routes/auth");
const PORT = 3000;

mongoose
  .connect("mongodb://localhost:27017/amezone")
  .then(() => {
    console.log("mongoDB connected");
  })
  .catch((err) => {
    console.log(err);
  });
app.use(express.json());
app.use(authRouter);
app.listen(PORT, () => {
  console.log(`connect at ${PORT}`);
});

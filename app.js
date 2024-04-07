require("dotenv").config();
const express = require("express");

const mongoose = require("mongoose");
const app = express();
const authRouter = require("./routes/auth");
const updateRouter = require("./routes/update_user");
const statusRouter = require("./routes/status");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server);
// Serve uploaded profile images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
//mongodb://localhost:27017/
//mongodb+srv://kailash:kailash123@cluster0.832dcxs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
//process.env.PORT ||
const PORT = process.env.PORT || 3000;
const PORT1 = process.env.PORT || 5000;
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join", (data) => {
    const { senderId, receiverId } = data;
    const roomId = `${senderId}_${receiverId}`;
    socket.join(roomId);
    console.log(`User ${senderId} joined room ${roomId}`);
  });

  socket.on("message", (data) => {
    const { senderId, receiverId, message } = data;
    const roomId = `${senderId}_${receiverId}`;
    io.to(roomId).emit("message", { senderId, message });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("mongoDB connected");
  })
  .catch((err) => {
    console.log(err);
  });
app.use(express.json());
app.use(authRouter);
app.use(updateRouter);
app.use(statusRouter);
server.listen(PORT1, () => {
  console.log(`socket connect at ${PORT1}`);
});
app.listen(PORT, () => {
  console.log(` server connect at ${PORT}`);
});

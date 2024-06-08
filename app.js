require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const authRouter = require("./routes/auth");
const updateRouter = require("./routes/update_user");
const statusRouter = require("./routes/status");
const chatUser = require("./routes/chat_user");
const retriveChat = require("./routes/retrive_chat");
const saveChat = require("./routes/save_chat");
const saveFcm = require("./routes/fcm");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io"); // Change to Server from socket.io
const httpServer = http.createServer(app); // Create httpServer instance

const io = new Server(httpServer); // Pass httpServer instance to Server
// Serve uploaded profile images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//process.env.PORT ||
const PORT = 3000;

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join", (data) => {
    const { senderId, roomId } = data;

    socket.join(roomId);
    console.log(`User ${senderId} joined room ${roomId}`);
  });

  socket.on("message", (data) => {
    const { senderId, receiverId, message, roomId } = data;
    io.to(roomId).emit("message", { senderId, message });
    console.log(`reciver ${receiverId}`);
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

app.use(saveFcm);
app.use(chatUser);
app.use(retriveChat);
app.use(saveChat);
app.use(authRouter);
app.use(updateRouter);
app.use(statusRouter);

httpServer.listen(PORT, () => {
  // Listen on httpServer
  console.log(` server connect at ${PORT}`);
});

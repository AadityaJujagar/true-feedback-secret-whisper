const http = require("http");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

const dbConnect = require("./configs/db");
const authRoutes = require("./routes/authRoutes");
const commentRoutes = require("./routes/commentRoutes");
const profileRoutes = require("./routes/profileRoutes");
const { socketAuth } = require("./middlewares/socketAuth");
const socketHandler = require("./socket");

require("dotenv").config();

const PORT = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

app.use(express.json());
app.use(cookieParser());

dbConnect();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/profiles", profileRoutes);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);
io.use(socketAuth);
socketHandler(io);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running...",
    uptime: process.uptime(),
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import contactRoute from "./routes/contact.route.js";
import { initializeSocket } from "./lib/socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://nexchat-o6afjsawj-esmukingis-projects.vercel.app",
  },
});

const { getReceiverSocketId } = initializeSocket(io); // Initialize Socket.io and get function

const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: "https://nexchat-beta.vercel.app",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/contacts", contactRoute);

server.listen(PORT, () => {
  console.log("Server running on PORT:" + PORT);
  connectDB();
});

export { io, getReceiverSocketId }; // Export for controllers
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export function initializeSocket(io) {
  const userSocketMap = {};

  io.use(async (socket, next) => {
    try {
      // Get token from either cookies or handshake
      const token = socket.request.cookies?.jwt || socket.handshake.auth?.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }
  
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.user._id} connected`);
    userSocketMap[socket.user._id] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log(`User ${socket.user._id} disconnected`);
      delete userSocketMap[socket.user._id];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return {
    getReceiverSocketId: (userId) => userSocketMap[userId],
  };
}
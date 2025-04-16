import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export function initializeSocket(io) {
  const userSocketMap = {};

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.log("Socket authentication error:", error.message);
      if (error.name === 'JsonWebTokenError') {
        return next(new Error('Authentication error: Invalid token'));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new Error('Authentication error: Token expired'));
      }
      next(new Error('Authentication error'));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.user._id} connected with socket ${socket.id}`);

    // Store socket ID with user ID
    userSocketMap[socket.user._id] = socket.id;

    // Notify all clients about online users
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
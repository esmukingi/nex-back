import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export function initializeSocket(io) {
  const userSocketMap = {};

  io.use(async (socket, next) => {
    try {
      // Try both cookie and auth token
      const token = socket.request.cookies?.jwt || 
                  socket.handshake.auth?.token;
      
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
      next(new Error('Authentication error'));
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
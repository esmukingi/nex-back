import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Check both cookies and Authorization header
    const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Unauthorized - Token Expired" });
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
};  
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();




const authentication = (req, res, next) => {

  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;


    // Check if the token is provided
  if (!token) {
    return res.status(401).json({
      success: false,
      error: true,
      message: "Authentication token is missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      error: true,
      message: "Invalid or expired token",
    });
  }
}


export default authentication;
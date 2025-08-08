import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  // getting token from cookies
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.userId || decoded.id || decoded._id,
      username: decoded.username,
      email: decoded.email,
    };

    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

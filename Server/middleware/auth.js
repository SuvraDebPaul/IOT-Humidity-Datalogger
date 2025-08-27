const AUTH_TOKEN = process.env.AUTH_TOKEN || "DL_Sirc_123321";

const checkAuth = (req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }
  const token = auth.split(" ")[1];
  if (token !== AUTH_TOKEN) {
    return res.status(403).json({ error: "Invalid token" });
  }
  next();
};

module.exports = checkAuth;

const jwt = require("jsonwebtoken");

const Authenticated = (req, res, next) => {
    try {
      const authorization = req.headers["authorization"];

      if (!authorization) return res.json({err: "Authentication required"});
      
      const token = authorization.split(" ")[1];

      const {user: userId, role} = jwt.verify(token, process.env.JWT_SECRET);

      if (!userId) return res.json({err: "Authentication required"});

      req.user = {id: userId, role};

      next();

    } catch (e) {
      res.json({err: e.message});
    }
}

const NotAuthenticated = (req, res, next) => {
    try {
      const authorization = req.headers["authorization"];

      if (!authorization) return next();
      
      const token = authorization.split(" ")[1];

      jwt.verify(token, process.env.JWT_SECRET);

      return res.json({err: "You are already authenticated"});
    } catch {
      next();
    }
}

const AdminRole = (req, res, next) => {
  try {
    const user = req.user;

    if (!user) return res.status(401).json({err: "Authentication required"});

    if (user.role !== "admin") return res.json({err: "Admin authorization required"});

    next();
  } catch (e) {
    res.json({err: e.message});
  }
}

module.exports = {
  Authenticated,
  NotAuthenticated,
  AdminRole
}
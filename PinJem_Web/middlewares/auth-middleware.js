module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    res.redirect("/login");
  },
  authorizeRoles: (...allowedRoles) => {
    return (req, res, next) => {
      if (req.session.user && allowedRoles.includes(req.session.user.role)) {
        return next();
      } else {
        res.status(403).send("Forbidden: You do not have permission to access this resource.");
      }
    };
  },
};

// Middleware to filter by logged-in user
exports.setUserFilter = (req, res, next) => {
  req.filter = { user: req.user.id };
  next();
};

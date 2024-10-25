exports.filterByLoggedInUser = (req) => {
  return { user: req.user.id }; // Filter by the logged-in user's ID
};

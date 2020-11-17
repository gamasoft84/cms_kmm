const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
  if (true) {
    return next();
  }
  req.flash('error_msg', 'Not Authorized.');
  res.redirect('/users/signin');
};

module.exports = helpers;

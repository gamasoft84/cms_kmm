const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Not Authorized.');
  res.redirect('/users/signin');
};

helpers.isTokenPresent = (req, res, next) => {
  let apiKey = req.header('API-Key');
  if (apiKey === 'x5QycR82&') {
    return next();
  }
  res.json({'error_msg': 'Not Authorized.'});
};


module.exports = helpers;

var passport = require('passport');
var helpers = require('./routehelpers');

module.exports.router = function(app) {

  app.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }), function(req, res) {
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  });

  app.get('/callback', passport.authenticate('github', { failureRedirect: '/session' }), helpers.newUser, function(req, res) {
    // upon Github authentication, add the passport object to the current cookie
    // and redirect to tickets page
    req.session.cookie.passport = req.session.passport;
    res.redirect('/#/tickets');
  });

  app.get('/tickets', helpers.isLoggedIn, helpers.getTickets);

  app.post('/tickets', helpers.isLoggedIn, helpers.addToQueue);

  app.put('/claimed', helpers.isLoggedIn, helpers.tagClaimed);

  app.put('/solved', helpers.isLoggedIn, helpers.tagSolved);

  app.put('/unsolved', helpers.isLoggedIn, helpers.tagUnSolved);

  app.get('/ticketLevel', helpers.isLoggedIn, helpers.getThresholds);

  app.put('/ticketLevel', helpers.isLoggedIn, helpers.isAdmin, helpers.updateThresholds);

  app.get('/users', helpers.isLoggedIn, helpers.isAdmin, helpers.getUsers);

  app.put('/users', helpers.isLoggedIn, helpers.isAdmin, helpers.updateUser);

  app.get('/signout', helpers.isLoggedIn, helpers.terminateSession);


  app.put('/setpresolve', helpers.isLoggedIn, helpers.setPresolve)
};

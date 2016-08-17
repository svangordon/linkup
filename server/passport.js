var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    db = require('./models'),
    flash = require('connect-flash'),
    session = require('express-session');

module.exports = exports = {};

// init function to setup passport
exports.init = function init (app) {
  app.use(session({ secret: 'SuperSweetSecretSessionBrah linkup play' })); // session secret
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    db.User.findById(id, function(err, user) {
      done(err, user);
    });
  });

// ===============================
// Configure passport authentication
// ===============================
  passport.use(new LocalStrategy (
    function (username, password, done) {
      db.User.findOne({ username: username}, (err, user) => {
        console.log('user ==', user);
        if (err) {return done(err)}
        if (!user) {
          return done(null, false, {message: 'Incorrect username.'})
        }
        console.log('password ==', password)
        if (!user.validPassword(password)) {
          return done(null, false, {message: 'Incorrect password.'})
        }
        console.log('but not here')
        return done (null, user);
      });
    }
  ));

  return passport;

}

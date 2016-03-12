var db = require('../models'),
  config = require('../config'),
  request = require('request'),
  jwt = require('jsonwebtoken');

module.exports = {
  authenticate: function (req, res) {
    // find user
      db.User.findOne({
        username: req.body.username
      }).select('name username password settings')
      .exec(function(err, user) {
        if (err) throw err;
        // no user found
        if (!user) {
          res.json({success: false, message: 'Authentication failed. User not found.'})
        } else if (user) {
        // check password
          var validPassword = user.comparePassword(req.body.password);
          if (!validPassword) {
            res.json({success: false, message: 'Authentication failed. Invalid password'})
          } else {
            // create token
            console.log('pword match');
            var token = jwt.sign({
              name: user.name,
              username: user.username
            }, config.JWT_SECRET, {
              expiresIn: 86400
            })

            // return info / token
            res.json({
              success: true,
              message: 'Now you have a token',
              token: token
            })
          }
        }
      })
  }
  , middleware: function (req, res, next) {
      console.log('middleware fired');
      console.log(req.body)
      // check for token
      var token = req.body.token || req.params.token || req.headers['x-access-token'];
      // decode token
      if (token) {
        // verify secret, check exp
        jwt.verify(token, config.JWT_SECRET, function (err, decoded) {
          if (err) {
            return res.status(403).send({success: false, message: 'Failed to authenticate tokane'})
          } else {
            // save req for other routes
            req.decoded = decoded
            next()
          }
        })
      } else {
        // no token; send 403
        return res.status(403).send({success: false, message: 'No token provided.'})
      }
  }
}

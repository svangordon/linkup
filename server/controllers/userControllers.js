var db = require('../models.js'),
  config = require('../config'),
  request = require('request'),
  jwt = require('jsonwebtoken');

  module.exports = {
    create: function(req, res) {
      // new user instance
      var user = new db.User();
      // programmatically set user info
      // console.log('creating new user', req.body);
      for (i in req.body) {
        user[i] = req.body[i];
      }

      // new users are always created w/ the role user
      user.role = 'user'

      // save, err check
      user.save(function(err) {
        if (err) {
          if (err.code == 1100){
            return res.json({success: false, message: 'A user with that username already exists'})
          } else {
            return res.send(err)
          }
        }
        res.json(user)
      })
    }
    , all: function (req, res) {
        db.User.find({},function(err, users) {
          if (err) res.send(err)
          res.json(users)
        })
    }
    , get: function (req, res, next) {
        db.User.findById(req.params.userId, function(err, user) {
          if (err) res.send(err);
          res.json(user)
        })
    }
    , update: function (req, res) {
        db.User.findById(req.params.userId, function(err, user) {
          if (err) res.send(err);
          // update all fields
          for (i in req.body) {
            if (req.body[i]) user[i] = req.body[i]
          }
          // save
          user.save(function(err) {
            if (err) res.send(err)
            res.json({message: 'user updated'})
          })
        })
    }
    , delete: function (req, res) {
        db.User.remove({
          _id: req.params.userId
        }, function(err, user) {
          if (err) res.send(err)
          res.json({message: 'Successfully deleted'})
        })
    }
    , /*authenticate: function (req, res) {
      // find user
        db.User.findOne({
          username: req.body.username
        }).select('name username password')
        .exec(function(err, user) {
          if (err) throw err;
          // no user found
          if (!user) {
            res.json({success: false, message: 'Authentication failed. User not found.'})
          } else if (user) {
          // check password
            var validPassword = user.validPassword(req.body.password);
            if (!validPassword) {
              res.json({success: false, message: 'Authentication failed. Invalid password'})
            } else {
              // create token
              var token = jwt.sign({
                name: user.name,
                username: user.username
              }, config.JWT_SECRET, {
                expiresInMinutes: 1440
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
    }*/
  }

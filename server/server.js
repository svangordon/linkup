// Requires
var express = require('express'),
  app = express(),
  path = require('path'),
  logger = require('morgan'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  // apiRoutes = require('./api_routes.js'),
  cors = require('cors'),
  config = require('./config'),
  mongodb_url = 'mongodb://159.203.224.140:27017/gaffer',
  jwt = require('jsonwebtoken')


// ==============================
// | Routers Requires
// ==============================
  var fdRoutes = require('./routes/fdRoutes.js')
  , twRoutes = require('./routes/twRoutes.js')
  , userRoutes = require('./routes/userRoutes.js')
  , authRoutes = require('./routes/authRoutes.js')
  , authCtrls = require('./controllers/authControllers.js')
  , meRoutes = require('./routes/meRoutes.js')
  , rssRoutes = require('./routes/rssRoutes.js')

// ===============================
// Connect to DB on Digital Ocean
// ===============================
mongoose.connect(mongodb_url, function (err) {
  if (err) console.log(err)
  console.log('Connected to MongoDB');
})

// Setup Middleware

app.set('port', config.PORT || 3000) // I could just hardcode this to 3k, but...
app.use(logger('dev'))
app.use(bodyParser.urlencoded({
  extended : true
}))
// Why is this here?i
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization')
  next()
})
app.use(bodyParser.json())
app.use(cors())

// Initialize routes to use
// =============================
// Static content
app.use(express.static(__dirname + '/../client'))

// Homepage
app.get('/', function (req, res) {
  res.sendFile('index.html', {root: './client/angular/views'})
})

// Authentication
app.use('/api/authenticate', authRoutes)
// TODO: I moved the middleware below all the routes because it was authenticating the create users routes, should fix that and move back
// endpoints
app.use('/api/fd', fdRoutes)
app.use('/api/tw', twRoutes)
app.use('/api/users', userRoutes)
app.use(authCtrls.middleware)
app.use('/api/me', meRoutes)
app.use('/api/rss', rssRoutes)

// Set the port to run
app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})

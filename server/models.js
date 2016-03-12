var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt-nodejs'),

  // News Model
  // Schema for the news items that will be displayed on cards
  newsSchema = new Schema({
    type : {type: String, required: true} // eg social, article, video, podcast
    , source : {type: Schema.Types.ObjectId, ref: 'Source'} // eg insta, fb, the guardian
    , creator : {type: String} // Who or what created the news item -- eg newspaper, player (for social), team, fansite
    , timestamp : {type: Number}
    , href : {type: String} // link to article
    , icon : {type: String} // this should probably have a way to default to something
    , author : {type: String} // eg Alexis Sanchez(or @alexissanchez?) or 'Barry Glenndening'
  }),

  // Source Schema
  // Schema for the sources of news items
  sourceSchema = new Schema({ //
    displayName : {type: String} // what we show to users
    , name : {type: String} // what we pass around between processes
    , link : {type: String}
    , defaultIcon : {type: String} // href to a default icon
  })

  // User Schema
  // For users, obv
  userSchema = new Schema({
    username: {type: String, required: true, unique: true}
    , name: {type: String}
    , password: {type: String, required: true, select: false}
    , email: {type: String}
    , teamPref : {type: String}
    , role: {type: String}
    , options: {type: Schema.Types.ObjectId, ref: 'Options'}
  })
  userSchema.pre('save', function(next) {
    var user = this;

    // normalize teamPref input
    console.log('user pre save', user)
    if (user) user.teamPref = user.teamPref.toLowerCase()

    // Hash password if the pword has been changed or is new
    if (!user.isModified('password')) return next();

    // generate salt
    bcrypt.hash(user.password, null, null, function(err, hash) {
      if (err) return next(err);
      // change pword to hash
      user.password = hash;
      next()
    })
  })
  userSchema.methods.comparePassword = function (password) {
    var user = this;
    return bcrypt.compareSync(password, user.password)
  }

  // Options Schema
  // I haven't figured out what the opts are yet, so...
  optionsSchema = new Schema({
    team : {type: String}
  })

module.exports = {
  News: mongoose.model('News', newsSchema)
  , Source : mongoose.model('Source', sourceSchema)
  , User: mongoose.model('User', userSchema)
  , Options: mongoose.model('Options', optionsSchema)
}

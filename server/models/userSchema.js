var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt-nodejs'),

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
  // console.log('models.js user compare password', password, user.password);
  return bcrypt.compareSync(password, user.password)
}

module.exports = {
  userSchema : userSchema
}

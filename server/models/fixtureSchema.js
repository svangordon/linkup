var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// The fd API has head to head data, but I'm not going to include it b/c
//  1) It's not complete (doesn't include all competitions)
//  2) I can't think of a possible use for it, beyond uh, commentating or something?

var fixtureSchema = new Schema({
  'kickoff' : {type: String}
  , 'status' : {type: String}
  , 'homeTeam' : {type: Schema.Types.ObjectId, ref: 'Team'}
  , 'awayTeam' : {type: Schema.Types.ObjectId, ref: 'Team'}
  // These are included to reduce the number of DB calls, but maybe that doesn't make any sense
  , 'homeTeamName' : {type: String}
  , 'awayTeamName' : {type: String}
  // =================================
  , 'venue' : {type: String}
  , 'attendance' : {type: Number}
})

module.exports = fixtureSchema

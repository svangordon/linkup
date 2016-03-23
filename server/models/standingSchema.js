var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var standingSchema = new Schema({
  'team' : {type: Schema.Types.ObjectId, ref: 'Team'}
  , 'matchday' : {type: Number}
  , 'playedGames' : {type: Number}
  , 'points' : {type: Number}
  , 'goals' : {type: Number}
  , 'goalsAgainst' : {type: Number}
  , 'goalsDifference' : {type: Number}
  , 'wins' : {type: Number}
  , 'draws' : {type: Number}
  , 'losses' : {type: Number}
})

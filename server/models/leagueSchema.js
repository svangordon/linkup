var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var leagueSchema = new Schema({
  'fdId' : {type: Number}
  , 'caption' : {type: String}
  , 'league'  : {type: String}
  , 'year'    : {type: Number} // Start Year
  , 'currentMatchday' : {type: Number}
  , 'numberOfMatchdays' : {type: Number}
  , 'numberOfTeams' : {type: Number}
  , 'numberOfGames' : {type: Number}
  , 'lastUpdated' : {type: String}
  , 'fixtures' : [{type: Schema.Types.ObjectId, ref: 'Fixture'}]
  , 'teams' : [{type: Schema.Types.ObjectId, ref: 'Team'}]
  , 'winterBreak' : {
      start : {type : String}
      , end : {type : String}
  }
  , 'clSpots' : {type: Number}
  , 'elSpots' : {type: Number}
  , 'regulationPlayoffSpots' : {type: Number}
  , 'regulationSpots' : {type: Number}
  , 'table' : {type: Schema.Types.ObjectId, ref: 'Table'}
})

module.exports = leagueSchema

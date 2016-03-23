var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var teamSchema = new Schema({
  'fdId' : {type: Number}
  , 'code' : {type: String}
  , 'fullName' : {type: String}
  , 'shortName' : {type: String}
  , 'nickName' : {type: String}
  , 'squadMarketValue' : {type: String}
  , 'crestUrl' : {type: String}
  , 'league' : {type: Schema.Types.ObjectId, ref: 'League'}
  , 'homeStadium' : {type: String} // Later, make this reference a venue model, which will have info about the stadium (location, capacity, etc)
  , 'homeCity' : {type: String} // This is probably never going to be used -- home stadium makes more sense
  , 'rivals' : [{type: Schema.Types.ObjectId, ref: 'Team'}]
  // , 'derbies' : [{type: Schema.Types.ObjectId, ref: 'Derby'}] // Does it make any sense to track this? it'd make it possible to say "North London Derby" which'd be nice
  , 'fixtures' : [{type: Schema.Types.ObjectId, ref: 'Fixture'}]
  , 'players' : [{type: Schema.Types.ObjectId, ref: 'Player'}]
  , 'standing' : {type: Schema.Types.ObjectId, ref: 'Standing'}
})

module.exports = teamSchema

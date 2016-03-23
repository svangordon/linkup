var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var tableSchema = new Schema ({
  'leagueCaption' : {type: String}
  , 'matchday' : {type: Number}
  , 'league' : {type: Schema.Types.ObjectId, ref: 'League'}
  , 'standings' : [{type: Schema.Types.ObjectId, ref: 'Standing'}]
})

module.exports = tableSchema

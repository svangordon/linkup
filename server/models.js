var mongoose = require('mongoose'),
  Schema = mongoose.Schema,

  // News Model
  // Schema for the news items that will be displayed on cards
  newsSchema = new Schema({
    type : {type: String, required: true} // eg social, article, video, podcast
    // , source : {type: Schema.Types.ObjectID, ref: 'Source'} // eg insta, fb, the guardian
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

  //

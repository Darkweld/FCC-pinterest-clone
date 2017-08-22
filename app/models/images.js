'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Images = new Schema({
    imageTitle: String,
    localImagePath: String,
    shares: Number,
    original: {type: Schema.Types.ObjectId, ref: 'Images'},
    likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
    creator : {type: Schema.Types.ObjectId, ref: 'User'}
});


module.exports = mongoose.model('Images', Images);
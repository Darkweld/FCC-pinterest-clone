'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Books = new Schema({
    imageTitle: String,
    imageUrl: String,
    convertedImageUrl: String,
    likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
    user : {type: Schema.Types.ObjectId, ref: 'User'}
});


module.exports = mongoose.model('Books', Books);
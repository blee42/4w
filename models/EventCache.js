var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var eventCacheSchema = new mongoose.Schema({
	timeOfDay: { type: String, default: ''}, //morning, afternoon, evening
	for21: { type: String, default: 'no'}, //yes or no
	foodVenue: {
		name: { type: String, default: ''},
		location: {type:String, default: ''},
		rating: {type:String, default:''},
		link: {type:String, default: ''},
		wildcatDiscount: {type:String, default:''},
		price: {type:String, default:''},
		hours: {type: String, default: ''},
	},
	eventVenue: {
		name: {type:String, default:''}
		location: {type:String, default:''}
		rating: {type:String, default:''}
		link: {type:String, default:''}
		wildcatDiscount: {type:String, default:''}
		price: {type:String, default:''}
	},
});


module.exports = mongoose.model('EventCache', eventCacheSchema);

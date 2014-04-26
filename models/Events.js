var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var eventSchema = new mongoose.Schema({
	userID: { type: String },
	saved: { type: String, default:'no'}, //yes or no
	timeOfDay: { type: String, default: ''}, //morning, afternoon, evening
	for21: { type: String, default: 'no'}, //yes or no
	foodVenue: {
		name: { type: String, default: ''},
		id: {type: String},
		location: {
			lat: {type: String},
			lng: {type: String},
			address: {type: String},
		},
		rating: {type:String, default:''},
		url: {type:String, default: ''},
		hasWildcatDiscount: {type:String, default:''},
		price: {type:String, default:''},
		hours: {type: String, default: ''},
	},
	eventVenue: {
		name: { type: String, default: ''},
		id: {type:String},
		location: {
			lat: {type: String},
			lng: {type: String},
			address: {type: String},
		},
		rating: {type:String, default:''},
		url: {type:String, default: ''},
		hasWildcatDiscount: {type:String, default:''},
		price: {type:String, default:''},
		hours: {type: String, default: ''},
	},
});


module.exports = mongoose.model('Events', eventSchema);

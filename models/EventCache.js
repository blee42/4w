var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var eventCacheSchema = new mongoose.Schema({
	lastUpdate: { type: Number, default: 0},
	eventCache: { type: Array, default: []},
	foodCache: {type: Array, default: []}
});


module.exports = mongoose.model('EventCache', eventCacheSchema);

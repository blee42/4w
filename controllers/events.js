/**
 * GET /
 * Events page.
 */

// useful info:
//  - categories: https://developer.foursquare.com/categorytree
//  - venue returns: https://developer.foursquare.com/docs/responses/venue

var secrets = require("../config/secrets");
var async = require("async");
var foursquare = require('node-foursquare-venues')(secrets.foursquare.clientId, secrets.foursquare.clientSecret);

// Hardcoded Constants: may or may not be temporary
var location = "The Loop, Chicago IL"

function getFoodVenues(req, callback) {
	var food = "4d4b7105d754a06374d81259"; // general food
	if (req.user) { // check that preferences have bene filled
		food = getFoodPreference(req.user);
	} 

	foursquare.venues.search({near: location, limit: "50", categoryId: food}, function(err, foodVenues) {
		var venues = [];

		for(var i=0; i < foodVenues.response.venues.length; i++) {
			venues.push(getVenueData(foodVenues.response.venues[i]));
		}

		callback(null, sortVenues(venues));
	});
};

function getEventVenues(req, callback) {
	var events = "4d4b7104d754a06370d81259"; // arts & entertainment
	if (req.user) { // check that preferences have bene filled
		events = getEventPreference(req.user);
	} 
	foursquare.venues.search({near: location, limit: "50", categoryId: events}, function(err, eventVenues) {
		var venues = [];

		for(var i=0; i < eventVenues.response.venues.length; i++) {
			venues.push(getVenueData(eventVenues.response.venues[i]));
		}

		callback(null, sortVenues(venues));
	});
};

function getVenueData(venue) {
	var info = {};
	info.id = venue.id;
	info.name = venue.name;
	info.location = venue.location; // attrib: address, crossStreet, lat, long, postal, city, state, country, cc
	info.url = venue.canonicalUrl;
	info.price = venue.price; // tier (1,2,3,4), message (cheap, moderate, etc.), currency ($, $$, etc.)
	info.rating = venue.rating;

	// status (closed until x), isOpen, timeframes
	// timeframes: days (Mon-Fri):, open (array of renderedTimes's), includesToday (boolean, today or not)
	info.hours = venue.hours;
	info.popular_hours = venue.popular;

	// deals, count should return the #
	info.deals = venue.specials;

	// count for #, groups.items -> array of dictionaries of photos
	// https://developer.foursquare.com/docs/responses/photo.html
	info.photos = venue.photos;

	// menu.url, menu.mobileURL
	info.menu = venue.menu;

	info.tags = venue.tags;

	return info;
};

function sortVenues(venueList) {
	return venueList;

};

function getFoodPreference(user) {

};

function getEventPreference(user) {

};

exports.getEvents = function(req, res) {

	async.parallel([
		function(callback) {
			getFoodVenues(req, callback);
		},
		function(callback) {
			getEventVenues(req, callback);
		}
	],
	function(err, results) {
		// res.render('INSERT_PAGE_HERE', {
		// 	title: 'Events',
		// 	food: results[0],
		// 	events: results[1],
		// });
		console.log(results[0][0]);
		console.log(results[1][0]);
		console.log(results[0].length);
		console.log(results[1].length);
	});
}

// exports.getEvents = function(req, res) {
//   res.render("events/events", {
//     title: 'Events'
//   });
// };


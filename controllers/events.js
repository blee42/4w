/**
 * GET /
 * Itinerary Pages
 */

// useful info:
//  - categories: https://developer.foursquare.com/categorytree
//  - venue returns: https://developer.foursquare.com/docs/responses/venue

var secrets = require("../config/secrets");
var async = require("async");
var foursquare = require('node-foursquare-venues')(secrets.foursquare.clientId, secrets.foursquare.clientSecret);

// Hardcoded Constants: may or may not be temporary
var location = "The Loop, Chicago IL"
var food = "4d4b7105d754a06374d81259"; // general food

function getFoodVenues() {

}

function getEventVenues() {

}

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

	info.tags = venue.tags;

	return info;
}

function sortVenues(venueList) {

}

exports.getEvents = function(req, res) {

	foursquare.venues.search({near: "Chicago IL", query: "Girl & the Goat", limit: "50"}, function(err, returnData) {
		console.log(returnData);
		var id = returnData.response.venues[0].id;
		foursquare.venues.venue(id, function(err, returnData2) {
			console.log(returnData2);
			console.log(returnData2.price);
		});
	});
	
}
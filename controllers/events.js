/**
 * GET /
 * Events page.
 */

// useful info:
//  - categories: https://developer.foursquare.com/categorytree
//  - venue returns: https://developer.foursquare.com/docs/responses/venue

var secrets = require("../config/secrets");
var Cache = require("../models/EventCache");
var async = require("async");
var _ = require("underscore");
var foursquare = require('node-foursquare-venues')(secrets.foursquare.clientId, secrets.foursquare.clientSecret);
var wildcardDiscounts = require("../wildcardChicagoList.js");

// Hardcoded Constants: may or may not be temporary
var location = "The Loop, Chicago IL"

function getVenues(req, callback) {

	async.parallel([
		function(cback) {
			getFoodVenues(req, cback);
		},
		function(cback) {
			getEventVenues(req, cback);
		}
	],
	function(err, results) {
		var foodVenues = filterVenues(results[0], req.user); // nothing is taken out yet
		var eventVenues = filterVenues(results[1], req.user);

		Cache.findOne({}, function(err, theCache) {
			var foodToCache = foodVenues.slice();
			var eventsToCache = eventVenues.slice();

			if (theCache) {
				console.log("NO NEW CACHE WAS CREATED")
			}
			else {
				theCache = new Cache();
				console.log("NEW CACH MADE")
			}

			for(var i=0; i < theCache.foodCache.length; i++) {
				var index = foodToCache.indexOf(theCache.foodCache[i].id);
				if (index > -1) {
					foodToCache.splice(index, 1);
				}
			}

			for(var i=0; i < theCache.eventCache.length; i++) {
				var index = eventsToCache.indexOf(theCache.eventCache[i].id);
				if (index > -1) {
					eventsToCache.splice(index, 1);
				}
			}

			console.log("Checking food to add...");
			console.log(foodToCache.length);
			console.log("Checking events to add...");
			console.log(eventsToCache.length);

			cacheItems(foodToCache, theCache, "foodCache");
			cacheItems(eventsToCache, theCache, "eventCache");

			callback(null, [theCache, foodVenues, eventVenues]);
		})
	});
}

function cacheItems(items, cache, space) {
	for(var i = 0; i < items.length; i++) {
		foursquare.venues.venue(items[i], {}, function(err, venueInfo) {
			cache[space].push(getVenueData(venueInfo.response.venue));
			cache.save(); // ??
		});
	}
}

function getFoodVenues(req, callback) {
	var food = ["4d4b7105d754a06374d81259", ""]; // general food
	if (req.user) { // check that preferences have bene filled
		food = req.user.foodPreference.query;
	} 
	foursquare.venues.search({near: location, limit: "5", categoryId: food[0], query: food[1]}, function(err, foodVenues) {
		var venues = [];

		for(var i=0; i < foodVenues.response.venues.length; i++) {
			venues.push(foodVenues.response.venues[i].id);
		}

		callback(null, venues);
	});
};

function getEventVenues(req, callback) {
	// arts & entertainment, events, shopping
	var events = ["4d4b7104d754a06370d81259", "4d4b7105d754a06373d81259", "4bf58dd8d48988d1fd941735"] ; 
	if (req.user) { 
		events = req.user.eventPreference.query;
	}

	var venues1 = [], venues2 = [], venues3 = [];

	async.parallel([
		function(cback) {
			foursquare.venues.search({near: location, limit: "5", categoryId: events[0]}, function(err, eventVenues) {
				for(var i=0; i < eventVenues.response.venues.length; i++) {
					venues1.push(eventVenues.response.venues[i].id);
				}

				cback(null, 1);
			});
		},
		function(cback) {
			foursquare.venues.search({near: location, limit: "5", categoryId: events[1]}, function(err, eventVenues) {
				for(var i=0; i < eventVenues.response.venues.length; i++) {
					venues2.push(eventVenues.response.venues[i].id);
				}

				cback(null, 2);
			});
		},
		function(cback) {
			foursquare.venues.search({near: location, limit: "5", categoryId: events[2]}, function(err, eventVenues) {
				for(var i=0; i < eventVenues.response.venues.length; i++) {
					venues3.push(eventVenues.response.venues[i].id);
				}

				cback(null, 3);
			});
		}
	],
	function(err, results) {
		callback(null, venues1.concat(venues2).concat(venues3));
	});

};

function getVenueData(venue) {
	var info = {};
	info.id = venue.id;
	info.name = venue.name;
	info.location = venue.location; // attrib: address, crossStreet, lat, long, postal, city, state, country, cc
	info.url = venue.canonicalUrl;
	info.price = venue.price; // tier (1,2,3,4), message (cheap, moderate, etc.), currency ($, $$, etc.)

	if (venue.rating) {
		info.rating = Number(venue.rating) / 2;	
	}
	else {
		info.rating = 0;
	}

	// status (closed until x), isOpen, timeframes
	// timeframes: days (Mon-Fri):, open (array of renderedTimes's), includesToday (boolean, today or not)
	info.hours = venue.hours;
	info.popular_hours = venue.popular;

	// deals, count should return the #
	info.deals = venue.specials;

	// count for #, groups.items -> array of dictionaries of photos
	// https://developer.foursquare.com/docs/responses/photo.html
	info.photos = venue.photos;
	info.hasWildcardDiscount = false;
	// menu.url, menu.mobileURL
	info.menu = venue.menu;

	info.tags = venue.tags;

	info.hasWildcardDiscount = (wildcardDiscounts.wildcardDiscountList.indexOf(venue.name) != -1);

	return info;
};

function sortVenues(cache, idList) {
	// var venueList = filterVenues(venueList, user);

	var venueList = [];
	for(var i=0; i < cache.length; i++) {
		var index = idList.indexOf(cache[i].id);
		if (index > -1) {
			venueList.push(cache[i]);
		}
	}

	venueList.sort(function(x, y) {
		return scoreVenue(y) - scoreVenue(x);
	});

	return venueList;
};

// add additional filters if necessary
	// mall filter (!!!)
// visitedVenues should be an array of IDs
function filterVenues(idList, user) {
	var visitedVenues = [];
	if (user) {
		visitedVenues = user.visitedVenues;
	}

	return _.filter(idList, function(venue) {
		return visitedVenues.indexOf(venue.id) == -1;
	});
};

// we can update this scoring algorithm as needed!
function scoreVenue(venue) {
	var wildcardFactor = venue.hasWildcardDiscount * 3;
	return venue.rating + wildcardFactor;
};

function getSortedEventVenues(eventCache, eventList) {
	return;

};

exports.getEvents = function(req, res) {
	computeQueries(req);
	async.parallel([
		function(callback) {
			getVenues(req, callback);
		}
	],
	function(err, results) {
		var cache = results[0][0];
		var foodIDs = results[0][1];
		var eventIDs = results[0][2];

		var foodList = sortVenues(cache.foodCache, foodIDs);
		console.log(foodList[0]);
		var eventList = sortVenues(cache.eventCache, eventIDs);

		res.render('events/events', {
			title: 'Events',
			foodLocation: foodList, // this should be the first food in cache
			eventLocation: eventList // this should be the first event in cache
		});
	});
};

function computeQueries(req) {
	if (req.user) {
		User.findById(req.user.id, function(err, user) {
			switch (req.body.timeOfDay) {
				case "morning":
					break;
				case "afternoon":
					break;
				default: // night
					if (user.preferences.is21 == "true") {
						user.eventPreference.query[2] = "4d4b7105d754a06376d81259";
					}
					break;
			}
			user.save();
		});
	}

};

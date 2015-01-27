'use strict'

var http     			= require("http"),
async 						= require('async'),
search 			    	= require("./foursquare_search"),
getFoodPics				= require("./foursquare_foodpics");

/** Main Search **/


function parseResults (req, parsedData) {
	
  //items is an array of venues
  var items = parsedData.response.groups[0].items;
  var result = [];
	var venueIds = [];
	
  for (i = 0; i < items.length; i++) {
    var venue = items[i].venue
    var id = venue.id;
    var name = venue.name;
		
    // Foursquare already provides a formatted address and phone number for us
    var location = venue.location;
		var address = venue.location && venue.location.formattedAddress;
    var contact = venue.contact && venue.contact.formattedPhone;
    var stats = venue.stats;
    var checkins = venue.hereNow;
    // This will return null if venue.price is undefined
    var price = venue.price && venue.price.tier; 
    var rating = venue.rating;
    // Foursquare also gives us it's best guess if a venue is open
    var hours = venue.hours && venue.hours.isOpen; 
    var url = venue.url;

    result.push({
      id: id,
      name: name,
      location: location,
			address: address,
      contact: contact,
      stats: stats,
      checkins: checkins,
      price: price,
      rating: rating,
      open: hours,
      url: url
    });
		
		venueIds.push(id);
  }
  return [result, venueIds];
};


exports.searchFood = function(req, res) {
	var searchQuery = {
    query: req.query.query,
    lat: req.query.lat,
    lng: req.query.lng
  };
		
	search(searchQuery, function(err, parsedData){
		if (err) {
      return console.error('There was an error: ' + err.message);
    }
		var results = parseResults(req, parsedData);
		var result_list = results[0];
		var venueIds = results[1];
		
		// makes call to getAllFood
		getFoodPics(venueIds, function(err, photoData){
			console.log("getFoodPics called with photoData\n", photoData);	
			
			var allVenues = {
				result_list: result_list,
				photoObjs: photoData
			}
			
			res.json(allVenues);
		}); 
		
	});
	
};

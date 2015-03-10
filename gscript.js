"use strict"

// Global variables
var gsearch = {
  map: new google.maps.Map(
    document.getElementById('map-canvas'),
    {
      zoom: 10
    }
  ),
  clientPos: null,
  locMarkers: []
}

// Initialization
function initialize() {
  // Get client's position
  gsearch.clientPos = getCurrentLocation();
  // Bind autocomplete feature to search textbox
  var autoComplete = new google.maps.places.Autocomplete(
    document.getElementById('txtSearch'),
    {
      types: ['establishment']
    }
  );
  google.maps.event.addListener(autoComplete, 'place_changed', function() {
    // Clear previous search results from map
    gsearch.locMarkers[0].setMap(null);
    // Show new place on map with opening timings
    var place = autoComplete.getPlace();
    updateMap(place.geometry.location);
    showOpeningHours(place.opening_hours);
  });
}

function getCurrentLocation() {
  // Get location using HTML5
  if (navigator.geolocation) {
    // Get client location coordinates
    navigator.geolocation.getCurrentPosition(
      function(posCoords) {
        var clientPos = new google.maps.LatLng(posCoords.coords.latitude, posCoords.coords.longitude);
        updateMap(clientPos);
        return clientPos;
      },
      function() {
        return 1101;  // Error: Finding current location couldn't succeed
      }
    );
  } else {
    return 1100;  // Error: Finding location using HTML5 not possible
  }
}

function updateMap(locLatLng) {
  // Add marker at current position
  addMarker(locLatLng);
  // Reposition map to given location
  gsearch.map.setCenter(locLatLng);
}

function addMarker(locLatLng) {
  var geocoder = new google.maps.Geocoder();
  var gcReqParams = {
    location: locLatLng
  };
  // Retrieve place name from position coordinates and add marker there
  var gcRequest = geocoder.geocode(gcReqParams, function(gcResults, gcStatus) {
    var marker = new google.maps.Marker({
      map: gsearch.map,
      position: locLatLng,
      title: gcResults[0].formatted_address
    });
    gsearch.locMarkers[0] = marker;
  });
}

function showOpeningHours(hourDetails) {
  var openHoursDivID = 'openhours';
  
  if (hourDetails === undefined) {
    document.getElementById(openHoursDivID).innerHTML = 'No timings available';
    return false;
  }
  
  var openHoursHTML = '';
  var hourPeriods = hourDetails.periods;
  var openDaysCount = hourPeriods.length;
  var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  for (var i=0; i<openDaysCount; i++) {
    if (openHoursHTML === '') {
      openHoursHTML += '<ul>';
    }
    openHoursHTML += '<li><b>' + weekdays[hourPeriods[i].open.day] + '</b>: ';
    openHoursHTML += hourPeriods[i].open.time + ' - ' + hourPeriods[i].close.time;
    openHoursHTML += '</li>';
  }
  if (openDaysCount > 0) {
    openHoursHTML += '</ul>';
  }
  document.getElementById(openHoursDivID).innerHTML = openHoursHTML;
}

google.maps.event.addDomListener(window, 'load', initialize);

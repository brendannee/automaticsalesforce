var $ = require('jquery'),
    _ = require('underscore'),
    polyline = require('polyline'),
    map;

require('mapbox.js');

// Setup mapbox
L.mapbox.accessToken = mapboxAccessToken;

exports.drawMap = function(trip) {
  map = L.mapbox.map('map' + trip.id, 'automatic.idonii25', {zoomControl: false});

  var start = [trip.start_location.lat, trip.start_location.lon],
      end = [trip.end_location.lat, trip.end_location.lon],
      lineStyle = {
        color: '#5dbef5',
        opacity: 1,
        weight: 3
      },
      iconStyle = {
        iconSize: [30, 43],
        iconAnchor: [15, 43],
        popupAnchor: [0,-43]
      },
      aIcon = L.icon(_.extend(iconStyle, {
        iconUrl: '/images/tripview_map_a.png',
        iconRetinaUrl: '/images/tripview_map_a@2x.png'
      })),
      bIcon = L.icon(_.extend(iconStyle, {
        iconUrl: '/images/tripview_map_b.png',
        iconRetinaUrl: '/images/tripview_map_b@2x.png'
      })),
      startPopupContent = trip.start_address.multiline + '<br>' + trip.started_at_date + '<br>' + trip.started_at_time,
      endPopupContent = trip.end_address.multiline + '<br>' + trip.ended_at_date + '<br>' + trip.ended_at_time,
      line;

  if(trip.path) {
    line = L.polyline(polyline.decode(trip.path), lineStyle);
  } else {
    line = L.polyline([start, end], lineStyle);
  }

  line.addTo(map);

  map.fitBounds(line.getBounds(), {padding: [10, 10]});

  L.marker(start, {title: 'Start Location', icon: aIcon})
    .bindPopup(startPopupContent)
    .addTo(map);

  L.marker(end, {title: 'End Location', icon: bIcon})
    .bindPopup(endPopupContent)
    .addTo(map);

  //Zoom event handlers
  $('.zoom-in').click(function() {
    map.zoomIn();
  });

  $('.zoom-out').click(function() {
    map.zoomOut();
  });
};


exports.destroyMap = function() {
  if(map) {
    map.remove();
    map = undefined;
  }
};

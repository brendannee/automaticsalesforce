var _ = require('underscore'),
    moment = require('moment-timezone');


exports.getTripName = function(trip, rate) {
  var endAddress = (trip.end_address && trip.end_address.cityState) ? 'to ' + trip.end_address.cityState : '';
  return trip.started_at_time + ' trip ' + endAddress + ', ' + trip.distance + ' mi @ $' + rate + '/mi - via Automatic';
};


exports.roundDistance = function(distance) {
  var miles = Math.round(distance);
  if(miles === 0) {
    return 1;
  } else {
    return miles;
  }
};


exports.formatTrip = function(trip) {
  trip.start_address = cleanAddress(trip.start_address);
  trip.end_address = cleanAddress(trip.end_address);

  return _.extend(trip, {
    title: 'Drive to ' + trip.end_address.cleaned + ' on ' + formatDate(trip.started_at, trip.start_timezone),
    dayOfWeek: formatDayOfWeek(trip.started_at, trip.start_timezone),
    started_at_time: formatTime(trip.started_at, trip.start_timezone),
    started_at_date: formatDate(trip.started_at, trip.start_timezone),
    ended_at_time: formatTime(trip.ended_at, trip.end_timezone),
    ended_at_date: formatDate(trip.ended_at, trip.end_timezone),
    distance: formatDistance(exports.m_to_mi(trip.distance_m)),
    average_mpg: formatMPG(trip.average_kmpl),
    hard_brakes_class: (trip.hard_brakes > 0 ? 'some-hard-brakes' : 'no-hard-brakes'),
    hard_brakes: trip.hard_brakes || '<i class="glyphicon glyphicon-ok"></i>',
    hard_accels_class: (trip.hard_accels > 0 ? 'some-hard-accels' : 'no-hard-accels'),
    hard_accels: trip.hard_accels || '<i class="glyphicon glyphicon-ok"></i>',
    speeding_class: (formatSpeeding(trip.duration_over_70_s) > 0 ? 'some-speeding' : 'no-speeding'),
    speeding: Math.ceil(trip.duration_over_70_s/60) || '<i class="glyphicon glyphicon-ok"></i>',
    fuel_volume_usgal: l_to_usgal(trip.fuel_volume_l)
  }, formatDuration(trip.duration_s));
};


exports.m_to_mi = function(distance_m) {
  return distance_m / 1609.34;
};


function formatDuration(s) {
  var result = {
    duration: formatDurationMinutes(s),
    duration_type: 'min'
  };

  if(result.duration >= 60) {
    result.duration = formatDurationHoursMinutes(s);
    result.duration_type = 'hrs';
  }

  return result;
}


function formatDurationHoursMinutes(s) {
  var duration = moment.duration(s, 'seconds');
  return Math.floor(duration.asHours()) + ':' + moment(duration.minutes(), 'm').format('mm');
}


function formatDurationMinutes(s) {
  var duration = moment.duration(s, 'seconds'),
      minutes = duration.asMinutes();
  return minutes ? minutes.toFixed(0) : '';
}





function l_to_usgal(volume_l) {
  return volume_l * 0.264172;
}


function kmpl_to_mpg(kmpl) {
  return kmpl * 2.35214583;
}


function formatDistance(distance) {
  if(Math.round(distance) >= 100) {
    return distance.toFixed(0);
  } else {
    return (distance || 0).toFixed(1);
  }
}


function formatMPG(kmpl) {
  var mpg = kmpl_to_mpg(kmpl);
  return (mpg) ? mpg.toFixed(1) : '';
}


function cleanAddress(address) {
  if(!address) {
    address = {};
  }

  address.cleaned = (address && address.name) ? address.name.replace(/\d+, USA/gi, '') : '';
  address.multiline = formatAddressMultiline(address.cleaned);
  address.cityState = formatCityState(address);
  address.subdivision = formatSubdivision(address);
  address.street = address.street_number ? address.street_number + ' ' + address.street_name : '';
  address.streetCity = address.street_name ? address.street_name + ', ' + address.city : '';

  return address;
}


function formatAddressMultiline(cleaned) {
  var lines = cleaned.split(', ');

  if(lines.length > 2) {
    var first = lines.shift();
    cleaned = first + '<br>' + lines.join(', ');
  }
  return cleaned;
}


function formatCityState(address) {
  var cityState = '';
  if(address.city) {
    cityState += address.city;
  }
  if(address.state) {
    cityState += ', ' + address.state;
  }
  return cityState;
}


function formatSubdivision(address) {
  if(address && address.state) {
    return address.country + '-' + address.state;
  } else {
    return;
  }
}


function formatSpeeding(sec) {
  return Math.floor(sec / 60);
}


function formatDate(time, timezone) {
  try {
    return moment(time).tz(timezone).format('MMM D, YYYY');
  } catch(e) {
    return moment(time).format('MMM D, YYYY');
  }
}


function formatTime(time, timezone) {
  try {
    return moment(time).tz(timezone).format('h:mm A');
  } catch(e) {
    return moment(time).format('h:mm A');
  }
}


function formatDayOfWeek(time, timezone) {
  try {
    return moment(time).tz(timezone).format('dddd');
  } catch(e) {
    return moment(time).format('dddd');
  }
}

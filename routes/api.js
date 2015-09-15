var _ = require('underscore');
var async = require('async');
var db = require('../libs/database');
var debug = require('debug')('automaticsalesforce');
var apiUrl = 'https://api.automatic.com';
var jsforce = require('jsforce');
var nconf = require('nconf');
var request = require('request');


exports.user = function(req, res, nest) {
  request.get({
    uri: apiUrl + '/user/me',
    headers: {Authorization: 'bearer ' + req.session.access_token},
    json: true
  }, function(e, r, body) {
    if(e) return next(e);
    res.json(body);
  });
};


exports.createExpense = function(req, res, next) {
  var trip = JSON.parse(req.body.trip || '{}');

  var conn = new jsforce.Connection({
    instanceUrl: req.session.salesforce_instance_url,
    accessToken: req.session.salesforce_access_token
  });

  conn.sobject('Mileage__c').create({
    Name: req.body.name,
    Cost__c: req.body.amount,
    Start_Time__c: req.body.date,
    Mileage__c: req.body.mileage,
    Start_Location__c: req.body.startLocation,
    End_Location__c: req.body.endLocation
  }, function(e, data) {
    if (e) return next(e);

    if(!data && !data.id) {
      return next(new Error('Unable to create expense'));
    }

    console.log('Expense Created: ' + data.id);

    db.createExpense({
      automatic_id: req.session.automatic_id,
      trip_id: req.body.tripID,
      expense_id: data.id
    }, function(e) {
      if(e) return next(e);

      res.json(data.id);
    });
  });


  // }, function(e, data) {
  //   if (e) return next(e);
  //

  // });
};


exports.getExpenses = function(req, res, next) {
  db.getExpenses(req.session.automatic_id, function(e, expenses) {
    if(e) return next(e);
    res.json(_.pluck(expenses, 'trip_id'));
  });
};


exports.getSettings = function(req, res, next) {
  db.getSettings(req.session.automatic_id, function(e, settings) {
    if(e) return next(e);
    res.json(_.omit(settings, ['_id', 'automatic_id']));
  });
};


exports.updateSettings = function(req, res, next) {
  db.updateSettings(req.session.automatic_id, req.body, function(e) {
    if(e) return next(e);
    res.json({});
  });
};


exports.vehicles = function(req, res, next) {
  downloadVehicles(req, function(e, vehicles) {
    if(e) return next(e);
    res.json(vehicles);
  });
};


exports.trips = function(req, res, next) {
  async.parallel([
    function(cb) { downloadTrips(req, cb); },
    function(cb) { downloadVehicles(req, cb); }
  ], function(e, data) {
    if(e) return next(e);

    if(!data[0]) {
      res.json([]);
    } else {
      res.json(mergeTripsAndVehicles(data[0], data[1]));
    }
  });
};


function downloadTrips(req, cb) {
  request.get({
    uri: apiUrl + '/trip/',
    headers: {Authorization: 'bearer ' + req.session.access_token},
    json: true,
    qs: {
      limit: 25,
      page: req.query.page
    }
  }, function(e, r, body) {
    cb(e, body.results);
  });
}


function downloadVehicles (req, cb) {
  request.get({
    uri: apiUrl + '/vehicle/',
    headers: {Authorization: 'bearer ' + req.session.access_token},
    json: true
  }, function(e, r, body) {
    cb(e, body.results);
  });
}


function mergeTripsAndVehicles(trips, vehicles) {
  var vehicleObj = _.object(_.pluck(vehicles, 'url'), vehicles);

  return trips.map(function(trip) {
    trip.vehicle = vehicleObj[trip.vehicle];
    return trip;
  });
}

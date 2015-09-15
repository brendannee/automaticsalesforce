var nconf = require('nconf');
var oauth2 = require('simple-oauth2');
var db = require('../libs/database');
var debug = require('debug')('automaticsalesforce');
var jsforce = require('jsforce');


var automaticOauth2 = oauth2({
  clientID: nconf.get('AUTOMATIC_CLIENT_ID'),
  clientSecret: nconf.get('AUTOMATIC_CLIENT_SECRET'),
  site: 'https://accounts.automatic.com',
  tokenPath: '/oauth/access_token'
});


var salesforceOauth2 = new jsforce.OAuth2({
  clientId: nconf.get('SALESFORCE_CONSUMER_KEY'),
  clientSecret: nconf.get('SALESFORCE_CONSUMER_SECRET'),
  redirectUri: nconf.get('URL') + '/redirect-salesforce',
});


exports.authorize = function(req, res, next) {
  var authorizationURL = automaticOauth2.authCode.authorizeURL({
    scope: 'scope:user:profile scope:trip scope:location scope:vehicle:profile scope:vehicle:events scope:behavior'
  });
  res.redirect(authorizationURL);
};


exports.logout = function(req, res, next) {
  req.session.destroy();
  res.redirect('/');
};


exports.disconnectAll = function(req, res, next) {
  db.destroyUser(req.session.automatic_id, function() {
    //Delete session
    req.session.destroy();
    res.redirect('/');
  });
};


exports.redirect = function (req, res, next) {
  if(req.query.denied === 'true') {
    return res.render('index', {alert: 'User denied access to Automatic'});
  }

  automaticOauth2.authCode.getToken({
    code: req.query.code
  }, function(e, result) {
    if(e) return next(e);

    var token = automaticOauth2.accessToken.create(result);

    var user = {
      automatic_access_token: token.token.access_token,
      automatic_refresh_token: token.token.refresh_token,
      automatic_expires_at: token.token.expires_at,
      automatic_id: token.token.user.id
    };

    req.session.access_token = user.automatic_access_token;
    req.session.automatic_id = user.automatic_id;

    db.saveUser(user, function(e, user) {
      if(e) return next(e);

      // Check if user already has a `salesforce_access_token`
      if(user && user.salesforce_access_token) {
        req.session.salesforce_access_token = user.salesforce_access_token;
      }
      res.redirect('/');
    });
  });
};


exports.authorizeSalesforce = function(req, res, next) {
  res.redirect(salesforceOauth2.getAuthorizationUrl());
};


exports.redirectSalesforce = function(req, res, next) {
  if(!req.query.code) {
    res.render('index', {alert: 'Problem with Salesforce Login'});
  }

  var conn = new jsforce.Connection({oauth2: salesforceOauth2});
  conn.authorize(req.query.code, function(e, userInfo) {
    if(e) return next(e);

    var user = {
      salesforce_access_token: conn.accessToken,
      salesforce_refresh_token: conn.refreshToken,
      salesforce_instance_url: conn.instanceUrl
    };

    req.session.salesforce_access_token = user.salesforce_access_token;
    req.session.salesforce_instance_url = user.salesforce_instance_url;

    db.saveUser(user, function(e, user) {
      if(e) return next(e);
      res.redirect('/');
    });
  });
};

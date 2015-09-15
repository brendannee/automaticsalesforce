var monk = require('monk');
var db = monk(process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/automaticsalesforce');
var expenses = db.get('expenses');
var users = db.get('users');
var settings = db.get('settings');


exports.getUser = function(automatic_id, cb) {
  users.findOne({automatic_id: automatic_id}, cb);
};


exports.saveUser = function(user, cb) {
  users.findAndModify(
    {automatic_id: user.automatic_id},
    {$set: user},
    {upsert: true},
    cb);
};


exports.destroyUser = function(automatic_id, cb) {
  users.remove({automatic_id: automatic_id}, function(e) {
    if(e) return cb(e);
    expenses.remove({automatic_id: automatic_id}, function(e) {
      if(e) return cb(e);
      settings.remove({automatic_id: automatic_id}, cb);
    });
  });
};


exports.getExpenses = function(automatic_id, cb) {
  expenses.find({automatic_id: automatic_id}, {sort: {_id: 1}}, cb);
};


exports.createExpense = function(expense, cb) {
  expenses.insert(expense, cb);
};


exports.getSettings = function(automatic_id, cb) {
  settings.findOne({automatic_id: automatic_id}, cb);
};


exports.updateSettings = function(automatic_id, data, cb) {
  settings.update(
    {automatic_id: automatic_id},
    {$set: data},
    {upsert: true},
    cb
  );
};

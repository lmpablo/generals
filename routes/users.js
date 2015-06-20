var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

router.get('/test', function(req, res, next){
  res.send('inside test');
});

module.exports = router;

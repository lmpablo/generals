var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  var db = req.db;
  var collection = db.get('users');
  collection.find({}, {}, function(e, docs) {
    res.send(docs);
  });
});

router.get('/test', function(req, res, next){
  res.send('inside test');
});

module.exports = router;

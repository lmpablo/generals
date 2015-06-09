var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

// signup page
router.get('/signup', function(req, res, next) {
    res.render('signup', { csrf: req.csrfToken() });
});

module.exports = router;

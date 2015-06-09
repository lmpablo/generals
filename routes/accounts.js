var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var router = express.Router();

router.post('/signup', function(req, res, next) {
    var username = req.body.username,
        password = req.body.password,
        passwordConfirm = req.body.passwordConfirm;

    if (password !== passwordConfirm)  {
        res.status(500).send({
            success: false,
            message: "Password did not match confirmation"
        });
    } else {
        bcrypt.hash(password, null, null, function(err, hash){
            if (err) {
                res.status(500).send({
                    success: false,
                    message: err
                });
            }

            var db = req.db;
            var collection = db.get('users');
            collection.insert({
                username: username,
                password: hash
            }, {}, function(err, doc) {
                if (err) {
                    res.status(500).send({
                        success: false,
                        message: err
                    });
                }
                res.send({
                    success: true
                });
            });
        });
    }
});

module.exports = router;

var express = require('express');
var router = express.Router();

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
}

module.exports = function(app, passport) {
    var users = require('./users');

    router.use('/users', users);

    // HOME
    router.get('/', function(req, res, next) {
        res.render('index', { title: 'Express', user: req.user });
    });

    // SIGNUP
    router.get('/signup', function(req, res, next) {
        res.render('signup', {
            csrf: req.csrfToken(),
            message: req.flash('signupMessage')
        });
    });

    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect: "/",
        failureRedirect: "/signup",
        failureFlash : true // allow flash messages
    }));

    // LOGIN
    router.get('/login', function(req, res, next) {
        res.render('login', {
            csrf: req.csrfToken(),
            message: req.flash('loginMessage')
        });
    });

    router.post('/login', passport.authenticate('local-login', {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true
    }));

    // LOGOUT
    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/')
    });

    app.use('/', router);
};

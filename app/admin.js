module.exports = function(app, passport) {
    var QRcode = require('./models/qrcode');
    var Events = require('./models/events');
    var User = require('./models/user');
    var base64image = require('base64-to-image');

    var path = './public/';
    const qrcode = require('qrcode');

    app.get('/adminDashboard', isHero, function(req, res) {
        Events.find({}, (err, events) => {
            if (err) {
                console.log(" error ");
            } else {
                res.render('adminDashboard.ejs', {
                    user: req.user,
                    events: events

                });
            }
        })
    });

    app.get('/getEvents', (req, res) => {
        Events.find({}, (err, events) => {
            if (err) {
                console.log(" error ");
            } else {
                res.status(200).json({
                    'success': 'true',
                    'events': events
                })
            }
        })
    });








};

function isHero(req, res, next) {
    if (req.user && req.user.isHero) {

        //console.log(" islogged in  state " + req.user);
        next();
    } else {
        //console.log(" islogged in else  state" + req.user);
        res.redirect('/');
    }
}
// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.user) {
        //console.log(" islogged in " + req.user);
        next();
    } else {
        //console.log(" islogged in else " + req.user);
        res.redirect('/login');
    }
}

function isLoggedIn2(req, res, next) {
    if (req.user) {
        //console.log(" islogged in " + req.user);
        res.redirect('/profile');

    } else {
        //console.log(" islogged in else " + req.user);
        next();
    }
}
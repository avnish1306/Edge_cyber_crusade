module.exports = function(app, passport) {
    var QRcode = require('./models/qrcode');
    var base64image = require('base64-to-image');
    var Events = require('./models/events');
    var User = require('./models/user');
    var Tournament = require('./models/tournament');
    var path = './public/';
    const qrcode = require('qrcode');
    const _ = require('lodash');
    var Promise = require('promise');


    async function run(code) {
        var k = code.toString();
        const res = await qrcode.toDataURL(k);
        ////console.log(" result " + res);
        var qrObj = { 'fileName': code, 'type': 'png' };
        var imageInfo = base64image(res, path, qrObj);
        //console.log("image info " + imageInfo);
        if (imageInfo != null) {
            return true;
        } else {
            return false;
        }
    }

    function checkForUpdate(userId) {
        User.findOne({ userId: userId }, (err, user) => {
            if (err) throw err;
            if (user && user.gender == "NONE") {
                return true;
            } else {
                return false;
            }
        })
    }
    app.get('/genQr', (req, res) => {
        run(1234).catch(error => console.log("error"));
        res.status(200).json({
            'status': 'true'
        });
    })

    // normal routes ===============================================================

    // show the home page (will also have our login links)
    /*app.get('/', isLoggedIn2, function(req, res) {
        console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" + req.user);
        res.render('index-square.ejs', { user: 'null', messagel: req.flash('loginMessage'), messages: req.flash('signupMessage') });

    });*/

    app.get('/user_login', isLoggedIn, function(req, res) {
        res.render('index.ejs', { messagel: req.flash('loginMessage'), messages: req.flash('signupMessage') });

    });

    //user form route ===============================================================
    app.get("/user_form", function(req, res) {
        res.render("user_form.ejs");
    })

    app.get("/profile", isLoggedIn, function(req, res) {
        res.render("profile.ejs", {
            user: req.user


        });
    })


    // PROFILE SECTION =========================
    app.get('/', isLoggedIn, function(req, res) {
        var hero = req.user.isHero;
        if (hero == true) {
            res.redirect('/adminDashboard');
        } else {
            var id = req.user.google.id; // need to be updated when facebook login integrated
            var email = req.user.google.email;
            var idStatus = req.user.idStatus;
            if (idStatus == false) {
                if (req.user.google != null) {
                    id = req.user.google.id;
                    email = req.user.google.email;
                } else if (req.user.facebook != null) {
                    id = req.user.facebook.id;
                    email = req.user.facebook.email;
                }
                if (id != null) {

                    var obj = req.user;
                    obj.idStatus = true;
                    obj.userId = id;
                    obj.qrcode = id;
                    obj.save((err, obj) => {
                        if (err)
                            console.log(" error in saving " + err);
                        //console.log("saving " + obj);
                        var Qr = new QRcode();
                        Qr.email = email;
                        Qr.code = id;
                        Qr.fileName = id + '.png';
                        Qr.balance = 0;
                        var curDate = new Date();
                        var history = { 'date': curDate, 'description': "QR genetared" };
                        Qr.history.push(history);

                        Qr.save((err, Qr) => {
                            if (err)
                                console.log(" error in saving " + err);
                            run(id).catch(e => { console.log("error in qrcode function") })
                        })
                        User.findOne({ userId: id }, (err, user) => {
                            if (err) throw err;
                            if (user && user.location == "NULL") {
                                res.render('user_form.ejs', {
                                    user: req.user
                                });
                            } else {
                                res.render('index-square.ejs', {
                                    user: req.user,
                                    messagel: req.flash('loginMessage'),
                                    messages: req.flash('signupMessage')
                                });
                            }
                        })




                    })
                } else {
                    User.findOne({ userId: id }, (err, user) => {
                        if (err) throw err;
                        if (user && user.location == "NULL") {
                            res.render('user_form.ejs', {
                                user: req.user,
                                messagel: req.flash('loginMessage'),
                                messages: req.flash('signupMessage')
                            });
                        } else {
                            res.render('index-square.ejs', {
                                user: req.user
                            });
                        }
                    })
                }
            } else {
                User.findOne({ userId: id }, (err, user) => {
                    if (err) throw err;
                    if (user && user.location == "NULL") {
                        res.render('user_form.ejs', {
                            user: req.user
                        });
                    } else {
                        res.render('index-square.ejs', {
                            user: req.user,
                            messagel: req.flash('loginMessage'),
                            messages: req.flash('signupMessage')
                        });
                    }
                })
            }





        }
    });

    app.get('/members', isLoggedIn, function(req, res) {
        User.findOne({ userId: req.user.userId }, (err, user) => {
            if (err) {
                console.log(" error ");
            } else {
                Tournament.find({}, (err, tournaments) => {
                    if (err) {
                        console.log(" error ");
                    } else {
                        res.render('members.ejs', {
                            user: req.user,
                            members: user.members,
                            tournaments: tournaments,
                            messagel: req.flash('loginMessage'),
                            messages: req.flash('signupMessage')

                        });
                    }
                })

            }
        })
    });

    app.post('/participate', (req, res, next) => {
        var tournamentId = req.body.tournamentId;
        var userId = req.body.userId;
        var userName = req.body.userName;
        var tournamentName = req.body.tournamentName;
        var tournamentObj = {
            'name': tournamentName,
            'tournamentId': tournamentId,
            'rank': -1,
            'status': 'pending'
        }
        var userObj = {
            'userId': userId,
            'name': userName,
            'status': 'pending'
        }
        Tournament.findOne({ tournamentId: tournamentId }, (err, tournament) => {
            if (err) throw err;

            tournament.teams = tournament.teams.concat([userObj]);
            tournament.save((err, newTournament) => {
                if (err) throw err;
                User.findOne({ userId: userId }, (err, user) => {
                    if (err) throw err;
                    user.tournaments = user.tournaments.concat([tournamentObj]);
                    user.save((err, newUser) => {
                        if (err) throw err;
                        res.status(200).json({
                            'success': 'true',
                            'msg': 'participated Successfully'
                        })
                    })

                })

            })

        })

    })


    app.post('/remove-member', (req, res, next) => {
        var userId = req.body.userId;
        var memberEmail = req.body.memberEmail;
        User.findOne({ userId: userId }, (err, user) => {
            if (err) throw err;
            if (user && user.members != null) {
                var filteredMembers = user.members.filter(member => {
                    return member.email != memberEmail;
                })
                user.members = filteredMembers;
                user.save((err, newUser) => {
                    if (err) throw err;
                    res.status(200).json({
                        'success': 'true',
                        'msg': 'member deleted',
                        'user': newUser
                    })
                })
            } else {
                res.status(200).json({
                    'success': 'false',
                    'msg': 'member not found'
                })
            }
        })
    })


    app.post('/add-member', (req, res, next) => {
        var userId = req.body.userId;
        User.findOne({ userId: userId }, (err, user) => {
            if (err) throw error;
            if (user && user.members.length >= 5) {
                res.status(200).json({
                    'success': 'false',
                    'msg': 'Member limit'
                });
            } else {
                var flag = 0;
                user.members.forEach(member => {
                    if (member.email == req.body.obj.email) {
                        flag = 1;
                    }
                })
                if (flag == 0) {
                    user.members = user.members.concat([req.body.obj]);
                    console.log("user " + user);
                    user.save((err, newUser) => {
                        if (err) throw err;
                        res.status(200).json({
                            'success': 'true',
                            'msg': 'member added',
                            'user': newUser
                        });
                    });
                } else {
                    res.status(200).json({
                        'success': 'false',
                        'msg': 'Member Exist'
                    });
                }
                //user.members.push(req.body.obj)

            }
        })

    })

    /*app.get('/:img', (req, res) => {
        var path = './' + req.params.img;
        res.sendFile(path, (err) => {
            if (err) {
                console.log(err);
            }
        })
    })*/
    app.get('/checkForUpdate/:userId', (req, res) => {
        var userId = req.params.userId;

    })

    app.post('/update-user', (req, res, next) => {
        var userId = req.body.userId;
        User.findOne({ userId: userId }, (err, user) => {
            if (err) throw error;
            if (user && user.location != "NULL") {
                res.status(200).json({
                    'success': 'false',
                    'msg': 'Team already updated'
                });
            } else {
                user.name = req.body.name; // nedd to be correced when implement facebook login
                user.location = req.body.location;
                user.displayName = req.body.displayName;
                console.log("user " + user);
                user.save((err, newUser) => {
                    if (err) throw err;
                    console.log(" new user " + newUser);
                    res.status(200).json({
                        'success': 'true',
                        'msg': 'user updated',
                        'user': newUser
                    });
                });
            }
        })

    })
    app.get('/getQRdetails/:code', (req, res) => {
            var QRId = req.params.code;
            console.log(QRId);
            QRcode.findOne({ "code": QRId }, (err, qrcode) => {
                if (err) {

                    console.log(" erroer qr not found");
                    res.status(200).json({
                        'success': flase
                    });
                } else {
                    var resObj = {
                        'email': qrcode.email,
                        'balance': qrcode.balance,
                        'history': qrcode.history
                    }
                    res.status(200).json({
                        'success': true,
                        'qrcode': resObj
                    });
                }

            })
        })
        // Events SECTION =========================
    app.get('/events', isLoggedIn, function(req, res) {
        console.log(" event user: " + req.user);
        var img1 = req.user.userId.toString();
        img1 = img1 + ".png";
        res.render('events.ejs', {
            user: req.user,
            img: img1
        });
    });

    app.get('/scanner', /*isLoggedIn,*/ function(req, res) {
        console.log(" event user: " + req.user);
        res.render('scanner.ejs', {
            user: req.user
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================

    // locally --------------------------------
    // LOGIN ===============================
    // show the login form
    // app.get('/login', function(req, res) {
    //     res.render('login.ejs', { message: req.flash('loginMessage') });
    // });

    // process the login form
    app.get('/login', (req, res) => {
        res.render('index-square.ejs', { user: 'null', messagel: req.flash('loginMessage'), messages: req.flash('signupMessage') });
    });

    // SIGNUP =================================
    // show the signup form
    // app.get('/signup', function(req, res) {`
    //     res.render('signup.ejs', { message: req.flash('signupMessage') });
    // });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.get('/auth/twitter', passport.authenticate('twitter', { scope: 'email' }));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));


    // google ---------------------------------
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    // send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));

    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================

    // locally --------------------------------
    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope: ['public_profile', 'email'] }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.get('/connect/twitter', passport.authorize('twitter', { scope: 'email' }));

    // handle the callback after twitter has authorized the user
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));


    // google ---------------------------------

    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email'] }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));

    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user = req.user;
        user.local.email = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });


};

function isLoggedIn1(req, res, next) {
    if (req.user) {
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
        /*if (res.user.isHero == true) {
            res.redirect('/adminDashboard');
        } else {
            next();
        }*/
        console.log(" islogged in " + req.user.isHero);
        next();
    } else {
        //console.log(" islogged in else " + req.user);
        res.redirect('/login');
    }
}

function isLoggedIn2(req, res, next) {
    if (req.user) {
        //console.log(" islogged in " + req.user);
        res.redirect('/');

    } else {
        //console.log(" islogged in else " + req.user);
        next();
    }
}
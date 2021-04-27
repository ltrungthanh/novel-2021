var express = require('express');
var router = express.Router();
var { validationResult } = require('express-validator');
var { validate } = require('./validator-client');
const Clients = require('../models/clientModel');
const Users = require('../models/userModel');
const NodeCache = require("node-cache");
var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })
const cache = new NodeCache({ stdTTL: process.env.CACHE_TIME });
var bCrypt = require('bcrypt');
let getConfig = function (domainName) {
    return new Promise(function (reslove, reject) {
        Clients.findOne({ host: domainName }, function (err, client) {
            if (!err && client) {
                reslove(client.settings)
            }
        });
    });
}

module.exports = function (passport) {
    router.use(async function (req, res, next) {
        const domainName = req.get('host');
        req.getUrl = function () {
            return req.protocol + "://" + req.get('host') + req.originalUrl;
        }
        // if (!cache.get("config")) {
        //     let config = await getConfig(domainName);
        //     cache.set('config', config);
        // }
        next();
    });

    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });


    router.get('/login',csrfProtection, function (req, res) {
        let config = cache.get("config");
        res.render('client/pages/auth/login', {
            errors: JSON.parse(JSON.stringify(req.flash('message'))),
            config: config,
            csrf: req.csrfToken(),
            user: req.user ? req.user.toJSON() : undefined,
            layout: 'layout.hbs'
        });
    });

    
    router.post('/login', [validate.validateLogin(),csrfProtection], function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.errors.forEach(err => {
                req.flash('message', err.msg);
            });
            res.redirect('/account/login')
        } else {
            passport.authenticate('login_client', {
                successRedirect: '/',
                failureRedirect: '/account/login',
                failureFlash: true
            })(req, res); // <---- ADDD THIS
        }
    });


    router.get('/infomation',csrfProtection, function (req, res) {
        let config = cache.get("config");
        if(req.user) {
            res.render('client/pages/auth/account-info', {
                config: config,
                csrf: req.csrfToken(),
                msg_success : [],
                user: req.user ? req.user.toJSON() : undefined,
                layout: 'layout.hbs'
            });
        } else {
            res.redirect('/');
        }
       
    });

    router.post('/infomation',csrfProtection, function (req, res) {
        let config = cache.get("config");
        let errors = [];
        if(req.body.changePassword =='on' && (!req.body.password || (req.body.password !== req.body.password_confirmation))) {
            errors.push('Please check again your password !') 
        }
        if(!req.body.name) {
            errors.push('Please check again your username !') 
        }
        if(errors.length > 0) {
            res.render('client/pages/auth/account-info', {
                errors: errors,
                config: config,
                msg_success : [],
                csrf: req.csrfToken(),
                user: req.user ? req.user.toJSON() : undefined,
                layout: 'layout.hbs'
            });
        } else{
            let bodyUpdate = {};
            bodyUpdate['account'] = req.body.name;
            if(req.body.changePassword =='on') {
                bodyUpdate['hash_password'] = createHash(req.body.password);
            }
            if(req.user && req.user.email) {
                Users.findOneAndUpdate({email: req.user.email},bodyUpdate, {returnOriginal: false, new: true}, function(err,document) {
                    if(!err){
                        res.render('client/pages/auth/account-info', {
                            msg_success: ['Your account updated'],
                            config: config,
                            csrf: req.csrfToken(),
                            user: document,
                            layout: 'layout.hbs'
                        }); 
                    }
                }).lean();
            } else {
                res.redirect('/')
            }
        
        }
      
    });
     var createHash = function(password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }

    router.get('/register',csrfProtection, function (req, res) {
        let config = cache.get("config");
        res.render('client/pages/auth/register', {
            user: req.user ? req.user.toJSON() : undefined,
            errors: JSON.parse(JSON.stringify(req.flash('message'))),
            csrf: req.csrfToken(),
            config :config,
            layout: 'layout.hbs'
        });
    });

    router.post('/register', [validate.validateRegisterUser(),csrfProtection], function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.errors.forEach(err => {
                req.flash('message', err.msg);
            });
            res.redirect('/account/register')
        } else {
            passport.authenticate('signup', {
                successRedirect: '/',
                failureRedirect: '/account/register',
                failureFlash: true
            })(req, res); // <---- ADDD THIS
        }
    });
    return router;
}
const express = require('express');
let router = express.Router();




var isAuthenticated = function(req, res, next) {
    if (process.env.ENV == 'DEV') {
        return next();
    }
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}



const settings = require('./admin/settings')();
const user = require('./admin/users')();
const introduction = require('./admin/introduction')();
const host = require('./admin/host');
const projects = require('./admin/project')();
router.use('/settings', settings);
router.use('/users', user);
router.use('/introduction', introduction);
router.use('/hosts', host);
router.use('/projects', projects);
router.get('/', isAuthenticated, function(req, res) {
    res.redirect('/admin/posts');
});
module.exports = router;
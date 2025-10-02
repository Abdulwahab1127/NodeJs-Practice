
const User = require('../models/user');

exports.getlogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login', 
        pageTitle: 'Login', 
        isAuthenticated: req.session.isLoggedIn
    });
};

exports.postLogin = (req, res, next) => {
    // Find the dummy user and store in session
    User.findById('68dc2185bb4ee2e5645ac7fe')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save((err) => {
                if (err) {
                    console.log(err);
                }
                res.redirect('/');
            });
        })
        .catch(err => {
            console.log(err);
            res.redirect('/login');
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

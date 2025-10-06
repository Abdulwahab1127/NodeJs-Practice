
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getlogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login', 
        pageTitle: 'Login', 
        isAuthenticated: req.session.isLoggedIn
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                console.log('User not found');
                return res.redirect('/login');
            }

            return bcrypt.compare(password, user.password).then(isMatch => {
                if (!isMatch) {
                    console.log('Invalid password');
                    return res.redirect('/login');
                }

                req.session.isLoggedIn = true;
                req.session.user = user;

                return req.session.save(err => {
                    if (err) console.log(err);
                    res.redirect('/');
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.redirect('/login');
        });
};


exports.getSignup = (req, res, next) => {
     res.render('auth/signup', {
        path: '/signup', 
        pageTitle: 'Signup', 
        isAuthenticated: false
    });
}
exports.postSignup = (req, res, next) => {
}

exports.getSignup = (req, res, next) => {
     res.render('auth/signup', {
        path: '/signup', 
        pageTitle: 'Signup', 
        isAuthenticated: false
    });
}
exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findOne({ email: email })
    .then(userDoc => {
        if (userDoc) {
            // User already exists, redirect to signup page
            return res.redirect('/signup');
        }
        // User does not exist, create a new user
        return bcrypt.hash(password, 12).then(hashedPassword => {
            const newUser = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [] }
            });
            return newUser.save();
        });
    })
    .then(result => {
        res.redirect('/login');
    })
    .catch(err => console.log(err));

}


exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

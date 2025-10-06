
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getlogin = (req, res, next) => {
    const errorMessage = req.flash('error');
    const successMessage = req.flash('success');
    
    res.render('auth/login', {
        path: '/login', 
        pageTitle: 'Login', 
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
        successMessage: successMessage.length > 0 ? successMessage[0] : null
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        req.flash('error', 'Please fill in all fields');
        return res.redirect('/login');
    }

    if (!email.includes('@')) {
        req.flash('error', 'Please enter a valid email address');
        return res.redirect('/login');
    }

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'No account found with this email address. Please sign up first.');
                return res.redirect('/login');
            }

            return bcrypt.compare(password, user.password).then(isMatch => {
                if (!isMatch) {
                    req.flash('error', 'Incorrect password. Please try again.');
                    return res.redirect('/login');
                }

                req.session.isLoggedIn = true;
                req.session.user = user;

                return req.session.save(err => {
                    if (err) {
                        console.log('Session save error:', err);
                        req.flash('error', 'Login failed. Please try again.');
                        return res.redirect('/login');
                    }
                    req.flash('success', 'Successfully logged in! Welcome back.');
                    res.redirect('/');
                });
            });
        })
        .catch(err => {
            console.log('Login error:', err);
            req.flash('error', 'Something went wrong. Please try again later.');
            res.redirect('/login');
        });
};


exports.getSignup = (req, res, next) => {
    const errorMessage = req.flash('error');
    const successMessage = req.flash('success');
    
    res.render('auth/signup', {
        path: '/signup', 
        pageTitle: 'Signup', 
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
        successMessage: successMessage.length > 0 ? successMessage[0] : null
    });
};

exports.postSignup = (req, res, next) => {
    const { email, password, confirmPassword } = req.body;

    // Comprehensive validation
    if (!email || !password || !confirmPassword) {
        req.flash('error', 'Please fill in all fields');
        return res.redirect('/signup');
    }

    if (!email.includes('@') || email.length < 5) {
        req.flash('error', 'Please enter a valid email address');
        return res.redirect('/signup');
    }

    if (password.length < 6) {
        req.flash('error', 'Password must be at least 6 characters long');
        return res.redirect('/signup');
    }

    if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match. Please try again.');
        return res.redirect('/signup');
    }

    // Check if user already exists
    User.findOne({ email: email })
        .then(existingUser => {
            if (existingUser) {
                req.flash('error', 'An account with this email already exists. Please log in instead.');
                return res.redirect('/signup');
            }

            // Create new user
            return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const newUser = new User({
                        name: email.split('@')[0], // Use email prefix as default name
                        email: email,
                        password: hashedPassword,
                        cart: { items: [] }
                    });
                    return newUser.save();
                })
                .then(result => {
                    req.flash('success', 'Account created successfully! Please log in with your credentials.');
                    res.redirect('/login');
                })
                .catch(saveErr => {
                    console.log('User save error:', saveErr);
                    req.flash('error', 'Failed to create account. Please try again.');
                    res.redirect('/signup');
                });
        })
        .catch(err => {
            console.log('Signup error:', err);
            req.flash('error', 'Something went wrong. Please try again later.');
            res.redirect('/signup');
        });
};


exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Logout error:', err);
            req.flash('error', 'Logout failed. Please try again.');
            return res.redirect('/');
        }
        res.redirect('/');
    });
};

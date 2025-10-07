const crypto = require('crypto');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const courier = require("../util/courier");

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
                    req.flash('success', 'Account created successfully! Please log in.');
                    res.redirect('/login');

                    // Send email after redirect (non-blocking)
                    courier.send({
                       message: {
                            to: { email: email },
                            content: {
                                title: "Welcome to Our App 🎉",
                                body: "This is a test email from Courier without a template."
                            },
                            routing: { method: "single", channels: ["email"] }
                            }
                    })
                    .then((result) => console.log("Signup email sent :", result))
                    .catch(err => console.log("Courier error:", err));
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

exports.getReset = (req, res, next) => {
    const errorMessage = req.flash('error');
    const successMessage = req.flash('success');
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
        successMessage: successMessage.length > 0 ? successMessage[0] : null
    });
};

exports.postReset = (req, res, next) => {


    crypto.randomBytes(32, (err, buffer) => {
        if(err){
            console.log(err);
            req.flash('error', 'Something went wrong. Please try again.');
            return res.redirect('/reset');
        }

        const token = buffer.toString('hex');

        User.findOne({ email: req.body.email })
        .then(user => {
            if(!user){  
                req.flash('error', 'No account found with that email address.');
                console.log("User not Found!");
                return res.redirect('/reset'); // ✅ only here if user not found
            }
            
            // set token & expiration
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;

            return user.save().then(result => {
                // send email AFTER saving token
                courier.send({
                    message: {
                        to: { email: req.body.email },
                        template: "W733JX5Y41MMK7G6MAX5PKVKYS3K", // use template ID
                        data: {
                            name: user.name || "Abdul Wahab", // optional fallback
                            resetLink: `http://localhost:3000/reset/${token}`
                        }
                    }
                })    
                .then(() => {
                    console.log("Password reset email sent");
                    req.flash('success', 'Password reset link has been sent to your email.');
                    res.redirect('/login');  // ✅ redirect AFTER email is queued
                })
                .catch(err => {
                    console.log("Courier error:", err);
                    req.flash('error', 'Failed to send email. Please try again.');
                    res.redirect('/reset');
                });
            });
        })
        .catch(err => {
            console.log(err);
            req.flash('error', 'Something went wrong. Please try again.');
            console.log("Something Went Wrong!");
            return res.redirect('/reset');
        });
    });  
};

exports.getNewPassword = (req, res, next) => {
    
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            const errorMessage = req.flash('error');
            const successMessage = req.flash('success');
            res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
            successMessage: successMessage.length > 0 ? successMessage[0] : null,
            userId: user._id.toString(),
            passwordToken: req.params.token
        });
    })
    .catch(err => { console.log(err); });
    
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
    .then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })
    .then(result => {
        req.flash('success', 'Password has been reset successfully.');
        res.redirect('/login');
    })
    .catch(err => {
        console.log(err);
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect('/reset');
    });
}
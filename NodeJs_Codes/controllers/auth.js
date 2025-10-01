

exports.getlogin = (req, res, next) => {
    // Check if user is already logged in via cookie
    const cookies = req.get('Cookie');
    let isLoggedIn = false;
    
    if (cookies) {
        const loggedInCookie = cookies.split(';').find(cookie => cookie.trim().startsWith('loggedIn='));
        if (loggedInCookie) {
            isLoggedIn = loggedInCookie.split('=')[1] === 'true';
        }
    }
    
    res.render('auth/login', {
        path: '/login', 
        pageTitle: 'Login', 
        isAuthenticated: isLoggedIn
    });
};

exports.postLogin = (req, res, next) => {
    // Set cookie for authentication
    res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly; Max-Age=3600'); // Expires in 1 hour
    res.redirect('/');   // Redirect to home page
};

exports.postLogout = (req, res, next) => {
    // Clear the authentication cookie
    res.setHeader('Set-Cookie', 'loggedIn=; HttpOnly; Max-Age=0'); // Expire immediately
    res.redirect('/');
};

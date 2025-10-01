const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
// const  {mongoConnect}  = require('./util/database');

const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/user');

// Middleware to parse the body of incoming requests

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to attach a user to each request
app.use((req, res, next) => {
  User.findById('68dc2185bb4ee2e5645ac7fe')
    .then(user => {
    req.user = user;
      next();
    
  })
  .catch(err => console.log(err));
  
});

// Middleware to check authentication status from cookies
app.use((req, res, next) => {
  const cookies = req.get('Cookie');
  let isLoggedIn = false;
  
  if (cookies) {
    const loggedInCookie = cookies.split(';').find(cookie => cookie.trim().startsWith('loggedIn='));
    if (loggedInCookie) {
      isLoggedIn = loggedInCookie.split('=')[1] === 'true';
    }
  }
  
  req.isAuthenticated = isLoggedIn;
  next();
});

// Routes

app.use('/admin', require('./routes/admin'));
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);


mongoose
  .connect(
    'mongodb+srv://abdulwahab:wahab%40123@clusterbackend.jbyqk33.mongodb.net/ShopDB?retryWrites=true&w=majority&appName=ClusterBackend'
  )

  .then(result =>{
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Abdul Wahab',
          email: 'abdul@example.com',
          cart: { items: [] }
        });
        user.save();
      }
    });
  })
  .then(() => {
    app.listen(3000, () => console.log('Server running on http://localhost:3000'));
  })
  .catch(err => console.log(err));

 
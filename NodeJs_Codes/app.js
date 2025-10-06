const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const errorController = require('./controllers/error');
require('dotenv').config();

const MongoDBStore = require('connect-mongodb-session')(session); // For storing sessions in MongoDB

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;


const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/user');

// Middleware to parse the body of incoming requests

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false,
  store: store
}));

// Middleware to attach user from session
app.use((req, res, next) => {
  if (req.session.user) {
    req.user = req.session.user;
  }
  next();
});

// Authentication is now handled directly in controllers via req.session.isLoggedIn

// Routes

app.use('/admin', require('./routes/admin'));
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);


mongoose
  .connect(
    MONGODB_URI
  )
  .then(() => {
    app.listen(3000, () => console.log('Server running on http://localhost:3000'));
  })
  .catch(err => console.log(err));

 
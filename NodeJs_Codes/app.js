const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();
const multer = require('multer'); // For handling file uploads

const MongoDBStore = require('connect-mongodb-session')(session); // For storing sessions in MongoDB

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const csrf = require('csurf');

const flash = require('connect-flash');


const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});



const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/user');
const errorController = require('./controllers/error');


// Middleware to parse the body of incoming requests

app.use(bodyParser.urlencoded({ extended: false }));

// Configure multer for file uploads
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public', 'images')); // ✅ correct path
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  }
});
// To filter files and accept only images
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};


app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
// Session middleware
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false,
  store: store
}));

app.use(csrfProtection); // CSRF protection middleware
app.use(flash()); // Flash message middleware

// Middleware to attach user from session
app.use((req, res, next) => {
  if (req.session.user) {
    req.user = req.session.user;
  }
  next();
});


app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});


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

 
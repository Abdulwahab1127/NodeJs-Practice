const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();

router.get('/login', authController.getlogin);

router.post('/login', authController.postLogin);

router.get('/signup', authController.getSignup);

router.post('/signup', authController.postSignup);

router.post('/logout', authController.postLogout);

module.exports = router;
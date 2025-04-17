const express = require('express');
const router = express.Router();
const authController = require('../controllers/Usercontroller');

router.post('/signup', authController.signup);
router.post('/verify-otp', authController.verifyOTP);
router.post('/signin', authController.signin);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
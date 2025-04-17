const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const emailTemplate = require('../utils/emailTmplate');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Signup controller
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      otp: generateOTP(),
      otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP',
      html: emailTemplate(user.otp),
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: 'User registered successfully. Please verify your email with the OTP sent.',
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Verify OTP controller
// Verify OTP controller
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Create token after successful verification
    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      message: 'Email verified successfully',
      token,
      result: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Signin controller
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    // Create token
    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ result: user, token });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Forgot password controller
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="background-color: #000; color: #FFD700; padding: 20px; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; border: 2px solid #FFD700; border-radius: 10px; padding: 20px;">
            <h1 style="text-align: center; color: #FFD700;">Password Reset</h1>
            <p style="font-size: 16px;">You requested a password reset. Click the link below to reset your password:</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${resetUrl}" style="background-color: #FFD700; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px;">This link will expire in 1 hour.</p>
            
            <div style="margin-top: 30px; text-align: center;">
              <p style="font-size: 12px; color: #aaa;">If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// Reset password controller
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};
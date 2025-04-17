const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name'],
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: String,
  otpExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  savedBlogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }]
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
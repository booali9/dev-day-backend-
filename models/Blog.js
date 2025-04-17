const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter a blog title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  heading: {
    type: String,
    required: [true, 'Please enter a blog heading'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Please upload an image']
  },
  content: {
    type: String,
    required: [true, 'Please enter blog content']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: [true, 'Please enter a comment']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
const Blog = require('../models/Blog');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
// Admin-only: Create blog

// Admin-only: Create blog
exports.createBlog = async (req, res) => {
  try {
    const { title, heading, content } = req.body;
    
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const blog = await Blog.create({
      title,
      heading,
      image: req.file.path, // Cloudinary URL
      content,
      author: req.user.id
    });

    res.status(201).json({
      success: true,
      blog
    });
  } catch (error) {
    // Delete uploaded image if blog creation fails
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    res.status(500).json({
      success: false,
      message: 'Error creating blog',
      error: error.message
    });
  }
};

// Admin-only: Update blog
exports.updateBlog = async (req, res) => {
  try {
    const { title, heading, content } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const updateData = {
      title,
      heading,
      content
    };

    // If new image was uploaded
    if (req.file) {
      // Delete old image from Cloudinary
      if (blog.image) {
        const publicId = blog.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`blog-images/${publicId}`);
      }
      updateData.image = req.file.path;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      blog: updatedBlog
    });
  } catch (error) {
    // Delete uploaded image if update fails
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    res.status(500).json({
      success: false,
      message: 'Error updating blog',
      error: error.message
    });
  }
};

// Admin-only: Delete blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Delete image from Cloudinary
    if (blog.image) {
      const publicId = blog.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`blog-images/${publicId}`);
    }

    await Blog.findByIdAndDelete(req.params.id);

    // Remove blog from users' savedBlogs
    await User.updateMany(
      { savedBlogs: req.params.id },
      { $pull: { savedBlogs: req.params.id } }
    );

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting blog',
      error: error.message
    });
  }
};
// Get all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate('author', 'name').sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
};

// Get single blog
exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name')
      .populate('likes', 'name')
      .populate('comments.user', 'name');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.status(200).json({
      success: true,
      blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: error.message
    });
  }
};

// Like/Unlike blog
exports.likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user already liked the blog
    const alreadyLiked = blog.likes.includes(req.user.id);

    if (alreadyLiked) {
      // Unlike
      blog.likes.pull(req.user.id);
      await blog.save();
      
      return res.status(200).json({
        success: true,
        message: 'Blog unliked successfully'
      });
    } else {
      // Like
      blog.likes.push(req.user.id);
      await blog.save();
      
      return res.status(200).json({
        success: true,
        message: 'Blog liked successfully'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error liking blog',
      error: error.message
    });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    blog.comments.push({
      user: req.user.id,
      text
    });

    await blog.save();

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// Save/Unsave blog
exports.saveBlog = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if blog is already saved
    const alreadySaved = user.savedBlogs.includes(req.params.id);

    if (alreadySaved) {
      // Unsave
      user.savedBlogs.pull(req.params.id);
      await user.save();
      
      return res.status(200).json({
        success: true,
        message: 'Blog unsaved successfully'
      });
    } else {
      // Save
      user.savedBlogs.push(req.params.id);
      await user.save();
      
      return res.status(200).json({
        success: true,
        message: 'Blog saved successfully'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving blog',
      error: error.message
    });
  }
};
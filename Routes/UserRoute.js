const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlog);

// Protected routes (require authentication)
router.use(isAuthenticated);

router.post('/:id/like', blogController.likeBlog);
router.post('/:id/comment', blogController.addComment);
router.post('/:id/save', blogController.saveBlog);

// Admin-only routes
router.use(isAdmin);

router.post('/', upload.single('image'), blogController.createBlog);
router.put('/:id', upload.single('image'), blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
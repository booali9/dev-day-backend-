// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/ContactController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Public route
router.post('/', contactController.submitContact);

// Admin routes
router.use(isAuthenticated);
router.use(isAdmin);

router.get('/', contactController.getAllContacts);
router.get('/:id', contactController.getContact);
router.put('/:id', contactController.updateContactStatus);

module.exports = router;
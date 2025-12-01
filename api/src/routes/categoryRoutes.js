/**
 * Category Routes
 *
 * Public routes for browsing categories and filtering clubs.
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Public routes
router.get('/', categoryController.getAllCategories);           // GET /api/categories
router.get('/:id/clubs', categoryController.getClubsByCategory); // GET /api/categories/:id/clubs

module.exports = router;

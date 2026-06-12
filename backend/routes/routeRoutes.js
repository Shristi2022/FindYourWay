const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');

// GET /api/routes
router.get('/', routeController.getRoutes);

module.exports = router;

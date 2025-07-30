const express = require('express');
const router = express.Router();

// Simple test route
router.get('/', (req, res) => {
  res.json({ message: 'Enrollment routes working' });
});

// Test route with parameter
router.get('/test/:id', (req, res) => {
  res.json({ 
    message: 'Test route with parameter', 
    id: req.params.id 
  });
});

module.exports = router;

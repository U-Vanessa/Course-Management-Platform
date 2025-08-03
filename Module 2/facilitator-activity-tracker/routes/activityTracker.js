const express = require('express');
const router = express.Router();
const activityTrackerController = require('../controllers/activityTrackerController');
const { authenticate, authorize, checkFacilitatorOwnership } = require('../middleware/auth');

// Activity Tracker Routes

// Create or update activity tracker entry
router.post('/', 
  authenticate, 
  authorize('facilitator', 'manager', 'admin'),
  activityTrackerController.createOrUpdate
);

// Get activity trackers with filters (role-based access)
router.get('/', 
  authenticate,
  authorize('facilitator', 'manager', 'admin'),
  activityTrackerController.getActivities
);

// Get activity summary/dashboard data
router.get('/summary', 
  authenticate,
  authorize('facilitator', 'manager', 'admin'),
  activityTrackerController.getActivitySummary
);

// Get single activity tracker by ID
router.get('/:id', 
  authenticate,
  authorize('facilitator', 'manager', 'admin'),
  activityTrackerController.getActivity
);

// Update activity tracker entry
router.put('/:id', 
  authenticate,
  authorize('facilitator', 'manager', 'admin'),
  activityTrackerController.createOrUpdate
);

// Delete activity tracker entry
router.delete('/:id', 
  authenticate,
  authorize('facilitator', 'manager', 'admin'),
  activityTrackerController.deleteActivity
);

module.exports = router;

const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { authenticate, authorize } = require('../middleware/auth');

// Notification Routes

// Get notifications for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const { type } = req.query;
    const notifications = await notificationService.getNotifications(req.user.id, type);
    
    res.status(200).json({
      notifications,
      count: notifications.length
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      error: 'Failed to fetch notifications',
      details: error.message 
    });
  }
});

// Mark notifications as read
router.post('/mark-read', authenticate, async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!Array.isArray(notificationIds)) {
      return res.status(400).json({ 
        error: 'notificationIds must be an array' 
      });
    }

    await notificationService.markNotificationsAsRead(req.user.id, notificationIds);
    
    res.status(200).json({
      message: 'Notifications marked as read successfully'
    });

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ 
      error: 'Failed to mark notifications as read',
      details: error.message 
    });
  }
});

// Send instant notification (managers and admins only)
router.post('/send', authenticate, authorize('manager', 'admin'), async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (!type || !data) {
      return res.status(400).json({ 
        error: 'Type and data are required' 
      });
    }

    const notification = await notificationService.sendInstantNotification(type, data);
    
    res.status(200).json({
      message: 'Notification sent successfully',
      notification
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ 
      error: 'Failed to send notification',
      details: error.message 
    });
  }
});

// Schedule deadline reminders (managers and admins only)
router.post('/schedule-reminders', authenticate, authorize('manager', 'admin'), async (req, res) => {
  try {
    const { weekNumber, deadline } = req.body;
    
    if (!weekNumber || !deadline) {
      return res.status(400).json({ 
        error: 'weekNumber and deadline are required' 
      });
    }

    await notificationService.scheduleDeadlineReminders(weekNumber, new Date(deadline));
    
    res.status(200).json({
      message: 'Deadline reminders scheduled successfully'
    });

  } catch (error) {
    console.error('Error scheduling reminders:', error);
    res.status(500).json({ 
      error: 'Failed to schedule reminders',
      details: error.message 
    });
  }
});

// Get queue statistics (admins only)
router.get('/queue-stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const stats = await notificationService.getQueueStats();
    
    res.status(200).json({
      queueStats: stats
    });

  } catch (error) {
    console.error('Error fetching queue stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch queue stats',
      details: error.message 
    });
  }
});

module.exports = router;

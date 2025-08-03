const Queue = require('bull');
const { User } = require('../models');
const redisClient = require('../config/redis');

// Create notification queues
const emailQueue = new Queue('email notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  }
});

const reminderQueue = new Queue('activity reminders', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  }
});

class NotificationService {
  constructor() {
    this.setupQueueProcessors();
  }

  // Setup queue processors
  setupQueueProcessors() {
    // Process email notifications
    emailQueue.process('completion-notification', async (job) => {
      const { activityTracker, courseOffering, managers } = job.data;
      
      try {
        // In a real application, you would integrate with an email service like SendGrid, AWS SES, etc.
        console.log('Sending completion notification:', {
          activityId: activityTracker.id,
          course: `${courseOffering.courseName} (${courseOffering.courseCode})`,
          week: activityTracker.weekNumber,
          facilitator: activityTracker.facilitator?.name,
          managers: managers.map(m => m.email)
        });

        // Simulate email sending
        await this.simulateEmailSending(activityTracker, courseOffering, managers);
        
        return { success: true, message: 'Completion notification sent successfully' };
      } catch (error) {
        console.error('Failed to send completion notification:', error);
        throw error;
      }
    });

    // Process activity reminders
    reminderQueue.process('deadline-reminder', async (job) => {
      const { facilitators, weekNumber, deadline } = job.data;
      
      try {
        console.log('Sending deadline reminders:', {
          weekNumber,
          deadline,
          facilitators: facilitators.map(f => f.email)
        });

        // Simulate reminder email sending
        await this.simulateReminderSending(facilitators, weekNumber, deadline);
        
        return { success: true, message: 'Deadline reminders sent successfully' };
      } catch (error) {
        console.error('Failed to send deadline reminders:', error);
        throw error;
      }
    });
  }

  // Send completion notification to managers
  async sendCompletionNotification(activityTracker, courseOffering) {
    try {
      // Get all managers
      const managers = await User.findAll({
        where: { 
          role: 'manager',
          isActive: true 
        },
        attributes: ['id', 'name', 'email']
      });

      if (managers.length === 0) {
        console.log('No active managers found for notification');
        return;
      }

      // Add job to email queue
      await emailQueue.add('completion-notification', {
        activityTracker,
        courseOffering,
        managers
      }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      });

      console.log(`Completion notification queued for activity ${activityTracker.id}`);

    } catch (error) {
      console.error('Error queuing completion notification:', error);
      throw error;
    }
  }

  // Schedule deadline reminders
  async scheduleDeadlineReminders(weekNumber, deadline) {
    try {
      // Get all active facilitators
      const facilitators = await User.findAll({
        where: { 
          role: 'facilitator',
          isActive: true 
        },
        attributes: ['id', 'name', 'email']
      });

      if (facilitators.length === 0) {
        console.log('No active facilitators found for reminders');
        return;
      }

      // Calculate reminder times (24 hours and 2 hours before deadline)
      const reminderTimes = [
        new Date(deadline.getTime() - 24 * 60 * 60 * 1000), // 24 hours before
        new Date(deadline.getTime() - 2 * 60 * 60 * 1000)   // 2 hours before
      ];

      for (const reminderTime of reminderTimes) {
        if (reminderTime > new Date()) { // Only schedule future reminders
          await reminderQueue.add('deadline-reminder', {
            facilitators,
            weekNumber,
            deadline
          }, {
            delay: reminderTime.getTime() - Date.now(),
            attempts: 2,
            backoff: {
              type: 'fixed',
              delay: 30000
            }
          });

          console.log(`Deadline reminder scheduled for ${reminderTime} (Week ${weekNumber})`);
        }
      }

    } catch (error) {
      console.error('Error scheduling deadline reminders:', error);
      throw error;
    }
  }

  // Send instant notification for urgent updates
  async sendInstantNotification(type, data) {
    try {
      const notificationData = {
        type,
        data,
        timestamp: new Date(),
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Store in Redis for real-time retrieval
      const key = `notifications:${type}:${data.userId || 'all'}`;
      await redisClient.lpush(key, JSON.stringify(notificationData));
      await redisClient.expire(key, 86400); // Expire after 24 hours

      // In a real application, you might also publish to WebSocket/Socket.IO for real-time updates
      console.log('Instant notification sent:', notificationData);

      return notificationData;

    } catch (error) {
      console.error('Error sending instant notification:', error);
      throw error;
    }
  }

  // Get pending notifications for a user
  async getNotifications(userId, type = null) {
    try {
      const keys = type 
        ? [`notifications:${type}:${userId}`, `notifications:${type}:all`]
        : [`notifications:*:${userId}`, `notifications:*:all`];

      const notifications = [];

      for (const keyPattern of keys) {
        const matchingKeys = await redisClient.keys(keyPattern);
        
        for (const key of matchingKeys) {
          const items = await redisClient.lrange(key, 0, -1);
          const parsedItems = items.map(item => JSON.parse(item));
          notifications.push(...parsedItems);
        }
      }

      // Sort by timestamp (newest first)
      notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return notifications;

    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  // Mark notifications as read
  async markNotificationsAsRead(userId, notificationIds) {
    try {
      // In a more sophisticated implementation, you'd track read status per user
      // For now, we'll just remove the notifications from Redis
      
      for (const notificationId of notificationIds) {
        const keys = await redisClient.keys(`notifications:*:${userId}`);
        
        for (const key of keys) {
          const items = await redisClient.lrange(key, 0, -1);
          const filteredItems = items.filter(item => {
            const parsed = JSON.parse(item);
            return parsed.id !== notificationId;
          });

          // Replace the list with filtered items
          await redisClient.del(key);
          if (filteredItems.length > 0) {
            await redisClient.lpush(key, ...filteredItems);
            await redisClient.expire(key, 86400);
          }
        }
      }

      console.log(`Marked ${notificationIds.length} notifications as read for user ${userId}`);

    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  // Get queue statistics
  async getQueueStats() {
    try {
      const emailStats = {
        waiting: await emailQueue.getWaiting().then(jobs => jobs.length),
        active: await emailQueue.getActive().then(jobs => jobs.length),
        completed: await emailQueue.getCompleted().then(jobs => jobs.length),
        failed: await emailQueue.getFailed().then(jobs => jobs.length)
      };

      const reminderStats = {
        waiting: await reminderQueue.getWaiting().then(jobs => jobs.length),
        active: await reminderQueue.getActive().then(jobs => jobs.length),
        completed: await reminderQueue.getCompleted().then(jobs => jobs.length),
        failed: await reminderQueue.getFailed().then(jobs => jobs.length)
      };

      return {
        emailQueue: emailStats,
        reminderQueue: reminderStats
      };

    } catch (error) {
      console.error('Error getting queue stats:', error);
      throw error;
    }
  }

  // Simulate email sending (replace with actual email service integration)
  async simulateEmailSending(activityTracker, courseOffering, managers) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`📧 EMAIL SENT:
        To: ${managers.map(m => m.email).join(', ')}
        Subject: Activity Completed - ${courseOffering.courseName} Week ${activityTracker.weekNumber}
        Body: Facilitator ${activityTracker.facilitator?.name} has completed all activities for Week ${activityTracker.weekNumber} of ${courseOffering.courseName} (${courseOffering.courseCode}).
        `);
        resolve();
      }, 1000); // Simulate 1 second email sending delay
    });
  }

  // Simulate reminder email sending
  async simulateReminderSending(facilitators, weekNumber, deadline) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`⏰ REMINDER SENT:
        To: ${facilitators.map(f => f.email).join(', ')}
        Subject: Activity Deadline Reminder - Week ${weekNumber}
        Body: This is a reminder that Week ${weekNumber} activities are due on ${deadline.toDateString()}.
        `);
        resolve();
      }, 500); // Simulate 0.5 second email sending delay
    });
  }
}

module.exports = new NotificationService();

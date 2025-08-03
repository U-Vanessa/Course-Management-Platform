const { ActivityTracker, User, CourseOffering } = require('../models');
const { Op } = require('sequelize');
const notificationService = require('../services/notificationService');

class ActivityTrackerController {
  // Create or update activity tracker entry
  async createOrUpdate(req, res) {
    try {
      const { allocationId, weekNumber } = req.body;
      const facilitatorId = req.user.id;

      // Verify facilitator has access to this allocation
      const courseOffering = await CourseOffering.findOne({
        where: { 
          id: allocationId,
          facilitatorId: req.user.role === 'facilitator' ? facilitatorId : undefined
        },
        include: [{
          model: User,
          as: 'facilitator',
          attributes: ['id', 'name', 'email']
        }]
      });

      if (!courseOffering) {
        return res.status(404).json({ 
          error: 'Course offering not found or access denied' 
        });
      }

      // Find existing entry or create new one
      let activityTracker = await ActivityTracker.findOne({
        where: { allocationId, weekNumber }
      });

      const activityData = {
        allocationId,
        facilitatorId: courseOffering.facilitatorId,
        weekNumber,
        attendance: req.body.attendance || [],
        formativeOneGrading: req.body.formativeOneGrading || 'Not Started',
        formativeTwoGrading: req.body.formativeTwoGrading || 'Not Started',
        summativeGrading: req.body.summativeGrading || 'Not Started',
        courseModeration: req.body.courseModeration || 'Not Started',
        intranetSync: req.body.intranetSync || 'Not Started',
        gradeBookStatus: req.body.gradeBookStatus || 'Not Started',
        submissionDate: req.body.submissionDate,
        lastUpdated: new Date(),
        notes: req.body.notes
      };

      if (activityTracker) {
        // Update existing
        await activityTracker.update(activityData);
      } else {
        // Create new
        activityTracker = await ActivityTracker.create(activityData);
      }

      // Send notification to managers if activity is completed
      const isCompleted = this.checkActivityCompletion(activityTracker);
      if (isCompleted) {
        await notificationService.sendCompletionNotification(activityTracker, courseOffering);
      }

      // Load full data for response
      const result = await ActivityTracker.findByPk(activityTracker.id, {
        include: [
          {
            model: CourseOffering,
            as: 'courseOffering',
            attributes: ['id', 'courseName', 'courseCode', 'semester', 'year']
          },
          {
            model: User,
            as: 'facilitator',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      res.status(200).json({
        message: activityTracker.id ? 'Activity tracker updated successfully' : 'Activity tracker created successfully',
        data: result
      });

    } catch (error) {
      console.error('Error in createOrUpdate:', error);
      res.status(500).json({ 
        error: 'Failed to save activity tracker',
        details: error.message 
      });
    }
  }

  // Get activity trackers with filters
  async getActivities(req, res) {
    try {
      const { 
        facilitatorId, 
        weekNumber, 
        semester, 
        year, 
        status,
        page = 1, 
        limit = 10 
      } = req.query;

      const offset = (page - 1) * limit;
      
      // Build where conditions
      let whereConditions = {};
      let courseOfferingConditions = {};

      // Role-based access control
      if (req.user.role === 'facilitator') {
        whereConditions.facilitatorId = req.user.id;
      } else if (facilitatorId) {
        whereConditions.facilitatorId = facilitatorId;
      }

      if (weekNumber) {
        whereConditions.weekNumber = weekNumber;
      }

      if (semester) {
        courseOfferingConditions.semester = semester;
      }

      if (year) {
        courseOfferingConditions.year = year;
      }

      // Status filter (check if any grading task has specific status)
      if (status) {
        whereConditions[Op.or] = [
          { formativeOneGrading: status },
          { formativeTwoGrading: status },
          { summativeGrading: status },
          { courseModeration: status },
          { intranetSync: status },
          { gradeBookStatus: status }
        ];
      }

      const { count, rows } = await ActivityTracker.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: CourseOffering,
            as: 'courseOffering',
            where: Object.keys(courseOfferingConditions).length > 0 ? courseOfferingConditions : undefined,
            attributes: ['id', 'courseName', 'courseCode', 'semester', 'year', 'startDate', 'endDate']
          },
          {
            model: User,
            as: 'facilitator',
            attributes: ['id', 'name', 'email', 'role']
          }
        ],
        order: [['weekNumber', 'ASC'], ['updatedAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.status(200).json({
        data: rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total_items: count,
          total_pages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      console.error('Error in getActivities:', error);
      res.status(500).json({ 
        error: 'Failed to fetch activity trackers',
        details: error.message 
      });
    }
  }

  // Get single activity tracker
  async getActivity(req, res) {
    try {
      const { id } = req.params;
      
      const activityTracker = await ActivityTracker.findByPk(id, {
        include: [
          {
            model: CourseOffering,
            as: 'courseOffering',
            attributes: ['id', 'courseName', 'courseCode', 'semester', 'year', 'startDate', 'endDate']
          },
          {
            model: User,
            as: 'facilitator',
            attributes: ['id', 'name', 'email', 'role']
          }
        ]
      });

      if (!activityTracker) {
        return res.status(404).json({ error: 'Activity tracker not found' });
      }

      // Check access permissions
      if (req.user.role === 'facilitator' && activityTracker.facilitatorId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.status(200).json({ data: activityTracker });

    } catch (error) {
      console.error('Error in getActivity:', error);
      res.status(500).json({ 
        error: 'Failed to fetch activity tracker',
        details: error.message 
      });
    }
  }

  // Delete activity tracker
  async deleteActivity(req, res) {
    try {
      const { id } = req.params;
      
      const activityTracker = await ActivityTracker.findByPk(id);

      if (!activityTracker) {
        return res.status(404).json({ error: 'Activity tracker not found' });
      }

      // Check access permissions
      if (req.user.role === 'facilitator' && activityTracker.facilitatorId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await activityTracker.destroy();

      res.status(200).json({ message: 'Activity tracker deleted successfully' });

    } catch (error) {
      console.error('Error in deleteActivity:', error);
      res.status(500).json({ 
        error: 'Failed to delete activity tracker',
        details: error.message 
      });
    }
  }

  // Get activity summary/dashboard data
  async getActivitySummary(req, res) {
    try {
      const { semester, year } = req.query;
      
      let whereConditions = {};
      let courseOfferingConditions = {};

      // Role-based access control
      if (req.user.role === 'facilitator') {
        whereConditions.facilitatorId = req.user.id;
      }

      if (semester) {
        courseOfferingConditions.semester = semester;
      }

      if (year) {
        courseOfferingConditions.year = year;
      }

      // Get completion statistics
      const activities = await ActivityTracker.findAll({
        where: whereConditions,
        include: [
          {
            model: CourseOffering,
            as: 'courseOffering',
            where: Object.keys(courseOfferingConditions).length > 0 ? courseOfferingConditions : undefined,
            attributes: ['id', 'courseName', 'courseCode', 'semester', 'year']
          }
        ]
      });

      // Calculate statistics
      const totalActivities = activities.length;
      const completedActivities = activities.filter(activity => this.checkActivityCompletion(activity)).length;
      const pendingActivities = activities.filter(activity => this.hasPendingTasks(activity)).length;
      const notStartedActivities = totalActivities - completedActivities - pendingActivities;

      // Week-wise progress
      const weeklyProgress = {};
      for (let week = 1; week <= 16; week++) {
        const weekActivities = activities.filter(activity => activity.weekNumber === week);
        weeklyProgress[`week_${week}`] = {
          total: weekActivities.length,
          completed: weekActivities.filter(activity => this.checkActivityCompletion(activity)).length,
          pending: weekActivities.filter(activity => this.hasPendingTasks(activity)).length
        };
      }

      res.status(200).json({
        summary: {
          totalActivities,
          completedActivities,
          pendingActivities,
          notStartedActivities,
          completionRate: totalActivities > 0 ? (completedActivities / totalActivities * 100).toFixed(2) : 0
        },
        weeklyProgress
      });

    } catch (error) {
      console.error('Error in getActivitySummary:', error);
      res.status(500).json({ 
        error: 'Failed to fetch activity summary',
        details: error.message 
      });
    }
  }

  // Helper method to check if all activities are completed
  checkActivityCompletion(activity) {
    return activity.formativeOneGrading === 'Done' &&
           activity.formativeTwoGrading === 'Done' &&
           activity.summativeGrading === 'Done' &&
           activity.courseModeration === 'Done' &&
           activity.intranetSync === 'Done' &&
           activity.gradeBookStatus === 'Done';
  }

  // Helper method to check if activity has pending tasks
  hasPendingTasks(activity) {
    return activity.formativeOneGrading === 'Pending' ||
           activity.formativeTwoGrading === 'Pending' ||
           activity.summativeGrading === 'Pending' ||
           activity.courseModeration === 'Pending' ||
           activity.intranetSync === 'Pending' ||
           activity.gradeBookStatus === 'Pending';
  }
}

module.exports = new ActivityTrackerController();

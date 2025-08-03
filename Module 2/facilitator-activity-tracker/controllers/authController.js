const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthController {
  // User registration
  async register(req, res) {
    try {
      const { name, email, password, role = 'facilitator' } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({ 
          error: 'Name, email, and password are required' 
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ 
          error: 'User with this email already exists' 
        });
      }

      // Validate role
      const validRoles = ['facilitator', 'manager', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          error: 'Invalid role. Must be facilitator, manager, or admin' 
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        isActive: true
      });

      // Remove password from response
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      };

      res.status(201).json({
        message: 'User registered successfully',
        user: userResponse
      });

    } catch (error) {
      console.error('Error in register:', error);
      res.status(500).json({ 
        error: 'Failed to register user',
        details: error.message 
      });
    }
  }

  // User login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email and password are required' 
        });
      }

      // Find user
      const user = await User.findOne({ 
        where: { 
          email,
          isActive: true 
        } 
      });

      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Update last login
      await user.update({ lastLogin: new Date() });

      // Remove password from response
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      };

      res.status(200).json({
        message: 'Login successful',
        token,
        user: userResponse
      });

    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ 
        error: 'Failed to login',
        details: error.message 
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'name', 'email', 'role', 'isActive', 'lastLogin', 'createdAt', 'updatedAt']
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ user });

    } catch (error) {
      console.error('Error in getProfile:', error);
      res.status(500).json({ 
        error: 'Failed to fetch profile',
        details: error.message 
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { name, email } = req.body;
      const userId = req.user.id;

      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await User.findOne({ 
          where: { 
            email,
            id: { [require('sequelize').Op.ne]: userId }
          } 
        });
        
        if (existingUser) {
          return res.status(409).json({ 
            error: 'Email is already taken by another user' 
          });
        }
      }

      await User.update(updateData, { where: { id: userId } });

      const updatedUser = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'role', 'isActive', 'lastLogin', 'updatedAt']
      });

      res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser
      });

    } catch (error) {
      console.error('Error in updateProfile:', error);
      res.status(500).json({ 
        error: 'Failed to update profile',
        details: error.message 
      });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          error: 'Current password and new password are required' 
        });
      }

      // Find user with password
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ 
          error: 'Current password is incorrect' 
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await user.update({ password: hashedNewPassword });

      res.status(200).json({
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Error in changePassword:', error);
      res.status(500).json({ 
        error: 'Failed to change password',
        details: error.message 
      });
    }
  }

  // Admin/Manager: Get all users
  async getUsers(req, res) {
    try {
      // Only managers and admins can access this
      if (!['manager', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Access denied. Manager or admin role required.' 
        });
      }

      const { role, isActive, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let whereConditions = {};
      if (role) whereConditions.role = role;
      if (isActive !== undefined) whereConditions.isActive = isActive === 'true';

      const { count, rows } = await User.findAndCountAll({
        where: whereConditions,
        attributes: ['id', 'name', 'email', 'role', 'isActive', 'lastLogin', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.status(200).json({
        users: rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total_items: count,
          total_pages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      console.error('Error in getUsers:', error);
      res.status(500).json({ 
        error: 'Failed to fetch users',
        details: error.message 
      });
    }
  }

  // Admin: Update user role or status
  async updateUser(req, res) {
    try {
      // Only admins can access this
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Access denied. Admin role required.' 
        });
      }

      const { id } = req.params;
      const { role, isActive } = req.body;

      const updateData = {};
      if (role) {
        const validRoles = ['facilitator', 'manager', 'admin'];
        if (!validRoles.includes(role)) {
          return res.status(400).json({ 
            error: 'Invalid role. Must be facilitator, manager, or admin' 
          });
        }
        updateData.role = role;
      }
      
      if (isActive !== undefined) updateData.isActive = isActive;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update(updateData);

      const updatedUser = await User.findByPk(id, {
        attributes: ['id', 'name', 'email', 'role', 'isActive', 'lastLogin', 'updatedAt']
      });

      res.status(200).json({
        message: 'User updated successfully',
        user: updatedUser
      });

    } catch (error) {
      console.error('Error in updateUser:', error);
      res.status(500).json({ 
        error: 'Failed to update user',
        details: error.message 
      });
    }
  }
}

module.exports = new AuthController();

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Course Management Platform API',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const { Student, Course } = require('./models');
    const students = await Student.findAll();
    const courses = await Course.findAll();
    
    res.json({
      students: students.length,
      courses: courses.length,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Add enrollment routes
try {
  const enrollmentRoutes = require('./routes/enrollments');
  app.use('/api/enrollments', enrollmentRoutes);
  console.log('Enrollment routes loaded successfully');
} catch (error) {
  console.error('Error loading enrollment routes:', error);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server first, then add routes
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to see the API`);
  console.log(`Test database: http://localhost:${PORT}/test-db`);
});

module.exports = app;

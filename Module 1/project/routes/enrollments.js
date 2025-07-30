const express = require('express');
const router = express.Router();

// Simple test first
router.get('/', (req, res) => {
  res.json({ message: 'Enrollment API is working' });
});

// Enroll a student in a course
router.post('/', async (req, res) => {
  try {
    const { Student, Course } = require('../models');
    const { studentId, courseId } = req.body;

    const student = await Student.findByPk(studentId);
    const course = await Course.findByPk(courseId);

    if (!student || !course) {
      return res.status(404).json({ message: 'Student or course not found' });
    }

    await student.addCourse(course);
    res.status(200).json({ message: 'Enrollment successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Enrollment failed', error: error.message });
  }
});

// Get all courses a student is enrolled in
router.get('/student/:studentId', async (req, res) => {
  try {
    const { Student, Course } = require('../models');
    const student = await Student.findByPk(req.params.studentId, {
      include: Course,
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student.Courses || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching enrollments', error: error.message });
  }
});

module.exports = router;

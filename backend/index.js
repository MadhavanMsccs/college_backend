// import express from 'express';
// import mongoose from 'mongoose';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import bcrypt from 'bcryptjs';
// import validator from 'validator';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 4000;

// // Middleware setup
// app.use(cors());
// app.use(bodyParser.json());

// // MongoDB Connection
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected successfully'))
//   .catch((error) => console.log('MongoDB connection error:', error));

// // Define Schemas and Models
// const adminSchema = new mongoose.Schema({
//   email: String,
//   password: String,
//   secretKey: String,
// });

// const teacherSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String,
//   personalId: String,
// });


// const studentSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true }, // Ensure email is unique
//   password: String,
//   rollno :String,
//   class: { type: String, required: true }, // Ensure class is required
// });

// const Student = mongoose.model('Student', studentSchema);

// const classSchema = new mongoose.Schema({
//   className: String,
//   teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
// });

// const Admin = mongoose.model('Admin', adminSchema);
// const Teacher = mongoose.model('Teacher', teacherSchema);
// const Class = mongoose.model('Class', classSchema);

// // Utility functions for password hashing and comparison
// const hashPassword = async (password) => await bcrypt.hash(password, 12);
// const comparePassword = async (candidatePassword, userPassword) => await bcrypt.compare(candidatePassword, userPassword);

// // Routes
// app.post('/api/v1/register/admin', async (req, res) => {
//   const { email, password, secretKey } = req.body;
//   const expectedSecretKey = process.env.SECRET_KEY;

//   if (secretKey !== expectedSecretKey) return res.status(403).json({ message: 'Invalid secret key' });

//   try {
//     const hashedPassword = await hashPassword(password);
//     const newAdmin = new Admin({ email, password: hashedPassword, secretKey });
//     await newAdmin.save();
//     res.status(201).json({ message: 'Admin registered successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error during registration' });
//   }
// });

// // Register Teacher Route
// app.post('/api/v1/register/teacher', async (req, res) => {
//   const { name, email, password, personalId } = req.body;
//   const expectedPersonalId = process.env.PERSONAL_ID; // Retrieve the personal ID from .env

//   // Check if the provided personalId matches the one in the .env file
//   if (personalId !== expectedPersonalId) {
//     return res.status(403).json({ message: 'Invalid personal ID' });
//   }

//   try {
//     const hashedPassword = await hashPassword(password);
//     const newTeacher = new Teacher({ name, email, password: hashedPassword, personalId });
//     await newTeacher.save();
//     res.status(201).json({ message: 'Teacher registered successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error during registration' });
//   }
// });


// // Register Student Route

// app.post('/api/v1/register/student', async (req, res) => {
//   const { name, email, password, class: studentClass } = req.body;

//   // Validate input data
//   if (!name || !email || !password || !studentClass) {
//     return res.status(400).json({ message: 'All fields are required' });
//   }
//   if (!validator.isEmail(email)) {
//     return res.status(400).json({ message: 'Invalid email format' });
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10); // Use bcrypt to hash the password
//     const newStudent = new Student({ name, email, password: hashedPassword, class: studentClass });
//     await newStudent.save();
//     res.status(201).json({ message: 'Student registered successfully' });
//   } catch (error) {
//     if (error.code === 11000) { // Duplicate key error
//       return res.status(400).json({ message: 'Email already exists' });
//     }
//     res.status(500).json({ message: `Server error during registration: ${error.message}` });
//   }
// });


// // Login Route for all user types
// app.post('/api/v1/users/signin', async (req, res) => {
//   const { email, password, userType } = req.body;

//   try {
//     let user;
//     if (userType === 'admin') {
//       user = await Admin.findOne({ email });
//     } else if (userType === 'teacher') {
//       user = await Teacher.findOne({ email });
//     } else if (userType === 'student') {
//       user = await Student.findOne({ email });
//     }

//     if (!user) {
//       return res.status(404).json({ message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} not found` });
//     }

//     const isMatch = await comparePassword(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     res.status(200).json({ message: 'Login successful', token: 'dummy-jwt-token' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error during login' });
//   }
// });

// // Get Metrics Route
// app.get('/api/v1/dashboard/metrics', async (req, res) => {
//   try {
//     const totalStudents = await Student.countDocuments();
//     const totalTeachers = await Teacher.countDocuments();
//     const totalClasses = await Class.countDocuments();
//     res.status(200).json({ totalStudents, totalTeachers, totalClasses });
//   } catch (error) {
//     res.status(500).json({ message: 'Error retrieving dashboard metrics' });
//   }
// });

// // Add Class Route
// app.post('/api/v1/class', async (req, res) => {
//   const { grade } = req.body;

//   if (!grade) {
//     return res.status(400).json({ message: 'Class name is required' });
//   }

//   try {
//     const newClass = new Class({ className: grade });
//     await newClass.save();
//     res.status(201).json(newClass);
//   } catch (error) {
//     res.status(500).json({ message: `Error adding class: ${error.message}` });
//   }
// });

// // Get All Classes Route
// app.get('/api/v1/class/getall', async (req, res) => {
//   try {
//     const classes = await Class.find();
//     res.status(200).json({ classes });
//   } catch (error) {
//     res.status(500).json({ message: `Error fetching classes: ${error.message}` });
//   }
// });

// // Delete Class Route
// app.delete('/api/v1/class/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//     const deletedClass = await Class.findByIdAndDelete(id);
//     if (!deletedClass) {
//       return res.status(404).json({ message: 'Class not found' });
//     }
//     res.status(200).json({ message: 'Class deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: `Error deleting class: ${error.message}` });
//   }
// });

// //Announcement 
// const announcementSchema = new mongoose.Schema({
//   announcement: { type: String, required: true },
//   class: { type: String, required: true }, // Add this line
//   createdAt: { type: Date, default: Date.now },
// });

// const Announcement = mongoose.model('Announcement', announcementSchema);
// // Routes
// app.post('/api/v1/announcements', async (req, res) => {
//   const { announcement, class: className } = req.body; // Destructure class from req.body

//   if (!announcement || !className) { // Check if class is provided
//     return res.status(400).json({ message: 'Announcement content and class are required' });
//   }

//   try {
//     const newAnnouncement = new Announcement({ announcement, class: className }); // Include class in the new announcement
//     await newAnnouncement.save();
//     res.status(201).json(newAnnouncement);
//   } catch (error) {
//     res.status(500).json({ message: `Error creating announcement: ${error.message}` });
//   }
// });

// app.get('/api/v1/announcements/getall', async (req, res) => {
//   try {
//     const announcements = await Announcement.find().sort({ createdAt: -1 });
//     res.status(200).json({ announcements });
//   } catch (error) {
//     res.status(500).json({ message: `Error fetching announcements: ${error.message}` });
//   }
// });

// app.delete('/api/v1/announcements/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//     const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
//     if (!deletedAnnouncement) {
//       return res.status(404).json({ message: 'Announcement not found' });
//     }
//     res.status(200).json({ message: 'Announcement deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: `Error deleting announcement: ${error.message}` });
//   }
// });


// //Assignment

// const assignmentSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   class: { type: String, required: true }, // Updated to include class
//   deadline: { type: Date, required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// const Assignment = mongoose.model('Assignment', assignmentSchema);

// app.post('/api/v1/assignments', async (req, res) => {
//   const { title, description, class: className, deadline } = req.body; // Updated variable name

//   if (!title || !description || !className || !deadline) { // Updated check
//     return res.status(400).json({ message: 'All fields are required' });
//   }

//   try {
//     const newAssignment = new Assignment({ title, description, class: className, deadline }); // Updated to use className
//     await newAssignment.save();
//     res.status(201).json({ assignment: newAssignment });
//   } catch (error) {
//     res.status(500).json({ message: `Error creating assignment: ${error.message}` });
//   }
// });

// app.get('/api/v1/assignments/getall', async (req, res) => {
//   try {
//     const assignments = await Assignment.find().sort({ createdAt: -1 });

//     // Format the deadline to only show the date
//     const formattedAssignments = assignments.map(assignment => ({
//       ...assignment._doc,
//       deadline: assignment.deadline.toISOString().split('T')[0], // Format deadline to YYYY-MM-DD
//     }));

//     // Return the formatted assignments
//     res.status(200).json({ assignments: formattedAssignments }); // Use formattedAssignments
//   } catch (error) {
//     res.status(500).json({ message: `Error fetching assignments: ${error.message}` });
//   }
// });


// app.delete('/api/v1/assignments/:id', async (req, res) => {
//   try {
//     const assignment = await Assignment.findByIdAndDelete(req.params.id);
    
//     if (!assignment) {
//       return res.status(404).json({ message: 'Assignment not found' });
//     }
    
//     res.json({ message: 'Assignment deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: `Error deleting assignment: ${error.message}` });
//   }
// });

// //Exam
// const examSchema = new mongoose.Schema({
//   className: { type: String, required: true },
//   subject: { type: String, required: true }, // Add subject field
//   marks: { type: Number, required: true },
//   examDate: { type: Date, required: true }, // Include exam date
// });

// const Exam = mongoose.model('Exam', examSchema);

// // Get all exams
// app.get('/api/v1/exam/getall', async (req, res) => {
//   try {
//     const exams = await Exam.find();
//     res.json(exams);
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching exams' });
//   }
// });

// // Add a new exam
// app.post('/api/v1/exam', async (req, res) => {
//   const { className, subject, marks, examDate } = req.body; // Destructure req.body to include subject

//   // Validate incoming data
//   if (!className || !subject || !marks || !examDate) {
//     return res.status(400).json({ error: 'All fields (className, subject, marks, examDate) are required' });
//   }

//   try {
//     const newExam = new Exam({ className, subject, marks, examDate }); // Create new exam object with subject
//     const savedExam = await newExam.save();
//     res.status(201).json(savedExam); // Respond with 201 Created status
//   } catch (error) {
//     res.status(500).json({ error: 'Error adding exam' });
//   }
// });

// // Delete an exam
// app.delete('/api/v1/exam/:id', async (req, res) => {
//   try {
//     const deletedExam = await Exam.findByIdAndDelete(req.params.id);
//     if (!deletedExam) {
//       return res.status(404).json({ error: 'Exam not found' }); // Handle case where exam ID is invalid
//     }
//     res.json({ message: 'Exam deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Error deleting exam' });
//   }
// });

// //performance
// const performanceSchema = new mongoose.Schema({
//   averageScore: Number,
//   totalStudents: Number,
// });

// const studentPerformanceSchema = new mongoose.Schema({
//   name: String,
//   email: String, // Added email field
//   registrationNumber: String, // Added registration number field
//   score: Number,
// });

// const Performance = mongoose.model('Performance', performanceSchema);
// const StudentPerformance = mongoose.model('StudentPerformance', studentPerformanceSchema);

// // Routes
// app.get('/api/v1/performance/school', async (req, res) => {
//   try {
//     const performance = await Performance.findOne();
//     res.json(performance);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching school performance data' });
//   }
// });

// app.get('/api/v1/performance/students', async (req, res) => {
//   try {
//     const students = await StudentPerformance.find();
//     res.json(students);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching student performance data' });
//   }
// });


// //attendance
// const attendanceSchema = new mongoose.Schema({
//   personId: mongoose.Schema.Types.ObjectId,
//   name: String,
//   status: String,
//   role: String, // 'student' or 'teacher'
//   date: { type: Date, default: Date.now },
// });
// const Attendance = mongoose.model('Attendance', attendanceSchema);

// // Routes
// // Get all students
// app.get('/api/v1/students/getall', async (req, res) => {
//   try {
//     const students = await Student.find({});
//     res.json({ students });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching students' });
//   }
// });

// // Update a student by ID
// app.put('/api/v1/students/update/:id', async (req, res) => {
//   const { id } = req.params;
//   const { name, registrationNumber, email, className } = req.body;

//   try {
//     const updatedStudent = await Student.findByIdAndUpdate(id, { name, registrationNumber, email, className }, { new: true });
//     res.status(200).json({ student: updatedStudent });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating student.' });
//   }
// });


// app.get('/api/v1/teachers/getall', async (req, res) => {
//   try {
//     const teachers = await Teacher.find({});
//     res.json({ teachers });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching teachers' });
//   }
// });

// app.post('/api/v1/attendance', async (req, res) => {
//   try {
//     const { attendanceData } = req.body;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Set to start of the day

//     const existingAttendance = await Attendance.findOne({ date: today });

//     if (existingAttendance) {
//       return res.status(400).json({ message: 'Attendance has already been submitted for today.' });
//     }

//     await Attendance.insertMany(attendanceData);
//     res.json({ message: 'Attendance data submitted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error submitting attendance data' });
//   }
// });

// app.get('/api/v1/attendance/stats', async (req, res) => {
//   try {
//     const attendanceRecords = await Attendance.find().populate('personId', 'name'); // Populate if you need names
//     const formattedAttendance = attendanceRecords.map(record => ({
//       id: record._id,
//       date: record.date,
//       status: record.status,
//     }));
    
//     res.json({ attendance: formattedAttendance });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching attendance stats' });
//   }
// });
// app.get('/api/v1/students/attendance', async (req, res) => {
//   try {
//     const students = await Student.find({});
//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Set to start of the day

//     const attendanceRecords = await Attendance.find({ date: today });

//     const totalStudents = students.length;
//     const presentCount = attendanceRecords.filter(record => record.status === 'Present').length;
//     const absentCount = attendanceRecords.filter(record => record.status === 'Absent').length;
//     const informedLeaveCount = attendanceRecords.filter(record => record.status === 'Informed Leave').length;

//     res.json({ students, totalStudents, presentCount, absentCount, informedLeaveCount });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching attendance data' });
//   }
// });


// //Events
// const eventSchema = new mongoose.Schema({
//   event: {
//     type: String,
//     required: true,
//   },
//   date: {
//     type: Date,
//     required: true,
//   },
// });

// const Event = mongoose.model('Event', eventSchema);

// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch((error) => console.log('MongoDB connection error:', error));

// // Routes

// // GET /api/v1/events/getall
// // Get all events
// app.get('/api/v1/events/getall', async (req, res) => {
//   try {
//     const events = await Event.find();
//     res.json({ events });
//   } catch (error) {
//     console.error('Error fetching events:', error);
//     res.status(500).json({ error: 'Server Error' });
//   }
// });

// // Add a new event
// app.post('/api/v1/events', async (req, res) => {
//   const { event, date } = req.body;
//   if (!event || !date) {
//     return res.status(400).json({ error: 'Event and date fields are required' });
//   }

//   try {
//     const newEvent = new Event({ event, date });
//     await newEvent.save();
//     res.status(201).json({ event: newEvent });
//   } catch (error) {
//     console.error('Error adding event:', error);
//     res.status(500).json({ error: 'Server Error' });
//   }
// });

// // Delete an event by ID
// app.delete('/api/v1/events/:id', async (req, res) => {
//   try {
//     const deletedEvent = await Event.findByIdAndDelete(req.params.id);
//     if (!deletedEvent) return res.status(404).json({ error: 'Event not found' });
//     res.json({ message: 'Event deleted successfully', event: deletedEvent });
//   } catch (error) {
//     console.error('Error deleting event:', error);
//     res.status(500).json({ error: 'Server Error' });
//   }
// });

// const examMarksSchema = new mongoose.Schema({
//   studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
//   className: { type: String, required: true },
//   subject: { type: String, required: true },
//   marks: { type: Number, required: true },
//   examDate: { type: Date, default: Date.now },
// });

// const ExamMarks = mongoose.model('ExamMarks', examMarksSchema);

// // Fetch students by class
// app.get('/api/v1/examMarks/students/:className', async (req, res) => {
//   try {
//     const students = await Student.find({ className: req.params.className });
//     res.json(students);
//   } catch (error) {
//     res.status(500).send('Error fetching students.');
//   }
// });

// // Provide marks to a student
// app.post('/api/v1/examMarks/provide', async (req, res) => {
//   try {
//     const { studentId, className, subject, marks } = req.body;
//     const newExamMark = new ExamMarks({ studentId, className, subject, marks });
//     await newExamMark.save();
//     res.status(201).json(newExamMark);
//   } catch (error) {
//     console.error(error); // Log the error for debugging
//     res.status(500).send('Error adding exam marks.');
//   }
// });

// // Fetch All Exam Marks for a Specific Class
// app.get('/api/v1/examMarks/:className', async (req, res) => {
//   try {
//     const examMarks = await ExamMarks.find({ className: req.params.className })
//       .populate('studentId', 'name email');
//     res.json(examMarks);
//   } catch (error) {
//     console.error(error); // Log the error for debugging
//     res.status(500).send('Error fetching exam marks.');
//   }
// });

// app.put('/api/v1/students/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, registrationNumber, email, class: className } = req.body; // Rename class to className

//     const updatedStudent = await Student.findByIdAndUpdate(id, { name, registrationNumber, email, class: className }, { new: true });
    
//     if (!updatedStudent) {
//       return res.status(404).json({ message: 'Student not found' });
//     }

//     res.json(updatedStudent);
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating student' });
//   }
// });

// const bookSchema = new mongoose.Schema({
//   title: String,
//   author: String,
//   image: String,
// });

// const Book = mongoose.model('Book', bookSchema);

// app.get('/books', async (req, res) => {
//   const books = await Book.find();
//   res.json(books);
// });

// app.post('/books', async (req, res) => {
//   const newBook = new Book(req.body);
//   await newBook.save();
//   res.json(newBook);
// });



// // Start Server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });










import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import stripePackage from 'stripe';
// import feeRoutes from './routes/feeRoutes.js';  
// import { router as paymentRoutes } from './routes/paymentRoutes.js';
// import Fee from './models/Fee.js';  // ✅ Only import here if needed

import dotenv from 'dotenv';
dotenv.config();

console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware setup
app.use(cors());
app.use(express.json()); // ✅ Ensures request body is parsed as JSON
app.use(bodyParser.json());
// app.use('/api', paymentRoutes);

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

// app.use('/api/fees', feeRoutes);
// app.use('/api/pay', paymentRoutes);
// app.use('/api/payments', paymentRoutes);

// MongoDB Connection
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected successfully'))
//   .catch((error) => console.log('MongoDB connection error:', error));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Define Schemas and Models
const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
  secretKey: String,
});

const teacherSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  personalId: String,
});

const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true }, // Ensure email is unique
  password: String,
  rollno: String,
  class: { type: String, required: true }, // Ensure class is required
});

const Student = mongoose.model('Student', studentSchema);

const classSchema = new mongoose.Schema({
  className: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
});

const Admin = mongoose.model('Admin', adminSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Class = mongoose.model('Class', classSchema);


// Utility functions for password hashing and comparison
const hashPassword = async (password) => await bcrypt.hash(password, 12);
const comparePassword = async (candidatePassword, userPassword) => await bcrypt.compare(candidatePassword, userPassword);

// Routes
app.post('/api/v1/register/admin', async (req, res) => {
  const { email, password, secretKey } = req.body;
  const expectedSecretKey = process.env.SECRET_KEY;

  if (secretKey !== expectedSecretKey) return res.status(403).json({ message: 'Invalid secret key' });

  try {
    const hashedPassword = await hashPassword(password);
    const newAdmin = new Admin({ email, password: hashedPassword, secretKey });
    await newAdmin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Register Teacher Route
app.post('/api/v1/register/teacher', async (req, res) => {
  const { name, email, password, personalId } = req.body;
  const expectedPersonalId = process.env.PERSONAL_ID; // Retrieve the personal ID from .env

  // Check if the provided personalId matches the one in the .env file
  if (personalId !== expectedPersonalId) {
    return res.status(403).json({ message: 'Invalid personal ID' });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const newTeacher = new Teacher({ name, email, password: hashedPassword, personalId });
    await newTeacher.save();
    res.status(201).json({ message: 'Teacher registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Register Student Route
app.post('/api/v1/register/student', async (req, res) => {
  const { name, email, password, class: studentClass } = req.body;

  // Validate input data
  if (!name || !email || !password || !studentClass) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Use bcrypt to hash the password
    const newStudent = new Student({ name, email, password: hashedPassword, class: studentClass });
    await newStudent.save();
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: `Server error during registration: ${error.message}` });
  }
});






// Login Route for all user types
app.post('/api/v1/users/signin', async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    let user;
    if (userType === 'admin') {
      user = await Admin.findOne({ email });
    } else if (userType === 'teacher') {
      user = await Teacher.findOne({ email });
    } else if (userType === 'student') {
      user = await Student.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} not found` });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', token: 'dummy-jwt-token' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get Metrics Route
app.get('/api/v1/dashboard/metrics', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalClasses = await Class.countDocuments();
    res.status(200).json({ totalStudents, totalTeachers, totalClasses });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving dashboard metrics' });
  }
});

// Add Class Route
app.post('/api/v1/class', async (req, res) => {
  const { grade } = req.body;

  if (!grade) {
    return res.status(400).json({ message: 'Class name is required' });
  }

  try {
    const newClass = new Class({ className: grade });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: `Error adding class: ${error.message}` });
  }
});

// Get All Classes Route
app.get('/api/v1/class/getall', async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json({ classes });
  } catch (error) {
    res.status(500).json({ message: `Error fetching classes: ${error.message}` });
  }
});

// Delete Class Route
app.delete('/api/v1/class/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedClass = await Class.findByIdAndDelete(id);
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: `Error deleting class: ${error.message}` });
  }
});

// Announcement
const announcementSchema = new mongoose.Schema({
  announcement: { type: String, required: true },
  class: { type: String, required: true }, // Add this line
  createdAt: { type: Date, default: Date.now },
});

const Announcement = mongoose.model('Announcement', announcementSchema);

// Routes
app.post('/api/v1/announcements', async (req, res) => {
  const { announcement, class: className } = req.body; // Destructure class from req.body

  if (!announcement || !className) { // Check if class is provided
    return res.status(400).json({ message: 'Announcement content and class are required' });
  }

  try {
    const newAnnouncement = new Announcement({ announcement, class: className }); // Include class in the new announcement
    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ message: `Error creating announcement: ${error.message}` });
  }
});

app.get('/api/v1/announcements/getall', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json({ announcements });
  } catch (error) {
    res.status(500).json({ message: `Error fetching announcements: ${error.message}` });
  }
});

app.delete('/api/v1/announcements/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
    if (!deletedAnnouncement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: `Error deleting announcement: ${error.message}` });
  }
});

// Assignment
const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  class: { type: String, required: true }, // Updated to include class
  deadline: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

app.post('/api/v1/assignments', async (req, res) => {
  const { title, description, class: className, deadline } = req.body; // Updated variable name

  if (!title || !description || !className || !deadline) { // Updated check
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newAssignment = new Assignment({ title, description, class: className, deadline }); // Updated to use className
    await newAssignment.save();
    res.status(201).json({ assignment: newAssignment });
  } catch (error) {
    res.status(500).json({ message: `Error creating assignment: ${error.message}` });
  }
});

app.get('/api/v1/assignments/getall', async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });

    // Format the deadline to only show the date
    const formattedAssignments = assignments.map(assignment => ({
      ...assignment._doc,
      deadline: assignment.deadline.toISOString().split('T')[0], // Format deadline to YYYY-MM-DD
    }));

    // Return the formatted assignments
    res.status(200).json({ assignments: formattedAssignments }); // Use formattedAssignments
  } catch (error) {
    res.status(500).json({ message: `Error fetching assignments: ${error.message}` });
  }
});

app.delete('/api/v1/assignments/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: `Error deleting assignment: ${error.message}` });
  }
});

// Exam
const examSchema = new mongoose.Schema({
  className: { type: String, required: true },
  subject: { type: String, required: true }, // Add subject field
  marks: { type: Number, required: true },
  examDate: { type: Date, required: true }, // Include exam date
});

const Exam = mongoose.model('Exam', examSchema);

// Get all exams
app.get('/api/v1/exam/getall', async (req, res) => {
  try {
    const exams = await Exam.find();
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching exams' });
  }
});

// Add a new exam
app.post('/api/v1/exam', async (req, res) => {
  const { className, subject, marks, examDate } = req.body; // Destructure req.body to include subject

  // Validate incoming data
  if (!className || !subject || !marks || !examDate) {
    return res.status(400).json({ error: 'All fields (className, subject, marks, examDate) are required' });
  }

  try {
    const newExam = new Exam({ className, subject, marks, examDate }); // Create new exam object with subject
    const savedExam = await newExam.save();
    res.status(201).json(savedExam); // Respond with 201 Created status
  } catch (error) {
    res.status(500).json({ error: 'Error adding exam' });
  }
});

// Delete an exam
app.delete('/api/v1/exam/:id', async (req, res) => {
  try {
    const deletedExam = await Exam.findByIdAndDelete(req.params.id);
    if (!deletedExam) {
      return res.status(404).json({ error: 'Exam not found' }); // Handle case where exam ID is invalid
    }
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting exam' });
  }
});

// Performance
const performanceSchema = new mongoose.Schema({
  averageScore: Number,
  totalStudents: Number,
});

const studentPerformanceSchema = new mongoose.Schema({
  name: String,
  email: String, // Added email field
  registrationNumber: String, // Added registration number field
  score: Number,
});

const Performance = mongoose.model('Performance', performanceSchema);
const StudentPerformance = mongoose.model('StudentPerformance', studentPerformanceSchema);

// Routes
app.get('/api/v1/performance/school', async (req, res) => {
  try {
    const performance = await Performance.findOne();
    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching school performance data' });
  }
});

app.get('/api/v1/performance/students', async (req, res) => {
  try {
    const students = await StudentPerformance.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student performance data' });
  }
});

// Attendance
const attendanceSchema = new mongoose.Schema({
  personId: mongoose.Schema.Types.ObjectId,
  name: String,
  status: String,
  role: String, // 'student' or 'teacher'
  date: { type: Date, default: Date.now },
});
const Attendance = mongoose.model('Attendance', attendanceSchema);

// Routes
// Get all students
app.get('/api/v1/students/getall', async (req, res) => {
  try {
    const students = await Student.find({});
    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// Update a student by ID
app.put('/api/v1/students/update/:id', async (req, res) => {
  const { id } = req.params;
  const { name, registrationNumber, email, className } = req.body;

  try {
    const updatedStudent = await Student.findByIdAndUpdate(id, { name, registrationNumber, email, class: className }, { new: true });
    res.status(200).json({ student: updatedStudent });
  } catch (error) {
    res.status(500).json({ message: 'Error updating student.' });
  }
});

app.get('/api/v1/teachers/getall', async (req, res) => {
  try {
    const teachers = await Teacher.find({});
    res.json({ teachers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers' });
  }
});

// Attendance Routes
app.post('/api/v1/attendance', async (req, res) => {
  try {
    const { attendanceData } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of the day

    const existingAttendance = await Attendance.findOne({ date: today });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance has already been submitted for today.' });
    }

    await Attendance.insertMany(attendanceData);
    res.json({ message: 'Attendance data submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting attendance data' });
  }
});

app.get('/api/v1/attendance/stats', async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find().populate('personId', 'name'); // Populate if you need names
    const formattedAttendance = attendanceRecords.map(record => ({
      id: record._id,
      date: record.date,
      status: record.status,
    }));
    
    res.json({ attendance: formattedAttendance });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance stats' });
  }
});

app.get('/api/v1/students/attendance', async (req, res) => {
  try {
    const students = await Student.find({});
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of the day

    const attendanceRecords = await Attendance.find({ date: today });

    const totalStudents = students.length;
    const presentCount = attendanceRecords.filter(record => record.status === 'Present').length;
    const absentCount = attendanceRecords.filter(record => record.status === 'Absent').length;
    const informedLeaveCount = attendanceRecords.filter(record => record.status === 'Informed Leave').length;

    res.json({ students, totalStudents, presentCount, absentCount, informedLeaveCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance data' });
  }
});

// Events
const eventSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const Event = mongoose.model('Event', eventSchema);

// Routes

// GET /api/v1/events/getall
// Get all events
app.get('/api/v1/events/getall', async (req, res) => {
  try {
    const events = await Event.find();
    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Add a new event
app.post('/api/v1/events', async (req, res) => {
  const { event, date } = req.body;
  if (!event || !date) {
    return res.status(400).json({ error: 'Event and date fields are required' });
  }

  try {
    const newEvent = new Event({ event, date });
    await newEvent.save();
    res.status(201).json({ event: newEvent });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Delete an event by ID
app.delete('/api/v1/events/:id', async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted successfully', event: deletedEvent });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Exam Marks Schema
const examMarksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  className: { type: String, required: true },
  subject: { type: String, required: true },
  marks: { type: Number, required: true },
  examDate: { type: Date, default: Date.now },
});

const ExamMarks = mongoose.model('ExamMarks', examMarksSchema);

// Fetch students by class
app.get('/api/v1/examMarks/students/:className', async (req, res) => {
  try {
    const students = await Student.find({ class: req.params.className });
    res.json(students);
  } catch (error) {
    res.status(500).send('Error fetching students.');
  }
});

// Provide marks to a student
app.post('/api/v1/examMarks/provide', async (req, res) => {
  try {
    const { studentId, className, subject, marks } = req.body;
    const newExamMark = new ExamMarks({ studentId, className, subject, marks });
    await newExamMark.save();
    res.status(201).json(newExamMark);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send('Error adding exam marks.');
  }
});

// Fetch All Exam Marks for a Specific Class
app.get('/api/v1/examMarks/:className', async (req, res) => {
  try {
    const examMarks = await ExamMarks.find({ className: req.params.className })
      .populate('studentId', 'name email');
    res.json(examMarks);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send('Error fetching exam marks.');
  }
});

// Book Schema
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  image: String,
});

const Book = mongoose.model('Book', bookSchema);

app.get('/books', async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

app.post('/books', async (req, res) => {
  const newBook = new Book(req.body);
  await newBook.save();
  res.json(newBook);
});

// Fee Routes
// Get all fee records
// app.get('/api/fees', async (req, res) => {
//   const fees = await Fee.find().populate( 'name email');
//   res.json(fees);
// });

// app.post('/api/pay', async (req, res) => {
//   const { studentId, name, amount, token } = req.body;
//   console.log('Payment Request Body:', req.body);

//   // Validate incoming data
//   if (!studentId || !name || !amount || !token) {
//       return res.status(400).json({ success: false, message: 'Missing required fields' });
//   }

//   const amountInCents = parseInt(amount);
//   console.log('Amount in cents:', amountInCents);

//   if (amountInCents > 99999999) {
//       return res.status(400).json({ success: false, message: 'Amount exceeds the maximum limit of $999,999.99' });
//   }

//   try {
//       // Create a Payment Intent
//       const paymentIntent = await stripe.paymentIntents.create({
//           amount: amountInCents,
//           currency: 'usd',
//           payment_method: token,
//           confirm: true,
//           automatic_payment_methods: {
//               enabled: true,
//               allow_redirects: 'never',  // Prevents Stripe from requiring a return_url
//           },
//       });

//       console.log('Payment Intent:', paymentIntent);

//       if (paymentIntent.status === 'succeeded') {
//           // Update fee status
//           const updatedFee = await Fee.findOneAndUpdate(
//               { studentId: studentId },
//               { status: 'Paid' },
//               { new: true }
//           );

//           if (!updatedFee) {
//               console.error(`No fee record found for studentId: ${studentId}`);
//               return res.status(404).json({ success: false, message: 'Fee record not found' });
//           }

//           console.log('Updated Fee Record:', updatedFee);
//           res.json({ success: true, message: 'Payment successful' });
//       } else {
//           console.error('Payment Intent not succeeded:', paymentIntent);
//           res.status(400).json({ success: false, message: 'Payment failed' });
//       }
//   } catch (error) {
//       console.error('Stripe Payment Error:', error);
//       res.status(500).json({ 
//           success: false, 
//           message: error.raw?.message || 'Server error' 
//       });
//   }
// });

const paymentSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model('Payment', paymentSchema);

// Pay Fees
app.post('/api/pay', async (req, res) => {
  const { studentId, name, amount, paymentMethodId } = req.body;

  if (!studentId || !name || !amount || !paymentMethodId) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // Prevents Stripe from requiring a return_url
      },
    });

    const payment = new Payment({
      studentId,
      name,
      amount,
      status: paymentIntent.status === 'succeeded' ? 'Paid' : 'Failed',
    });

    await payment.save(); // Store in DB
    console.log("✅ Payment stored in DB:", payment);

    res.status(201).json({ message: 'Payment processed', payment });
  } catch (error) {
    console.error("❌ Payment Error:", error);
    res.status(500).json({ message: `Payment processed: ${error.message}` });
  }
});

// Get All Payments
app.get('/api/payments', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json({ payments });
  } catch (error) {
    res.status(500).json({ message: `Error fetching payments: ${error.message}` });
  }
});
// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
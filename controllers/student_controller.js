const asyncHandler = require("../middleware/async");
const Student = require("../models/student_model");
const Batch = require("../models/batch_model");
const path = require("path");
const fs = require("fs");

// @desc    Create a new student
// @route   POST /api/students
// @access  Public

exports.createStudent = asyncHandler(async (req, res) => {
  const { name, phone, batch, username, password, profilePicture } = req.body;

  console.log("Creating student with name:", name);

  // Check if the batch exists
  const existingBatch = await Batch.findById(batch);
  if (!existingBatch) {
    return res.status(404).json({ message: "Batch not found" });
  }

  // Check if the username already exists
  const existingStudent = await Student.findOne({ username }).collation({
    locale: "en",
    strength: 2,
  }); // Case-insensitive check
  if (existingStudent) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Create the student
  const student = await Student.create({
    name,
    phone,
    batch,
    username,
    password, // Note: Password should be hashed in a real application
    profilePicture: profilePicture || "default-profile.png", // Default profile picture
  });

  res.status(201).json({
    success: true,
    data: student,
  });
});

// @desc    Get all students
// @route   GET /api/students
// @access  Public

exports.getAllStudents = asyncHandler(async (req, res) => {
  const students = await Student.find().populate("batch", "name");

  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  });
});

// @desc    Get a student by ID
// @route   GET /api/students/:id
// @access  Public

exports.getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate(
    "batch",
    "name"
  );

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.status(200).json({
    success: true,
    data: student,
  });
});

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Public

exports.updateStudent = asyncHandler(async (req, res) => {
  const { name, phone, batch, username, password, profilePicture } = req.body;

  const student = await Student.findById(req.params.id);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Update the student fields
  student.name = name || student.name;
  student.phone = phone || student.phone;
  student.batch = batch || student.batch;
  student.username = username || student.username;
  student.password = password || student.password; // Note: Password should be hashed in a real application
  student.profilePicture = profilePicture || student.profilePicture;

  await student.save();

  res.status(200).json({
    success: true,
    data: student,
  });
});

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Public

exports.deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Remove the student's profile picture if it exists
  if (
    student.profilePicture &&
    student.profilePicture !== "default-profile.png"
  ) {
    const profilePicturePath = path.join(
      __dirname,
      "../public/profile_pictures",
      student.profilePicture
    );
    if (fs.existsSync(profilePicturePath)) {
      fs.unlinkSync(profilePicturePath);
    }
  }

  await student.remove();

  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
  });
});

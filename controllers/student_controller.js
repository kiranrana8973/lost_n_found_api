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

// @desc    Login student
// @route   POST /api/students/login
// @access  Public

exports.loginStudent = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide a username and password" });
  }

  // Check if student exists
  const student = await Student.findOne({ username }).select("+password");

  if (!student || !(await student.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  sendTokenResponse(student, 200, res);
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

  await Student.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
  });
});

// @desc Upload Single Image
// @route POST /api/v1/auth/upload
// @access Private

exports.uploadImage = asyncHandler(async (req, res, next) => {
  // // check for the file size and send an error message
  // if (req.file.size > process.env.MAX_FILE_UPLOAD) {
  //   return res.status(400).send({
  //     message: `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
  //   });
  // }

  if (!req.file) {
    return res.status(400).send({ message: "Please upload a file" });
  }
  res.status(200).json({
    success: true,
    data: req.file.filename,
  });
});

// Get token from model , create cookie and send response
const sendTokenResponse = (Student, statusCode, res) => {
  const token = Student.getSignedJwtToken();

  const options = {
    //Cookie will expire in 30 days
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Cookie security is false .if you want https then use this code. do not use in development time
  if (process.env.NODE_ENV === "proc") {
    options.secure = true;
  }
  //we have created a cookie with a token

  res
    .status(statusCode)
    .cookie("token", token, options) // key , value ,options
    .json({
      success: true,
      token,
    });
};

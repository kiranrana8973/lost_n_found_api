const asyncHandler = require("../middleware/async");
const Batch = require("../models/batch_model");
const Student = require("../models/student_model");

// Utility for sending error responses
const sendError = (res, status, message, error = null) => {
  res.status(status).json({
    success: false,
    message,
    ...(error && { error }),
  });
};

// @desc    Add a student to a batch
// @route   POST /api/batches/students
exports.registerStudent = asyncHandler(async (req, res) => {
  const { name, phone, email, batch, username, password, profilePicture } =
    req.body;

  if (isMissingRequiredFields(name, phone, email, batch, username, password)) {
    return sendError(res, 400, "All required fields must be provided");
  }

  const newStudent = await Student.create({
    name,
    phone,
    email,
    batch,
    username,
    password,
    profilePicture,
  });

  res.status(201).json({ success: true, data: newStudent });
});

function isMissingRequiredFields(
  name,
  phone,
  email,
  batch,
  username,
  password
) {
  return !name || !phone || !email || !batch || !username || !password;
}

// @desc    Login a student
// @route   POST /api/students/login
exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return sendError(res, 400, "Please provide a username and password");
  }
  const student = await Student.findOne({ username }).select("+password");
  if (!student || !(await student.matchPassword(password))) {
    return sendError(res, 401, "Invalid credentials");
  }
  sendTokenResponse(student, 200, res);
});

// @desc    Get all students in a batch
// @route   GET /api/batches/:batchId/students
exports.getStudentByBatchId = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const students = await Student.find({ batch: batchId })
    .populate("batch", "batchName status")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: students });
});

// @desc    Update a student's details
// @route   PUT /api/batches/:batchId/students/:studentId
exports.updateStudent = asyncHandler(async (req, res) => {
  const { batchId, studentId } = req.params;
  const { name, phone, email, username, profilePicture } = req.body;
  const updatedStudent = await Student.findByIdAndUpdate(
    studentId,
    { name, phone, email, username, profilePicture, batch: batchId },
    { new: true, runValidators: true }
  );
  if (!updatedStudent) {
    return sendError(res, 404, "Student not found");
  }
  res.status(200).json({ success: true, data: updatedStudent });
});

// @desc    Remove a student from a batch
// @route   DELETE /api/batches/:batchId/students/:studentId
exports.deleteStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const removedStudent = await Student.findByIdAndDelete(studentId);
  if (!removedStudent) {
    return sendError(res, 404, "Student not found");
  }
  res.status(200).json({
    success: true,
    message: "Student removed from batch successfully",
  });
});

// @desc    Get all students
// @route   GET /api/students
exports.getAllStudents = asyncHandler(async (req, res) => {
  const students = await Student.find()
    .populate("batch", "batchName status")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: students });
});

// @desc    Get a student by ID
// @route   GET /api/students/:id
exports.getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const student = await Student.findById(id).populate(
    "batch",
    "batchName status"
  );
  if (!student) {
    return sendError(res, 404, "Student not found");
  }
  res.status(200).json({ success: true, data: student });
});

// Helper for sending JWT token in response
const sendTokenResponse = (student, statusCode, res) => {
  const token = student.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    ...(process.env.NODE_ENV === "production" && { secure: true }),
  };
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};

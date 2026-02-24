import { Request, Response, NextFunction, CookieOptions } from 'express';
import crypto from 'crypto';
import asyncHandler from '../middleware/async';
import { invalidateCache } from '../middleware/cache';
import Student, { IStudent } from '../models/student_model';
import Batch from '../models/batch_model';
import RefreshToken from '../models/refresh_token_model';
import path from 'path';
import fs from 'fs';

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const generateRefreshToken = (): string => {
  return crypto.randomBytes(40).toString('hex');
};

// @desc    Create a new student
// @route   POST /api/students
// @access  Public
export const createStudent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, username, password, batchId, phoneNumber, profilePicture } =
      req.body;

    console.log('Creating student with name:', name);

    // Check if the batch exists
    const existingBatch = await Batch.findById(batchId);
    if (!existingBatch) {
      res.status(404).json({ message: 'Batch not found' });
      return;
    }

    // Check if the email already exists
    const existingEmail = await Student.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    // Check if the username already exists
    const existingUsername = await Student.findOne({ username }).collation({
      locale: 'en',
      strength: 2,
    }); // Case-insensitive check
    if (existingUsername) {
      res.status(400).json({ message: 'Username already exists' });
      return;
    }

    // Create the student
    const student = await Student.create({
      name,
      email,
      username,
      password, // Password will be hashed automatically by the pre-save hook
      batchId,
      phoneNumber,
      profilePicture: profilePicture || 'default-profile.png',
    });

    // Remove password from response
    const studentResponse = student.toObject() as unknown as Record<string, unknown>;
    delete studentResponse.password;

    await invalidateCache('lnf:students:*');

    res.status(201).json({
      success: true,
      data: studentResponse,
    });
  }
);

// @desc    Login student
// @route   POST /api/students/login
// @access  Public
export const loginStudent = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      res
        .status(400)
        .json({ message: 'Please provide an email and password' });
      return;
    }

    // Check if student exists
    const student = await Student.findOne({ email }).select('+password');

    if (!student || !(await student.matchPassword(password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    await sendTokenResponse(student, 200, res);
  }
);

// @desc    Get all students
// @route   GET /api/students
// @access  Public
export const getAllStudents = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const students = await Student.find().populate('batchId', 'batchName');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  }
);

// @desc    Get a student by ID
// @route   GET /api/students/:id
// @access  Public
export const getStudentById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const student = await Student.findById(req.params.id).populate(
      'batchId',
      'batchName'
    );

    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  }
);

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private
export const updateStudent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, username, password, batchId, phoneNumber, profilePicture } =
      req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // Authorization check: Make sure user is updating their own profile
    if (student._id.toString() !== req.user?._id.toString()) {
      res.status(403).json({
        message: 'Not authorized to update this student profile',
      });
      return;
    }

    // Update the student fields
    student.name = name || student.name;
    student.email = email || student.email;
    student.username = username || student.username;
    student.phoneNumber = phoneNumber || student.phoneNumber;
    student.batchId = batchId || student.batchId;
    student.profilePicture = profilePicture || student.profilePicture;

    // Only update password if provided (will be hashed by pre-save hook)
    if (password) {
      student.password = password;
    }

    await student.save();

    await invalidateCache('lnf:students:*');

    res.status(200).json({
      success: true,
      data: student,
    });
  }
);

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private
export const deleteStudent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // Authorization check: Make sure user is deleting their own profile
    if (student._id.toString() !== req.user?._id.toString()) {
      res.status(403).json({
        message: 'Not authorized to delete this student profile',
      });
      return;
    }

    // Remove the student's profile picture if it exists
    if (
      student.profilePicture &&
      student.profilePicture !== 'default-profile.png'
    ) {
      const profilePicturePath = path.join(
        __dirname,
        '../public/profile_pictures',
        student.profilePicture
      );
      if (fs.existsSync(profilePicturePath)) {
        fs.unlinkSync(profilePicturePath);
      }
    }

    await Student.findByIdAndDelete(req.params.id);

    await invalidateCache('lnf:students:*');

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });
  }
);

// @desc Upload Single Image
// @route POST /api/v1/auth/upload
// @access Private
export const uploadProfilePicture = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.file) {
      res.status(400).send({ message: 'Please upload a file' });
      return;
    }

    // Check for the file size and send an error message
    const maxFileUpload = parseInt(process.env.MAX_FILE_UPLOAD || '0', 10);
    if (req.file.size > maxFileUpload) {
      res.status(400).send({
        message: `Please upload an image less than ${process.env.MAX_FILE_UPLOAD} bytes`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: req.file.filename,
    });
  }
);

// Get token from model, create cookie and send response
const sendTokenResponse = async (
  student: IStudent,
  statusCode: number,
  res: Response
): Promise<void> => {
  const accessToken = student.getSignedJwtToken();

  // Generate and store refresh token
  const rawRefreshToken = generateRefreshToken();
  const hashedRefreshToken = hashToken(rawRefreshToken);

  const refreshExpireDays = parseInt(
    process.env.REFRESH_TOKEN_EXPIRE_DAYS || '7',
    10
  );
  await RefreshToken.create({
    token: hashedRefreshToken,
    student: student._id,
    expiresAt: new Date(Date.now() + refreshExpireDays * 24 * 60 * 60 * 1000),
  });

  const cookieExpire = parseInt(process.env.JWT_COOKIE_EXPIRE || '1', 10);
  const options: CookieOptions = {
    expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Remove password from user object
  const userResponse = student.toObject() as Record<string, unknown>;
  delete userResponse.password;

  res
    .status(statusCode)
    .cookie('token', accessToken, options)
    .json({
      success: true,
      token: accessToken,
      refreshToken: rawRefreshToken,
      data: userResponse,
    });
};

// @desc    Refresh access token using refresh token
// @route   POST /api/v1/auth/refresh
// @access  Public
export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    let rawRefreshToken: string | undefined = req.body.refreshToken;

    if (
      !rawRefreshToken &&
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      rawRefreshToken = req.headers.authorization.split(' ')[1];
    }

    if (!rawRefreshToken) {
      res.status(400).json({
        success: false,
        message: 'Please provide a refresh token',
      });
      return;
    }

    // Hash and look up in DB
    const hashedToken = hashToken(rawRefreshToken);
    const storedToken = await RefreshToken.findOne({ token: hashedToken });

    if (!storedToken) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      res.status(401).json({
        success: false,
        message: 'Refresh token has expired',
      });
      return;
    }

    // Token rotation: delete old token
    await RefreshToken.deleteOne({ _id: storedToken._id });

    const student = await Student.findById(storedToken.student);
    if (!student) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Issue new access + refresh token pair
    const newAccessToken = student.getSignedJwtToken();
    const newRawRefreshToken = generateRefreshToken();
    const newHashedRefreshToken = hashToken(newRawRefreshToken);

    const refreshExpireDays = parseInt(
      process.env.REFRESH_TOKEN_EXPIRE_DAYS || '7',
      10
    );
    await RefreshToken.create({
      token: newHashedRefreshToken,
      student: student._id,
      expiresAt: new Date(
        Date.now() + refreshExpireDays * 24 * 60 * 60 * 1000
      ),
    });

    const userResponse = student.toObject() as unknown as Record<string, unknown>;
    delete userResponse.password;

    res.status(200).json({
      success: true,
      token: newAccessToken,
      refreshToken: newRawRefreshToken,
      data: userResponse,
    });
  }
);

// @desc    Logout student / invalidate refresh token
// @route   POST /api/v1/students/logout
// @access  Public
export const logoutStudent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const hashedToken = hashToken(refreshToken);
      await RefreshToken.deleteOne({ token: hashedToken });
    }

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
);

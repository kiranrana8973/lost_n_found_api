import express, { Router } from 'express';
import upload from '../middleware/uploads';
import { protect } from '../middleware/auth';
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  loginStudent,
  uploadProfilePicture,
} from '../controllers/student_controller';

const router: Router = express.Router();

router.post('/upload', upload.single('profilePicture'), uploadProfilePicture);

router.post('/', createStudent);
router.get('/', protect, getAllStudents); // Protected - prevents user enumeration
router.post('/login', loginStudent);
router.put('/:id', protect, updateStudent);
router.delete('/:id', protect, deleteStudent);
router.get('/:id', getStudentById);

export default router;

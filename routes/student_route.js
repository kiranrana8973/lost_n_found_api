const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  loginStudent,
} = require("../controllers/student_controller");

router.post("/", createStudent);
router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.post("/login", loginStudent);

module.exports = router;

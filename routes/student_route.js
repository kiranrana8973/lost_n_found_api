const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploads");
const { protect } = require("../middleware/auth");

const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  loginStudent,
  uploadProfilePicture,
} = require("../controllers/student_controller");

router.post("/upload", upload.single("profilePicture"), uploadProfilePicture);

router.post("/", createStudent);
router.get("/", getAllStudents);
router.post("/login", loginStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.get("/:id", getStudentById);

module.exports = router;

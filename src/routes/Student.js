import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import {
    getAllStudents,
    getTfStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
} from "../controllers/Student.controller.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", getAllStudents);
router.get("/:id", getTfStudentById);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;
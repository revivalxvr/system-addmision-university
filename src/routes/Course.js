import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
} from "../controllers/Course.controller.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.post("/", createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

export default router;
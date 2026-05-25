import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import {
    getAllLectures,
    getLectureById,
    createLecture,
    updateLecture,
    deleteLecture,
} from "../controllers/Lecture.controller.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", getAllLectures);
router.get("/:id", getLectureById);
router.post("/", createLecture);
router.put("/:id", updateLecture);
router.delete("/:id", deleteLecture);

export default router;
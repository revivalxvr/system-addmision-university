import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import {
  getAllMajors,
  getMajorByFacultyId,
  getMajorById,
  createMajor,
  updateMajor,
  deleteMajor,
} from "../controllers/Major.controller.js";


const router = express.Router();
router.use(verifyToken);

router.get("/", getAllMajors);
router.get("/faculties/:id", getMajorByFacultyId);
router.get("/:id", getMajorById);
router.post("/", createMajor);
router.put("/:id", updateMajor);
router.delete("/:id", deleteMajor);

export default router;

import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import {
  getClasses,
  getClassesRoom,
  createClassesRoom,
  updateClassesRoom,
  deleteClassesRoom,
} from "../controllers/Class.controller.js";

const router = express.Router();
router.use = verifyToken();

// getClasses, getClassesRoom, createClassesRoom, updateClassesRoom, deleteClassesRoom

router.get("/", getClasses);
router.get("/:id", getClassesRoom);
router.post("/", createClassesRoom);
router.put("/:id", updateClassesRoom);
router.delete("/:id", deleteClassesRoom);

export default router;

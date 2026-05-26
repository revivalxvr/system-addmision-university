import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import {
    getAllSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
} from "../controllers/Schedule.controller.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", getAllSchedules);
router.get("/:id", getScheduleById);
router.post("/", createSchedule);
router.put("/:id", updateSchedule);
router.delete("/:id", deleteSchedule);

export default router;

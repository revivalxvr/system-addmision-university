import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import {
    getAllStudyPlans,
    getStudyPlanById,
    createStudyPlan,
    updateStudyPlan,
    deleteStudyPlan,
} from "../controllers/StudyPlan.controller.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", getAllStudyPlans);
router.get("/:id", getStudyPlanById);
router.post("/", createStudyPlan);
router.put("/:id", updateStudyPlan);
router.delete("/:id", deleteStudyPlan);

export default router;
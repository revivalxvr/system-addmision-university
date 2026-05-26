import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import {
    getAllTuitionFees,
    getTuitionFeesById,
    createTuitionFees,
    updateTuitionFees,
    deleteTuitionFees,
} from "../controllers/TuitionFees.controller.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", getAllTuitionFees);
router.get("/:id", getTuitionFeesById);
router.post("/", createTuitionFees);
router.put("/:id", updateTuitionFees);
router.delete("/:id", deleteTuitionFees);

export default router;
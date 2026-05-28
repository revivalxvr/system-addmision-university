import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import {
    getAllTimeLines,
    getTimeLineById,
    createTimeLine,
    updateTimeLine,
    deleteTimeLine,
} from "../controllers/TimeLine.controller.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", getAllTimeLines);
router.get("/:id", getTimeLineById);
router.post("/", createTimeLine);
router.put("/:id", updateTimeLine);
router.delete("/:id", deleteTimeLine);

export default router;
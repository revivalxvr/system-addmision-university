import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import {
    getAllYears,
    getYearById,
    createYear,
    updateYear,
    deleteYear,
} from "../controllers/Year.controller.js";


const router = express.Router();
router.use(verifyToken);

router.get("/", getAllYears);
router.get("/:id", getYearById);
router.post("/", createYear);
router.put("/:id", updateYear);
router.delete("/:id", deleteYear);

export default router;
import express from "express";
import { adminStats } from "../controllers/adminStats.controller.js";
import { verifyToken } from "../middleware/VerifyToken.js";


const router = express.Router();
router.use(verifyToken);

router.get("/admin", adminStats);

export default router;
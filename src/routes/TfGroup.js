import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import {
    getAllTfGroups,
    getTfGroupById,
    createTfGroup,
    updateTfGroup,
    deleteTfGroup,
} from "../controllers/TfGroup.controller.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", getAllTfGroups);
router.get("/:id", getTfGroupById);
router.post("/", createTfGroup);
router.put("/:id", updateTfGroup);
router.delete("/:id", deleteTfGroup);

export default router;
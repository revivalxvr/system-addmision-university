import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} from "../controllers/User.controller.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
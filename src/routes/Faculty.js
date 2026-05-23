import express from "express";

import { verifyToken } from "../middleware/VerifyToken.js";

import { getFaculties, getFaculty, createFaculty, updateFaculty, deleteFaculty } from "../controllers/Faculty.controller.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", getFaculties);
router.get("/:id", getFaculty);
router.post("/", createFaculty);
router.put("/:id", updateFaculty);
router.delete("/:id", deleteFaculty);



export default router;

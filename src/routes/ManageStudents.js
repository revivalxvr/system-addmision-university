import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import {
    registerStudent,
    loginStudent,
    logoutStudent,

    getSecheduleById,
    getAllCourses,
    createStudyPlan,
    getStudyPlanById,
    getPaymentById,
    getStudentStats,
    updatePaymentById
} from "../controllers/ManageStudents.controller.js";

const router = express.Router();


router.post("/register", registerStudent);
router.post("/login", loginStudent);

router.use(verifyToken);
router.post("/logout", logoutStudent);
router.get("/schedule/:id", getSecheduleById);
router.get("/courses", getAllCourses);
router.post("/studyplan", createStudyPlan);
router.get("/studyplan/:id", getStudyPlanById);
router.get("/payment/:id", getPaymentById);
router.get("/stats/:id", getStudentStats);
router.put("/payment/:id", updatePaymentById);

export default router;
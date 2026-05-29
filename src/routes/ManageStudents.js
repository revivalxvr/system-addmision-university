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
    // getPaymentById,
    // getStudentStats,
    // updatePaymentById
} from "../controllers/ManageStudents.controller.js";

const router = express.Router();


router.post("/register", registerStudent);
router.post("/login", loginStudent);

router.use(verifyToken); // semua router di bawah ini membutuhkan token
router.post("/logout", logoutStudent);
router.get("/schedule", getSecheduleById); //id yg di maksud id student bkn id schedule di database
router.get("/courses", getAllCourses);
router.post("/studyplan", createStudyPlan);
router.get("/studyplan", getStudyPlanById);
// router.get("/payment/:id", getPaymentById);
// router.get("/stats/:id", getStudentStats);
// router.put("/payment/:id", updatePaymentById);

export default router;
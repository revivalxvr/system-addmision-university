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

router.use(verifyToken); // semua router di bawah ini membutuhkan token

router.get("/schedule", getSecheduleById); //id yg di maksud id student bkn id schedule di database


router.post("/logout", logoutStudent);

router.get("/courses", getAllCourses);
router.post("/studyplan", createStudyPlan);

//id yg di maksud id student bkn id schedule di database
router.get("/studyplan", getStudyPlanById);

//payment user
router.get("/payment", getPaymentById); 
router.put("/payment/:id", updatePaymentById);

//dashboard user
router.get("/stats", getStudentStats);

export default router;
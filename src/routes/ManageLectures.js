import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import {

    createLecture, //register
    loginLecture, //login
    logoutLecture, //logout

    getLectureStats, //dashboard

    getCoursesByLectureId,
    getStudentByClassId,
    updatesStudyPlanCourse,

    getScheduleByLectureId, //jadwal

    // //study plan
    getStudyPlanCourseByLectureId, //KRS
    updateStudyPlanById,
    updateStudyPlanScoreById,

     
} from "../controllers/ManageLectures.controller.js";

const router = express.Router();


router.post("/register", createLecture);
router.post("/login", loginLecture);


router.use(verifyToken);
router.put("/studyplans/score/:id", updateStudyPlanScoreById);
router.put("/studyplans/:id", updateStudyPlanById);


router.get("/studyplans", getStudyPlanCourseByLectureId);
router.get("/schedule", getScheduleByLectureId);
router.put("/courses/studyplans/:id", updatesStudyPlanCourse);
router.get("/courses/:courseId/class/:classId", getStudentByClassId);

router.get("/stats", getLectureStats);
router.get("/courses", getCoursesByLectureId);

router.post("/logout", logoutLecture);


export default router;

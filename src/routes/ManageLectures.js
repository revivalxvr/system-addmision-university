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

    // getScheduleByLectureId, //jadwal

    // //study plan
    // getStudyPlanCourseByLectureId,
    // updateStudyPlanById,
    // updateStudyPlanScoreById,

     
} from "../controllers/ManageLectures.controller.js";

const router = express.Router();


router.post("/register", createLecture);
router.post("/login", loginLecture);


router.use(verifyToken);
router.put("/courses/studyplancourse/:id", updatesStudyPlanCourse);
router.get("/courses/:courseId/class/:classId", getStudentByClassId);



router.get("/stats", getLectureStats);
router.get("/courses", getCoursesByLectureId);





// router.put("/studyplan/:id", updateStudyPlanById);
// router.put("/studyplan/score/:id", updateStudyPlanScoreById);


// router.get("/schedule", getScheduleByLectureId);
// router.get("/studyplan", getStudyPlanCourseByLectureId);

router.post("/logout", logoutLecture);


export default router;

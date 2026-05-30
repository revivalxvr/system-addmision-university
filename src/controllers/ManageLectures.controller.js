import prisma from '../config/Prisma.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieOptions from "../utils/cookieOptions.js";
import { successResponse, errorResponse } from "../utils/response.js";
import req from "express/lib/request.js";


//   createLecture, //register
//     loginLecture, //login
//     logoutLecture, //logout

//     getLectureStats, //dashboard

//     getCoursesByLectureId,
//     getStudentByClassId,
//     updatesStudyPlanCourse,

//     getScheduleByLectureId, //jadwal

//     //study plan
//     getStudyPlanCourseByLectureId,
//     updateStudyPlanById,
//     updateStudyPlanScoreById,
import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";


//     getAllCourses,

export const getAllCourses = async (req, res) => {
    try {
        //validate the role must be admin to access this route
        const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const courses = await prisma.course.findMany({
            include : {
                lecture : {
                    major : {
                        include : {
                            faculty : true
                        }
                    }
                }
            }
        });
        return successResponse(res, "berhasil mendapatkan data", courses);
    } catch (error) {
        return errorResponse(res, "terjadi kesalahan", error.message, 500);
    }
}
//     getCourseById,
//     createCourse,
//     updateCourse,
//     deleteCourse,
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
export const getCourseById = async (req, res) => {
    try {
        //validate the role must be admin to access this route
        const tokenCredential = req.user;
        if (tokenCredential.role !== "admin") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const { id } = req.params;
        const existCourse = await prisma.course.findUnique({
            where: {
                id,
            }
        })
        if (!existCourse) {
            return errorResponse(res, "data tidak ditemukan", null, 404);
        }
        const course = await prisma.course.findUnique({
            where: {
                id,
            },
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
        return successResponse(res, "berhasil mendapatkan data", course);
    } catch (error) {
        return errorResponse(res, "terjadi kesalahan", error.message, 500);
    }
}
//     createCourse,
//     updateCourse,
//     deleteCourse,
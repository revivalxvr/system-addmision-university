import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

//     getAllSchedules,
export const getAllSchedules = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const schedules = await prisma.schedule.findMany({
        include : {
            class : {
                include : {
                    major : {
                        include : {
                            faculty : true
                        }
                    }
                }
            },
            course: {
                include : {
                    lecture : true
                }
            }
        }
    });
    return successResponse(res, "berhasil mendapatkan data", schedules);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
//     getScheduleById,
//     createSchedule,
//     updateSchedule,
//     deleteSchedule,

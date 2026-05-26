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
      include: {
        class: {
          include: {
            year: true,
            major: {
              include: {
                faculty: true,
              },
            },
          },
        },
        course: {
          include: {
            lecture: true,
          },
        },
      },
    });
    return successResponse(res, "berhasil mendapatkan data", schedules);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
//     getScheduleById,
export const getScheduleById = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const schedule = await prisma.schedule.findUnique({
      where: {
        id,
      },
      include: {
        class: {
          include: {
            year: true,
            major: {
              include: {
                faculty: true,
              },
            },
          },
        },
        course: {
          include: {
            lecture: true,
          },
        },
      },
    });
    if (!schedule) {
      return errorResponse(res, "data tidak ditemukan", null, 404);
    }
    return successResponse(res, "berhasil mendapatkan data", schedule);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
//     createSchedule,
//     updateSchedule,
//     deleteSchedule,

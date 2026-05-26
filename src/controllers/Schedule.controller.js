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
      return errorResponse(res, "data tidak ditemukan di database", null, 404);
    }
    return successResponse(res, "berhasil mendapatkan data", schedule);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
//     createSchedule,
export const createSchedule = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { timeStart, timeEnd, day, classId, courseId } = req.body;
    if (!timeStart || !timeEnd || !day || !classId || !courseId) {
      return errorResponse(res, "data harus diisi", null, 400);
    }
    const schedule = await prisma.schedule.create({
      data: {
        timeStart,
        timeEnd,
        day,
        classId,
        courseId,
      },
    });
    return successResponse(res, "berhasil membuat data", schedule);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
//     updateSchedule,
export const updateSchedule = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const existing = await prisma.schedule.findUnique({
      where: {
        id,
      },
    });
    if (!existing) {
      return errorResponse(res, "data tidak ditemukan", null, 404);
    }
    const { timeStart, timeEnd, day, classId, courseId } = req.body;
    if (!timeStart || !timeEnd || !day || !classId || !courseId) {
      return errorResponse(res, "data harus diisi", null, 400);
    }
    const schedule = await prisma.schedule.update({
      where: {
        id,
      },
      data: {
        timeStart,
        timeEnd,
        day,
        classId,
        courseId,
      },
    });
    return successResponse(res, "berhasil memperbarui data", schedule);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
//     deleteSchedule,
export const deleteSchedule = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const existing = await prisma.schedule.findUnique({
      where: {
        id,
      },
    });
    if (!existing) {
      return errorResponse(res, "data tidak ditemukan di database", null, 404);
    }
    await prisma.classSchedule.deleteMany({
      where: {
        scheduleId: id,
      },
    })
    const schedule = await prisma.schedule.delete({
      where: {
        id,
      },
    });
   
    return successResponse(res, "berhasil menghapus data", schedule);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};

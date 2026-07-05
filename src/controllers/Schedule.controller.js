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
          select: {
            id: true,
            name: true,
            year: {
              select: {
                id: true,
                name: true,
              },
            },
            major: {
              select: {
                id: true,
                name: true,
                faculty: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            credits: true,
          },
        },
        lecture: {
          select: {
            id: true,
            name: true,
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
    const {
      day,
      timeStart,
      timeEnd,
      room,
      capacity,
      classId,
      courseId,
      lectureId,
    } = req.body;

    // 1. Validasi Input Dasar
    if (!day || !timeStart || !timeEnd || !room || !classId || !courseId || !lectureId) {
      return res.status(400).json({
        success: false,
        message: "Semua kolom wajib diisi!",
      });
    }

    const startIso = new Date(timeStart);
    const endIso = new Date(timeEnd);

    // 2. Validasi Bentrok Ruangan (Menggunakan Rumus Overlap yang Akurat)
    const isRoomBusy = await prisma.schedule.findFirst({
      where: {
        day: day,
        room: room,
        timeStart: { lt: endIso }, // Start kuliah di DB < End kuliah baru
        timeEnd: { gt: startIso },  // End kuliah di DB > Start kuliah baru
      },
    });

    if (isRoomBusy) {
      return res.status(400).json({
        success: false,
        message: `Gagal! Ruangan ${room} sudah digunakan untuk kuliah lain pada hari dan jam tersebut.`,
      });
    }

    // 3. Validasi Bentrok Dosen (Mencegah Dosen Memiliki 2 Kelas Bersamaan)
    const isLectureBusy = await prisma.schedule.findFirst({
      where: {
        day: day,
        lectureId: lectureId,
        timeStart: { lt: endIso },
        timeEnd: { gt: startIso },
      },
      include: {
        course: { select: { name: true } }
      }
    });

    if (isLectureBusy) {
      return res.status(400).json({
        success: false,
        message: `Gagal! Dosen tersebut sudah memiliki jadwal mengajar matkul "${isLectureBusy.course.name}" pada hari dan jam tersebut.`,
      });
    }

    // 4. Proses Simpan Data 
    const newSchedule = await prisma.schedule.create({
      data: {
        day,
        timeStart: startIso,
        timeEnd: endIso,
        room,
        capacity: capacity ? parseInt(capacity) : 35,
        class: { connect: { id: classId } },
        course: { connect: { id: courseId } },
        lecture: { connect: { id: lectureId } },
      },
      include: {
        class: { select: { name: true } },
        course: { select: { name: true, code: true } },
        lecture: { select: { name: true } },
      },
    });

    return successResponse(res, "berhasil menambahkan data", newSchedule);
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
    const {
      day,
      timeStart,
      timeEnd,
      room,
      capacity,
      classId,
      courseId,
      lectureId,
    } = req.body;

    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        day : day !== undefined ? day : existing.day,
        timeStart: timeStart !== undefined ? new Date(timeStart) : existing.timeStart,
        timeEnd: timeEnd !== undefined ? new Date(timeEnd) : existing.timeEnd,
        room: room !== undefined ? room : existing.room,
        capacity: capacity !== undefined ? parseInt(capacity) : existing.capacity,
        classId: classId !== undefined ? classId : existing.classId,
        courseId: courseId !== undefined ? courseId : existing.courseId,
        lectureId: lectureId !== undefined ? lectureId : existing.lectureId,
      }
    })
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

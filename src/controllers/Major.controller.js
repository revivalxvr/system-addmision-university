import req from "express/lib/request.js";
import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

// getAllMajors, getMajorByFacultyId, getMajorById, createMajor, updateMajor, deleteMajor

export const getAllMajors = async (req, res) => {
  try {
    //validate the role must be admin to access this route
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const majors = await prisma.major.findMany({
      include: {
        faculty: true,
      },
    });
    return successResponse(res, "Berhasil mendapatkan Data Jurusan", majors);
  } catch (error) {
    return errorResponse(
      res,
      "gagal mendapatkan data jurusan",
      error.message,
      500,
    );
  }
};

export const getMajorByFacultyId = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const majors = await prisma.major.findMany({
      where: {
        facultyId: id,
      },
      include: {
        faculty: true,
      },
    })
    if(!majors || majors.length === 0) {
      return errorResponse(res, "Jurusan tidak ditemukan", null, 404);
    }
    return successResponse(res, "Berhasil mendapatkan Data Jurusan", majors);
  } catch (error) {
    return errorResponse(
      res,
      "Gagal mendapatkan data jurusan",
      error.message,
      500,
    );
  }
};

export const getMajorById = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const major = await prisma.major.findUnique({
      where: {
        id,
      },
      include: {
        faculty: true,
      },
    })
    if (!major) {
      return errorResponse(res, "Jurusan tidak ditemukan", null, 404);
    }
    return successResponse(res, "Berhasil mendapatkan Data Jurusan", major);
  } catch (error) {
    return errorResponse(
      res,
      "Gagal mendapatkan data jurusan",
      error.message,
      500,
    );
  }
};

export const createMajor = async (req, res) => {
  try {
    //validate the role must be admin to access this route
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { name, code, facultyId } = req.body;
    const major = await prisma.major.create({
      data: {
        name,
        code,
        facultyId,
      },
    });
    return successResponse(res, "Berhasil membuat jurusan", major);
  } catch (error) {
    return errorResponse(res, "Bagal membuat jurusan", error.message, 500);
  }
};

export const updateMajor = async (req, res) => {
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
    const { name, code, facultyId } = req.body;

    //cek if existed in database by id
    const major = await prisma.major.findUnique({
      where: {
        id,
      }
    })
    if (!major) {
      return errorResponse(res, "Jurusan tidak ditemukan", null, 404);
    }
    // if not existed return error response, update  data
    const updateMajor = await prisma.major.update({
      where: {
        id,
      },
      data: {
        name,
        code,
        facultyId,
      },
    });
    return successResponse(res, "Berhasil Update jurusan", updateMajor);
  } catch (error) {
    return errorResponse(res, "Gagal Update jurusan", error.message, 500);
  }
};

export const deleteMajor = async (req, res) => {
  try {
    //validate the role must be admin to access this route
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
      //cek if existed in database by id
    const { id } = req.params;
    const major = await prisma.major.findUnique({
      where: {
        id,
      }
    })
    if (!major) {
      return errorResponse(res, "Jurusan tidak ditemukan", null, 404);
    }
    //delete data
    const deleteMajor = await prisma.major.delete({
      where: {
        id,
      },
    });
    return successResponse(res, "Berhasil menghapus jurusan", deleteMajor);
  } catch (error) {
    return errorResponse(res, "Gagal menghapus jurusan", error.message, 500);
  }
};

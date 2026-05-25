import req from "express/lib/request.js";
import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

// getAllStudents,
// getTfStudentById,
// createStudent,
// updateStudent,
// deleteStudent,

export const getAllStudents = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const students = await prisma.student.findMany({
      include: {
        class: {
          include: {
            major: {
              include: {
                faculty: true,
              },
            },
            year: true,
          },
        },
        tfGroup: true,
      },
    });
    return successResponse(
      res,
      "Berhasil mendapatkan data mahasiswa",
      students,
    );
  } catch (error) {
    return errorResponse(
      res,
      "gagal mendapatkan data mahasiswa",
      error.message,
      500,
    );
  }
};

export const getTfStudentById = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const student = await prisma.student.findUnique({
      where: {
        id,
      },
      include: {
        class: {
          include: {
            major: {
              include: {
                faculty: true,
              },
            },
            year: true,
          },
        },
        tfGroup: true,
      },
    });
    if (!student) {
      return errorResponse(res, "Mahasiswa tidak ditemukan", null, 404);
    }
    return successResponse(res, "Berhasil mendapatkan data mahasiswa", student);
  } catch (error) {
    return errorResponse(
      res,
      "gagal mendapatkan data mahasiswa",
      error.message,
      500,
    );
  }
};

export const createStudent = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { name, email, semester, classOf, tfGroupId, classId } = req.body;

    if (!name || !email || !semester || !classOf || !tfGroupId || !classId) {
      return errorResponse(res, "data mahasiswa harus diisi", null, 401);
    }

    //Generate student number Unique (Nim mahasiswa)
    let studentNumber;
    let exists = true;

    while (exists) {
      const now = new Date();
      const year = String(now.getFullYear()).slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.geDate()).padStart(2, "0");
      const random = Math.floor(100 + Math.random() * 900); // generate random number between 100 and 999 (3 digits)

      studentNumber = `${year}${month}${day}${random}`; //2605105

      const existing = await prisma.student.findUnique({
        where: {
          studentNumber,
        },
      });
      if (!existing) {
        exists = false;
      }
    }

    const student = await prisma.student.create({
      data: {
        studentNumber,
        name,
        email,
        semester: Number(semester),
        classOf: Number(classOf),
        tfGroupId,
        classId,
      },
    });
    return successResponse(res, "berhasil membuat data mahasiswa", student);
  } catch (error) {
    return errorResponse(
      res,
      "gagal membuat data mahasiswa",
      error.message,
      500,
    );
  }
};

export const updateStudent = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const { name, email, semester, classOf, tfGroupId, classId } = req.body;

    if (!name || !email || !semester || !classOf || !tfGroupId || !classId) {
      return errorResponse(res, "data mahasiswa harus diisi", null, 401);
    }

    const existing = await prisma.student.findUnique({
      where: {
        id,
      },
    });
    if (!existing) {
      return errorResponse(res, "data tidak ditemukan", null, 404);
    }

    
    await prisma.studentNumber.update({
      where: {
        studentNumber: existing.studentNumber,
      },
      data: {
        studentNumber: null,
      },
    })
    const student = await prisma.student.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        semester: Number(semester),
        classOf: Number(classOf),    
        tfGroupId,
        classId,
      },
    });
    return successResponse(res, "berhasil memperbarui data mahasiswa", student);
  } catch (error) {
    return errorResponse(
      res,
      "gagal memperbarui data mahasiswa",
      error.message,
      500,
    );
  }
};

import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieOptions from "../utils/cookieOptions.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
// registerStudent,
export const registerStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi Input
    if (!email || !password) {
      // Sesuai helper: res, message, data (null), status (400)
      return errorResponse(res, " email, password,  harus diisi", null, 400);
    }
    const emailExist = await prisma.student.findFirst({
      where: {
        email: email,
      },
    });
    if (!emailExist) {
      return errorResponse(res, "email tidak terdaftar", null, 400);
    }
    // 2. Hash password sebelum di simpan dalam database
    const hashed = await bcrypt.hash(password, 10);

    // 3. Simpan ke database menggunakan Prisma
    const user = await prisma.student.update({
      where: {
        id: emailExist.id,
      },
      data: {
        password: hashed,
      },
    });

    return successResponse(
      res,
      "berhasil mendaftar",
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      201,
    );
  } catch (error) {
    return errorResponse(res, "gagal untuk mendaftar", error.message, 500);
  }
};

// loginStudent,
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi input kosong
    if (!email || !password) {
      return errorResponse(res, "email dan password harus diisi", null, 400);
    }

    // 2. Cari user berdasarkan email
    const match = await prisma.student.findFirst({
      where: {
        email,
      },
    });

    // Jika user tidak ditemukan
    if (!match) {
      return errorResponse(res, "email atau password salah", null, 401);
    }

    // 3. Validasi password menggunakan bcrypt
    const isValid = await bcrypt.compare(password, match.password);
    if (!isValid) {
      return errorResponse(res, "email atau password salah", null, 401);
    }

    // 4. Buat token JWT
    const token = jwt.sign({ id: match.id, role: match.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // 5. Set cookie token
    res.cookie("token", token, cookieOptions(req));

    // 6. Response Sukses
    return successResponse(res, "berhasil login", {
      id: match.id,
      name: match.name,
      email: match.email,
      role: match.role,
      token: token,
    });
  } catch (error) {
    return errorResponse(res, "gagal untuk login", error.message, 500);
  }
};
// logoutStudent
export const logoutStudent = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions(req));
    return successResponse(res, "berhasil logout");
  } catch (error) {
    return errorResponse(res, "gagal untuk logout", error.message, null, 500);
  }
};
// getSecheduleById,
export const getSecheduleById = async (req, res) => {
  try {
    const tokenCredential = req.user;

    if (tokenCredential.role !== "student") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized student",
      });
    }

    const { id } = tokenCredential;
    const schedule = await prisma.schedule.findMany({
      where: {
        class: {
          student: {
            some: { id: id },
          },
        },
      },
      include: {
        class: {
          include: {
            year: true,
            major: true,
          },
        },
        course: {
          include: {
            lecture: true,
          },
        },
      },
    });
    if (!schedule || schedule.length === 0) {
      return errorResponse(res, "data tidak ditemukan", null, 404);
    }

    const formattedSchedule = schedule.map((item) => ({
      id: item.id,
      timeStart: item.timeStart,
      timeEnd: item.timeEnd,
      day: item.day,
      classId: item.classId,
      courseId: item.courseId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,

      //tabel calss
      class: {
        id: item.class.id,
        yearId: item.class.yearId,
        majorId: item.class.majorId,
        createdAt: item.class.createdAt,
        updatedAt: item.class.updatedAt,
        year: item.class.year,
        major: {
          id: item.class.major.id,
          name: item.class.major.name,
          code: item.class.major.code,
          createdAt: item.class.major.createdAt,
          updatedAt: item.class.major.updatedAt,
        },
      },
      course: {
        id: item.course.id,
        name: item.course.name,
        code: item.course.code,
        lectureId: item.course.lectureId,
        lectureName: item.course.lecture?.name || null,
        lectureNumber: item.course.lecture?.lectureNumber || null,
        credits: item.course.credits,
        createdAt: item.course.createdAt,
        updatedAt: item.course.updatedAt,
        updatedAt: item.course.updatedAt,
      },
    }));
    return successResponse(
      res,
      "berhasil mendapatkan data",
      formattedSchedule,
      200,
    );
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
// getAllCourses,
export const getAllCourses = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "student") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized student",
      });
    }
    const student = await prisma.student.findUnique({
      where: {
        id: tokenCredential.id,
      },
      include: {
        class: {
          include: {
            year: true,
          },
        },
      },
    });
    if (!student) {
      return errorResponse(res, "data tidak ditemukan", null, 404);
    }
    const courses = await prisma.course.findMany({
      include: {
        lecture: {
          include: {
            major: {
              include: {
                faculty: true,
              },
            },
          },
        },
      },
    });

    const formattedData = courses.map((c) => ({
      studentId: student.id,
      studentName: student.name,
      studentNumber: student.studentNumber,
      year: student.class?.year?.name || null,
      course: {
        id: c.id,
        name: c.name,
        code: c.code,
        credits: c.credits,
        lectureId: c.lectureId,
        lectureName: c.lecture.name,
        majorName: c.lecture.major.name,
        facultyName: c.lecture.major.faculty.name,
      },
    }));

    return successResponse(
      res,
      "berhasil mendapatkan data",
      formattedData,
      200,
    );
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
// createStudyPlan,
export const createStudyPlan = async (req, res) => {
  try {
    const tokenCredential = req.user;
    const { id } = tokenCredential;
    if (tokenCredential.role !== "student") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized student",
      });
    }

    const { courseId, ...rest } = req.body;

    const courseIds = courseId
      ? courseId
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id !== "")
      : [];
    if (courseIds.length === 0) {
      return errorResponse(res, "data harus diisi", null, 400);
    }
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat study plan (Gunakan 'tx', bukan 'prisma')
      const studyPlan = await tx.studyPlan.create({
        data: {
          studentId: id,
          ...rest,
        },
      });

      // 2. Siapkan data study plan courses
      const studyPlanCourses = courseIds.map((id) => ({
        studyPlanId: studyPlan.id,
        courseId: id,
      }));

      // 3. Insert ke database (Gunakan 'tx', bukan 'prisma')
      await tx.studyPlanCourse.createMany({
        data: studyPlanCourses,
      });

      // Kembalikan data gabungan jika semuanya sukses
      return {
        ...studyPlan,
        courses: studyPlanCourses,
      };
    });

    return successResponse(res, "berhasil membuat study plan", result, 201);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
// getStudyPlanById,
export const getStudyPlanById = async (req, res) => {
  try {
    const tokenCredential = req.user;

    if (tokenCredential.role !== "student") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized student",
      });
    }

    const { id } = tokenCredential;
    // 1. Ambil data tunggal dari database
    const studyPlan = await prisma.studyPlan.findMany({
      where: { studentId: id },
      include: {
        student: {
          include: {
            class: {
              include: {
                year: true,
              },
            },
          },
        },
        courses: {
          include: {
            course: {
              include: {
                lecture: true,
              },
            },
          },
        },
      },
    });

    // 2. Validasi jika data tidak ditemukan
    if (!studyPlan) {
      return errorResponse(res, "study plan tidak ditemukan", null, 404);
    }

    // 3. FORMAT DATA: Langsung buat objek baru, TIDAK PERLU .map() karena bukan array
    const formattedStudyPlan = studyPlan.map((plan) => ({
      id: plan.id,
      status: plan.status,
      createdAt: plan.createdAt,
      studentNumber: plan.student.studentNumber,
      stundentId: plan.student.id,
      studentName: plan.student.name,
      semester: plan.student.semester,
      year: plan.student.class?.year?.name,
      gpa: plan.gpa,

      courses: plan.courses.map((c) => ({
        id: c.course.id,
        name: c.course?.name || null,
        code: c.course?.code || null,
        credits: c.course?.credits || null,
        score: c.score,
        lectureName: c.course.lecture.name,
        lectureNumber: c.course.lecture.lectureNumber,
      })),
    }));

    // 4. Kirim data yang sudah di-format (formattedStudyPlan)
    return successResponse(
      res,
      "berhasil mendapatkan study plan",
      formattedStudyPlan,
      200,
    );
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
// getPaymentById,
export const getPaymentById = async (req, res) => {
  try {
    const tokenCredential = req.user;

    if (tokenCredential.role !== "student") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized student",
      });
    }

    const { id } = tokenCredential;
    const payment = await prisma.payment.findUnique({
      where: {
        student: { id: id },
      },
      include: {
        student: {
          include: {
            tfGroup: true,
            class: {
              include: {
                major: {
                  include: {
                    faculty: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!payment) {
      return errorResponse(res, "data tidak ditemukan", null, 404);
    }
    return successResponse(
      res,
      "berhasil mendapatkan data pembayaran",
      payment,
    );
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
// updatePaymentById
export const updatePaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const tokenCredential = req.user;

    if (tokenCredential.role !== "student") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized student",
      });
    }

    const existing = await prisma.payment.findUnique({
        where : {
            id : id
        }
    });
    if (!existing) {
      return errorResponse(res, "data tidak ditemukan di database", null, 404);
    }
    
    const payment = await prisma.payment.update({
        where : {
            id : id
        },
        data : {
            ...(status !== undefined && {status}),
        }
    })
    return successResponse(res, "berhasil memperbarui data pembayaran", payment);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
// getStudentStats,

import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

// getAllStudyPlans,
export const getAllStudyPlans = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const studyPlans = await prisma.studyPlan.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentNumber: true,
            semester: true,
            class: {
              select: {
                year: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        courses: {
          select: {
            id: true,
            score: true,
            studyPlanId: true,
            courseId: true,
            course: {
              include: {
                lecture: {
                  select: {
                    id: true,
                    name: true,
                    lectureNumber: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const formattedStudyPlans = studyPlans.map((studyPlan) => ({
      id: studyPlan.id,
      studentId: studyPlan.studentId,
      status: studyPlan.status,
      gpa: studyPlan.gpa,
      createdAt: studyPlan.createdAt,
      updatedAt: studyPlan.updatedAt,

      // Student data (Gunakan koma, bukan titik koma)
      studentName: studyPlan.student?.name ?? null,
      studentNumber: studyPlan.student?.studentNumber ?? null,
      studentYearId: studyPlan.student?.class?.year?.id ?? null,
      studentSemester: studyPlan.student?.semester ?? null,
      studentYearName: studyPlan.student?.class?.year?.name ?? null,

      // Perbaikan Map Kedua: Harus return object juga
      courses: studyPlan.courses.map((c) => ({
        id: c.id,
        courseId: c.courseId,
        studyPlanId: c.studyPlanId,
        courseName: c.course?.name ?? null, // Gunakan opsi ? untuk jaga-jaga jika data null
        courseCode: c.course?.code ?? null,
        courseScore: c.score,
        credits: c.course?.credits ?? null,
        lectureId: c.course?.lecture?.id ?? null,
        lectureName: c.course?.lecture?.name ?? null,
        lectureNumber: c.course?.lecture?.lectureNumber ?? null,
      })), // Tutup map course
    })); // Tutup map studyPlan

    return successResponse(
      res,
      "berhasil mendapatkan semua study plans",
      formattedStudyPlans,
      200,
    );
  } catch (error) {
    console.log("=== ERROR ASLI ===", error);
    return errorResponse(res, "terjadi kesalahan", null, 500);
  }
};
// getStudyPlanById,
export const getStudyPlanById = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;
    
    // 1. Ambil data tunggal dari database
    const studyPlan = await prisma.studyPlan.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentNumber: true,
            semester: true,
            class: {
              select: {
                year: {
                  select: { //  PERBAIKAN: Tambahkan select yang kurang di sini
                    id: true,
                    name: true,
                  }
                },
              },
            },
          },
        },
        courses: {
          select: {
            id: true,
            score: true,
            studyPlanId: true,
            courseId: true,
            course: {
              include: {
                lecture: {
                  select: {
                    id: true,
                    name: true,
                    lectureNumber: true,
                  },
                },
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
    const formattedStudyPlan = {
      id: studyPlan.id,
      studentId: studyPlan.studentId,
      status: studyPlan.status,
      gpa: studyPlan.gpa,
      createdAt: studyPlan.createdAt,
      updatedAt: studyPlan.updatedAt,

      // Data Mahasiswa
      studentName: studyPlan.student?.name ?? null,
      studentNumber: studyPlan.student?.studentNumber ?? null,
      studentSemester: studyPlan.student?.semester ?? null,
      studentYearId: studyPlan.student?.class?.year?.id ?? null,
      studentYearName: studyPlan.student?.class?.year?.name ?? null,

      // Data Courses (Gunakan .map() di sini karena courses di dalam studyPlan berbentuk Array)
      courses: studyPlan.courses.map((c) => ({
        id: c.id,
        courseId: c.courseId,
        studyPlanId: c.studyPlanId,
        courseName: c.course?.name ?? null,
        courseCode: c.course?.code ?? null,
        courseScore: c.score,
        credits: c.course?.credits ?? null,
        lectureId: c.course?.lecture?.id ?? null,
        lectureName: c.course?.lecture?.name ?? null,
        lectureNumber: c.course?.lecture?.lectureNumber ?? null,
      })),
    };

    // 4. Kirim data yang sudah di-format (formattedStudyPlan)
    return successResponse(
      res,
      "berhasil mendapatkan study plan",
      formattedStudyPlan, 
      200,
    );
  } catch (error) {
    // Membantu Anda melihat log asli di terminal console backend jika ada error lain
    console.error("Error GetById: ", error.message); 
    return errorResponse(res, "gagal mendapatkan study plan by id", error.message, 500);
  }
};
// createStudyPlan,
export const createStudyPlan = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { courseId, ...rest } = req.body;
    if (!rest.status && (rest.gpa === undefined || rest.gpa === null)) {
      return errorResponse(res, "data harus diisi", null, 400);
    }

    const courseIds = courseId
      ? courseId
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id !== "")
      : [];
    if (courseIds.length === 0) {
      return errorResponse(res, "data harus diisi", null, 400);
    }

    // Bungkus proses create ke dalam Prisma $transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat study plan (Gunakan 'tx', bukan 'prisma')
      const studyPlan = await tx.studyPlan.create({
        data: {
          ...rest,
          gpa: rest.gpa ? Number(rest.gpa) : null,
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

    // Jika kode sampai di sini, artinya langkah 1 dan 3 BERHASIL SEPERTI SATU KESATUAN
    return successResponse(res, "berhasil membuat study plan", result, 200);
  } catch (error) {
    return errorResponse(res, "gagal membuat study plans", error.message, 500);
  }
};
// updateStudyPlan,
export const updateStudyPlan = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const existId = await prisma.studyPlan.findUnique({
      where: { id },
      include: { courses: true }, // cek relasi ke study plan course
    });
    if (!existId) {
      return errorResponse(res, "data tidak ditemukan di database", null, 404);
    }
    const { courseId, ...rest } = req.body;
    if (!rest.status && (res.gpa == undefined || res.gpa == null)) {
      return errorResponse(res, "data harus diisi", null, 400);
    }

    const courseIds = courseId
      ? courseId
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id !== "")
      : [];
    if (courseIds.length == 0) {
      return errorResponse(res, "data harus diisi", null, 400);
    }
    //1. update data
    const studyPlan = await prisma.studyPlan.update({
      where: { id },
      data: {
        ...rest,
      },
    });
    //2. hapus semua relasi course terlebih dahulu
    await prisma.studyPlanCourse.deleteMany({
      where: { id },
    });
    //3. baru update study plan course
    const studyPlanCourses = courseIds.map((courseId) => {
      studyPlanId: studyPlan.id;
      courseId: courseId;
    });
    await prisma.studyPlanCourse.createMany({
      data: studyPlanCourses,
    });
    return successResponse(
      res,
      "berhasil update study plan",
      {
        ...studyPlan,
        courses: studyPlanCourses,
      },
      200,
    );
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
// deleteStudyPlan,
export const deleteStudyPlan = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const existId = await prisma.studyPlan.findUnique({
      where: { id },
      include: { courses: true }, // cek relasi ke study plan course
    });
    if (!existId) {
      return errorResponse(res, "data tidak ditemukan di database", null, 404);
    }

    // 1. Hapus semua data anak di tabel studyPlanCourse terlebih dahulu
    await prisma.studyPlanCourse.deleteMany({
      where: {
        studyPlanId: id, // Hapus yang terikat dengan ID study plan ini
      },
    });
    // 2. Setelah data anak bersih, baru hapus data induknya
    await prisma.studyPlan.delete({
      where: {
        id: id,
      },
    });
    return successResponse(res, "berhasil menghapus data", { deleteId: id });
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};

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

    // 1. Ambil data dengan struktur nested select/include yang baru
    const studyPlans = await prisma.studyPlan.findMany({
      include: {
        // Mengambil data Tahun Akademik Lembar KRS
        year: {
          select: {
            id: true,
            name: true,
          }
        },
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
            // Ambil info mata kuliah langsung
            course: {
              select: {
                name: true,
                code: true,
                credits: true
              }
            },
            // Ambil info schedule beserta lecture di dalamnya (menggunakan include bertingkat)
            schedule: {
              include: {
                lecture: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            }
          },
        },
      },
    });

    // 2. Format ulang data agar rapi saat diterima Frontend
    const formattedStudyPlans = studyPlans.map((studyPlan) => ({
      id: studyPlan.id,
      studentId: studyPlan.studentId,
      status: studyPlan.status,
      gpa: studyPlan.gpa,
      createdAt: studyPlan.createdAt,
      updatedAt: studyPlan.updatedAt,

      // Data Tahun Akademik Lembar KRS
      academicYearId: studyPlan.year?.id ?? null,
      academicYearName: studyPlan.year?.name ?? null,

      // Student data
      studentName: studyPlan.student?.name ?? null,
      studentNumber: studyPlan.student?.studentNumber ?? null,
      studentYearId: studyPlan.student?.class?.year?.id ?? null,
      studentSemester: studyPlan.student?.semester ?? null,
      studentYearName: studyPlan.student?.class?.year?.name ?? null,

      // Mapping data list mata kuliah pilihan mahasiswa
      courses: studyPlan.courses.map((c) => ({
        id: c.id,
        courseId: c.courseId,
        studyPlanId: c.studyPlanId,
        courseName: c.course?.name ?? null, 
        courseCode: c.course?.code ?? null,
        courseScore: c.score,
        credits: c.course?.credits ?? null,
        
        // AMAN DARI NULL: Mengambil info jadwal & dosen jika kelak sudah di-plotting admin
        scheduleId: c.scheduleId ?? null,
        room: c.schedule?.room ?? null,
        day: c.schedule?.day ?? null,
        lectureId: c.schedule?.lecture?.id ?? null,
        lectureName: c.schedule?.lecture?.name ?? null,
      })), 
    })); 

    return successResponse(
      res,
      "berhasil mendapatkan semua study plans",
      formattedStudyPlans,
      200,
    );
  } catch (error) {
    console.log("=== ERROR ASLI ===", error);
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
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
    
    // 1. Ambil data tunggal dengan struktur include/select terbaru
    const studyPlan = await prisma.studyPlan.findUnique({
      where: { id },
      include: {
        // 🚀 Sertakan Tahun Akademik lembar KRS
        year: {
          select: {
            id: true,
            name: true,
          }
        },
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
            // Ambil info mata kuliah langsung
            course: {
              select: {
                name: true,
                code: true,
                credits: true
              }
            },
            // 🚀 Ambil info schedule beserta lecture di dalamnya
            schedule: {
              include: {
                lecture: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            }
          },
        },
      },
    });

    // 2. Validasi jika data tidak ditemukan
    if (!studyPlan) {
      return errorResponse(res, "study plan tidak ditemukan", null, 404);
    }

    // 3. FORMAT DATA: Sesuaikan objek pemetaan data tunggal
    const formattedStudyPlan = {
      id: studyPlan.id,
      studentId: studyPlan.studentId,
      status: studyPlan.status,
      gpa: studyPlan.gpa,
      createdAt: studyPlan.createdAt,
      updatedAt: studyPlan.updatedAt,

      // 🚀 Data Tahun Akademik Lembar KRS
      academicYearId: studyPlan.year?.id ?? null,
      academicYearName: studyPlan.year?.name ?? null,

      // Data Mahasiswa
      studentName: studyPlan.student?.name ?? null,
      studentNumber: studyPlan.student?.studentNumber ?? null,
      studentSemester: studyPlan.student?.semester ?? null,
      studentYearId: studyPlan.student?.class?.year?.id ?? null,
      studentYearName: studyPlan.student?.class?.year?.name ?? null,

      // Data Courses (Gunakan .map() di sini karena berbentuk Array)
      courses: studyPlan.courses.map((c) => ({
        id: c.id,
        courseId: c.courseId,
        studyPlanId: c.studyPlanId,
        courseName: c.course?.name ?? null,
        courseCode: c.course?.code ?? null,
        courseScore: c.score,
        credits: c.course?.credits ?? null,
        
        // Mengambil info jadwal & dosen lewat relasi schedule secara aman
        scheduleId: c.scheduleId ?? null,
        room: c.schedule?.room ?? null,
        day: c.schedule?.day ?? null,
        lectureId: c.schedule?.lecture?.id ?? null,
        lectureName: c.schedule?.lecture?.name ?? null,
      })),
    };

    // 4. Kirim data yang sudah di-format
    return successResponse(
      res,
      "berhasil mendapatkan study plan",
      formattedStudyPlan, 
      200,
    );
  } catch (error) {
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

    const { studentId, yearId, status, gpa, courseId } = req.body;

    if (!studentId || !yearId || !status) {
      return errorResponse(res, "studentId, yearId, dan status wajib diisi!", null, 400);
    }

    const courseIds = courseId
      ? courseId
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id !== "")
      : [];

    if (courseIds.length === 0) {
      return errorResponse(res, "Pilih minimal satu mata kuliah (courseId)!", null, 400);
    }

    //  1: Ambil data bobot SKS (credits) dari database untuk mata kuliah yang dipilih
    const selectedCourses = await prisma.course.findMany({
      where: {
        id: { in: courseIds }
      },
      select: {
        name: true,
        credits: true
      }
    });

    //  2: Hitung total SKS menggunakan fungsi reduce
    const totalCredits = selectedCourses.reduce((sum, course) => sum + (course.credits || 0), 0);

    //  3: Validasi batas maksimum 24 SKS
    if (totalCredits > 24) {
      return res.status(400).json({
        success: false,
        message: `Gagal membuat KRS! Total SKS yang dipilih (${totalCredits} SKS) melebihi batas maksimum yang diizinkan (24 SKS).`,
        detail: selectedCourses.map(c => `${c.name} (${c.credits} SKS)`)
      });
    }

    // Jika lolos validasi, jalankan proses penyimpanan ke database
    const result = await prisma.$transaction(async (tx) => {
      
      const studyPlan = await tx.studyPlan.create({
        data: {
          studentId: studentId,
          yearId: yearId,
          status: status,
          gpa: gpa ? parseInt(gpa) : null,
        },
      });

      const studyPlanCourses = courseIds.map((id) => ({
        studyPlanId: studyPlan.id,
        courseId: id, 
      }));

      await tx.studyPlanCourse.createMany({
        data: studyPlanCourses,
      });

      return {
        id: studyPlan.id,
        studentId: studyPlan.studentId,
        yearId: studyPlan.yearId,
        totalCreditsUsed: totalCredits, // Informasikan total SKS yang berhasil diambil
        status: studyPlan.status,
        courses: studyPlanCourses,
      };
    });

    return successResponse(res, `berhasil membuat KRS dengan total ${totalCredits} SKS`, result, 200);
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

    // 1. Cari data lama di database sebagai acuan fallback
    const existing = await prisma.studyPlan.findUnique({
      where: { id },
    });
    
    if (!existing) {
      return errorResponse(res, "Data study plan tidak ditemukan", null, 404);
    }

    const { studentId, yearId, status, gpa, courseId } = req.body;

    //  1: Inisialisasi variabel untuk menampung data SKS
    let totalCredits = 0;
    let courseIds = [];

    //  2: Lakukan pengecekan HANYA jika frontend mengirimkan 'courseId' baru
    if (courseId !== undefined) {
      courseIds = courseId
        ? courseId
            .split(",")
            .map((cId) => cId.trim())
            .filter((cId) => cId !== "")
        : [];

      if (courseIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Pemberian courseId baru tidak boleh kosong!"
        });
      }

      // Ambil bobot SKS dari database untuk mata kuliah baru yang dikirim
      const selectedCourses = await prisma.course.findMany({
        where: { id: { in: courseIds } },
        select: { name: true, credits: true }
      });

      // Hitung total SKS baru
      totalCredits = selectedCourses.reduce((sum, course) => sum + (course.credits || 0), 0);

      // Validasi batas maksimum 24 SKS
      if (totalCredits > 24) {
        return res.status(400).json({
          success: false,
          message: `Gagal update KRS! Total SKS baru yang Anda pilih (${totalCredits} SKS) melebihi batas maksimum 24 SKS.`,
          detail: selectedCourses.map(c => `${c.name} (${c.credits} SKS)`)
        });
      }
    }

    // 2. Jalankan Prisma atomik transaksi jika lolos validasi (atau jika tidak ada perubahan matkul)
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Update data utama StudyPlan secara parsial
      const updatedStudyPlan = await tx.studyPlan.update({
        where: { id },
        data: {
          studentId: studentId !== undefined ? studentId : existing.studentId,
          yearId: yearId !== undefined ? yearId : existing.yearId,
          status: status !== undefined ? status : existing.status,
          gpa: gpa !== undefined ? (gpa ? parseInt(gpa) : null) : existing.gpa,
        },
      });

      // B. Proses pembaruan daftar mata kuliah di tabel penghubung
      let finalCourses = [];

      if (courseId !== undefined) {
        // Hapus daftar mata kuliah lama
        await tx.studyPlanCourse.deleteMany({
          where: { studyPlanId: id },
        });

        // Format data baru
        const studyPlanCourses = courseIds.map((cId) => ({
          studyPlanId: id,
          courseId: cId,
        }));

        // Simpan massal data baru
        await tx.studyPlanCourse.createMany({
          data: studyPlanCourses,
        });

        finalCourses = studyPlanCourses;
      } else {
        // Jika tidak ada perubahan matkul, ambil data matkul lama yang saat ini ada di DB
        finalCourses = await tx.studyPlanCourse.findMany({
          where: { studyPlanId: id },
          select: { studyPlanId: true, courseId: true }
        });
      }

      return {
        ...updatedStudyPlan,
        courses: finalCourses,
      };
    });

    return successResponse(res, "berhasil update study plan secara parsial", result, 200);

  } catch (error) {
    console.error("Error Update Study Plan: ", error.message);
    return errorResponse(res, "terjadi kesalahan saat update data", error.message, 500);
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

    // 1. Cek apakah data KRS tersebut memang ada di database
    const existing = await prisma.studyPlan.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse(res, "Data study plan tidak ditemukan di database", null, 404);
    }

    // 2. Jalankan proses hapus berantai menggunakan $transaction
    await prisma.$transaction(async (tx) => {
      
      // Langkah A: Hapus semua data mata kuliah yang terikat dengan Study Plan ini
      await tx.studyPlanCourse.deleteMany({
        where: {
          studyPlanId: id,
        },
      });

      // Langkah B: Hapus data induk Lembar KRS
      await tx.studyPlan.delete({
        where: {
          id: id,
        },
      });
    });

    // 3. Kembalikan response sukses jika transaksi aman
    return successResponse(
      res,
      `Berhasil menghapus study plan dengan ID: ${id} beserta seluruh daftar mata kuliah di dalamnya`,
      null,
      200
    );

  } catch (error) {
    console.error("Error Delete Study Plan: ", error.message);
    return errorResponse(res, "Terjadi kesalahan saat menghapus data", error.message, 500);
  }
};

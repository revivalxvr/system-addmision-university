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
    const { id } = tokenCredential; // ID Student dari token login

    if (tokenCredential.role !== "student") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized student",
      });
    }

    // 1. Ambil jadwal berdasarkan mahasiswa yang terdaftar di kelas tersebut
    const schedules = await prisma.schedule.findMany({
      where: {
        class: {
          student: {
            some: { id: id },
          },
        },
      },
      include: {
        // Ambil data kelas induk, tahun ajaran, dan prodi
        class: {
          include: {
            year: true,
            major: true,
          },
        },
        // Ambil data mata kuliah secara murni
        course: true,
        // 🚀 JALUR BARU: Ambil data dosen pengajar langsung dari level Schedule
        lecture: true, 
      },
      orderBy: {
        timeStart: "asc", // Mengurutkan jadwal dari jam paling pagi
      }
    });

    if (!schedules || schedules.length === 0) {
      return errorResponse(res, "Jadwal kuliah untuk Anda tidak ditemukan", null, 404);
    }

    // 2. Petakan data (Mapping) ke dalam format JSON yang bersih untuk Frontend Anda
    const formattedSchedule = schedules.map((item) => ({
      id: item.id,
      timeStart: item.timeStart,
      timeEnd: item.timeEnd,
      day: item.day,
      room: item.room || "-",          // 🚀 TAMBAHAN: Menyertakan Ruangan Kelas
      capacity: item.capacity || 0,    // 🚀 TAMBAHAN: Menyertakan Kapasitas Kelas
      classId: item.classId,
      courseId: item.courseId,
      lectureId: item.lectureId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,

      // Objek Relasi Kelas
      class: {
        id: item.class.id,
        name: item.class.name,
        semester: item.class.semester || null,
        yearId: item.class.yearId,
        majorId: item.class.majorId,
        createdAt: item.class.createdAt,
        updatedAt: item.class.updatedAt,
        year: item.class.year ? {
          id: item.class.year.id,
          name: item.class.year.name,
        } : null,
        major: item.class.major ? {
          id: item.class.major.id,
          name: item.class.major.name,
          code: item.class.major.code,
        } : null,
      },

      // Objek Relasi Mata Kuliah & Dosen Pengajar
      course: {
        id: item.course?.id || null,
        name: item.course?.name || "-",
        code: item.course?.code || "-",
        credits: item.course?.credits || 0,
        createdAt: item.course?.createdAt,
        updatedAt: item.course?.updatedAt,
        // Tarik data dosen langsung dari relasi item.lecture (tingkat Schedule)
        lectureId: item.lectureId,
        lectureName: item.lecture?.name || null,
        lectureNumber: item.lecture?.lectureNumber || null, 
      },
    }));

    return successResponse(
      res,
      "berhasil mendapatkan data jadwal kuliah mahasiswa",
      formattedSchedule,
      200,
    );
  } catch (error) {
    console.error("Error GetStudentSchedule: ", error.message);
    return errorResponse(res, "terjadi kesalahan pada sistem", error.message, 500);
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

    // 1. Ambil data profil mahasiswa bimbingan yang sedang login
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
      return errorResponse(res, "Data mahasiswa tidak ditemukan", null, 404);
    }

    // 2. Ambil seluruh data Mata Kuliah beserta info Jadwal untuk mendapatkan relasi Dosen
    const courses = await prisma.course.findMany({
      include: {
        // 🚀 JALUR BARU: Lewati schedule untuk mendapatkan dosen pengajar, jurusan, dan fakultas
        schedule: {
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
        },
      },
    });

    // 3. FORMAT DATA: Sesuaikan pemetaan properti karena lecture berada di dalam schedule
    const formattedData = courses.map((c) => {
      // Ambil jadwal pertama yang tersedia untuk mengambil informasi dosen pengampu matkul ini
      const activeSchedule = c.schedule?.[0] || null;
      const lectureData = activeSchedule?.lecture || null;

      return {
        studentId: student.id,
        studentName: student.name,
        studentNumber: student.studentNumber,
        year: student.class?.year?.name || null,
        course: {
          id: c.id,
          name: c.name,
          code: c.code,
          credits: c.credits,
          // Mengambil info dari relasi baru yang aman dari error
          lectureId: lectureData?.id || null,
          lectureName: lectureData?.name || "Belum Ada Dosen",
          majorName: lectureData?.major?.name || "Umum",
          facultyName: lectureData?.major?.faculty?.name || "Umum",
        },
      };
    });

    return successResponse(
      res,
      "berhasil mendapatkan data seluruh mata kuliah",
      formattedData,
      200,
    );
  } catch (error) {
    console.error("Error GetAllCourses Student: ", error.message);
    return errorResponse(res, "terjadi kesalahan pada server", error.message, 500);
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

    // 1. Ambil data dengan struktur include yang telah disesuaikan
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
            // Jalur Baru: Ambil mata kuliah murni dari item KRS
            course: true,
            // Jalur Baru: Ambil jadwal terkait untuk menarik data Dosen Pengajar, Ruangan, dll.
            schedule: {
              include: {
                lecture: true, // 🚀 Dosen sekarang diambil dari tingkat Schedule (Jadwal)
              },
            },
          },
        },
      },
    });

    // 2. Validasi jika data array kosong
    if (!studyPlan || studyPlan.length === 0) {
      return errorResponse(res, "Study plan (KRS) tidak ditemukan", null, 404);
    }

    // 3. FORMAT DATA: Lakukan mapping karena prisma.studyPlan.findMany mengembalikan Array
    const formattedStudyPlan = studyPlan.map((plan) => ({
      id: plan.id,
      status: plan.status,
      gpa: plan.gpa,
      studentId: plan.student?.id || null,
      studentName: plan.student?.name || "-",
      studentNumber: plan.student?.studentNumber || "-",
      semester: plan.student?.semester || null,
      year: plan.student?.class?.year?.name || "-",
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,

      // Format daftar matkul pilihan di dalam lembar KRS
      courses: plan.courses.map((c) => ({
        id: c.id, // ID dari StudyPlanCourse
        courseId: c.course?.id || null,
        name: c.course?.name || "-",
        code: c.course?.code || "-",
        credits: c.course?.credits || 0,
        score: c.score, // Nilai huruf/angka mahasiswa untuk matkul ini
        
        // 🚀 Tarik data dosen aman via relasi schedule (Jadwal pelaksanaan kuliah)
        lectureId: c.schedule?.lectureId || null,
        lectureName: c.schedule?.lecture?.name || "Belum Diplot Dosen",
        lectureNumber: c.schedule?.lecture?.lectureNumber || null,
        
        // Bonus info untuk mempermudah KRS Mahasiswa di frontend
        room: c.schedule?.room || "-",
        day: c.schedule?.day || "-",
        timeStart: c.schedule?.timeStart || null,
        timeEnd: c.schedule?.timeEnd || null,
      })),
    }));

    // 4. Kirim data hasil format ke frontend
    return successResponse(
      res,
      "berhasil mendapatkan study plan mahasiswa",
      formattedStudyPlan,
      200,
    );
  } catch (error) {
    console.error("Error GetStudyPlanById student: ", error.message);
    return errorResponse(res, "terjadi kesalahan pada sistem krs", error.message, 500);
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
    const payment = await prisma.payment.findMany({
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
      where: {
        id: id,
      },
    });
    if (!existing) {
      return errorResponse(res, "data tidak ditemukan di database", null, 404);
    }

    const payment = await prisma.payment.update({
      where: {
        id: id,
      },
      data: {
        ...(status !== undefined && { status }),
      },
    });
    return successResponse(
      res,
      "berhasil memperbarui data pembayaran",
      payment,
    );
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
// getStudentStats,
export const getStudentStats = async (req, res) => {
  try {
    const tokenCredential = req.user;
    const { id } = tokenCredential;
    if (tokenCredential.role !== "student") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized student",
      });
    }
    const startOfToday = new Date();
    // 2. Reset jam, menit, detik, dan milidetik ke angka 0 (Awal Hari)
    startOfToday.setHours(0, 0, 0, 0);
    //jalankan query pararel
    const [student, studyPlans, schedules, upcomingTimeline] =
      await Promise.all([
        //1. ambil data student yang login
        prisma.student.findUnique({
          where: {
            id: id,
          },
          select: {
            id: true,
            name: true,
            email: true,
            class: {
              select: {
                id: true,
                name: true,
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
          },
        }),

        //2. ambil data study plan + courses + attendances
        prisma.studyPlanCourse.findMany({
          where: { studyPlan: { studentId: id } },
          select: {
            id: true,
            attendance1: true,
            attendance2: true,
            attendance3: true,
            attendance4: true,
            attendance5: true,
            attendance6: true,
            attendance7: true,
            attendance8: true,
            attendance9: true,
            attendance10: true,
            attendance11: true,
            attendance12: true,
            attendance13: true,
            attendance14: true,
            attendance15: true,
            attendance16: true,
            course: {
              select: {
                id: true,
                name: true,
                code: true,
                credits: true,
                lecture: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            studyPlan: {
              select: {
                status: true,
              },
            },
          },
        }),

        //3. ambil data schedule dari semua course yang di ambil student
        prisma.schedule.findMany({
          where: {
            course: {
              StudyPlans: {
                some: {
                  studyPlan: {
                    studentId: id,
                  },
                },
              },
            },
          },
          select: {
            id: true,
            timeStart: true,
            timeEnd: true,
            day: true,
            class: {
              select: {
                name: true,
              },
            },
            course: {
              select: {
                name: true,
                code: true,
                credits: true,
              },
            },
          },
        }),
        //4. ambil data timeline
        prisma.timeLine.findMany({
          where: {
            date: {
              gte: new Date(), //hanya tanggal sekarang
            },
          },
          orderBy: {
            date: "asc", //urutkan dari yang paling dekat
          },
        }),
      ]);

    //format data study plan
    const formattedData = studyPlans.map((sp) => ({
      id: sp.course.id,
      name: sp.course.name,
      code: sp.course.code,
      credits: sp.course.credits,
      lecture: sp.course.lecture?.name,
      status: sp.studyPlan.status,
    }));

    //format data schedule
    const formattedSchedule = schedules.map((s) => ({
      id: s.id,
      courseName: s.course.name,
      courseCode: s.course.code,
      courseCredits: s.course.credits,
      class: s.class.name,
      day: s.day,
      timeStart: s.timeStart,
      timeEnd: s.timeEnd,
    }));

    //format absen (gabung semua studyPlanCourse menjadi satu array)
    const allAttendances = studyPlans.flatMap((sp) => [
      sp.attendance1,
      sp.attendance2,
      sp.attendance3,
      sp.attendance4,
      sp.attendance5,
      sp.attendance6,
      sp.attendance7,
      sp.attendance8,
      sp.attendance9,
      sp.attendance10,
      sp.attendance11,
      sp.attendance12,
      sp.attendance13,
      sp.attendance14,
      sp.attendance15,
      sp.attendance16,
    ]);

    const absensiStudent = {
      jumlahHadir: allAttendances.filter((a) => a === "hadir").length,
      jumlahIzin: allAttendances.filter((a) => a === "izin").length,
      jumlahSakit: allAttendances.filter((a) => a === "sakit").length,
      jumlahAlpha: allAttendances.filter((a) => a === "alpha" || a === null)
        .length,
    };

    return successResponse(res, "berhasil mendapatkan data", {
      profile: student,
      schedules: formattedSchedule,
      studyPlans: formattedData,
      absensi: [absensiStudent],
      upcomingTimeline,
    });
  } catch (error) {
    console.log("=== ERROR ASLI ===", error);
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};

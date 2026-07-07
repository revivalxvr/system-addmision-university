import prisma from "../config/Prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieOptions from "../utils/cookieOptions.js";
import { successResponse, errorResponse } from "../utils/response.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
//   createLecture, //register
export const createLecture = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "email dan password harus diisi", null, 400);
    }
    //cek email dosen terdaftar di database
    const lecture = await prisma.lecture.findFirst({
      where: {
        email: email,
      },
    });
    if (!lecture) {
      return errorResponse(res, "email tidak terdaftar", null, 400);
    }
    if (lecture.password) {
      return errorResponse(res, "password sudah di set", null, 400);
    }
    //hash password
    const hashed = await bcrypt.hash(password, 10);
    const update = await prisma.lecture.update({
      where: {
        id: lecture.id,
      },
      data: {
        password: hashed,
      },
    });
    return successResponse(
      res,
      "berhasil mendaftar",
      {
        id: update.id,
        name: update.name,
        email: update.email,
        role: update.role,
        passwordSet: true,
      },
      201,
    );
  } catch (error) {
    console.log("=== ERROR ASLI ===", error);
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
//     loginLecture, //login
export const loginLecture = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, "email dan password harus diisi", null, 400);
    }
    const match = await prisma.lecture.findFirst({
      where: {
        email,
      },
    });
    if (!match) {
      return errorResponse(res, "email atau password salah", null, 401);
    }
    const isValid = await bcrypt.compare(password, match.password);
    if (!isValid) {
      return errorResponse(res, "email atau password salah", null, 401);
    }
    const token = jwt.sign({ id: match.id, role: match.role }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, cookieOptions);
    return successResponse(
      res,
      "berhasil login",
      {
        id: match.id,
        name: match.name,
        email: match.email,
        role: match.role,
        token: token,
      },
      200,
    );
    if (match.passwordSet) {
      return errorResponse(res, "password sudah di set", null, 400);
    }
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};

//     logoutLecture, //logout
export const logoutLecture = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions(req));
    return successResponse(res, "berhasil logout");
  } catch (error) {
    return errorResponse(res, "gagal untuk logout", error.message, null, 500);
  }
};
//     getLectureStats, //dashboard
export const getLectureStats = async (req, res) => {
  try {
    const tokenCredential = req.user;
    const { id } = tokenCredential;
    if (tokenCredential.role !== "lecture") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const [
      lecture,
      totalStudents,
      totalCredits,
      totalSchedules,
      uniqueClasses,
      schedules,
      studyPlans,
    ] = await Promise.all([
      //1. ambul data lecture
      prisma.lecture.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      }),
      //2. ambil total data student
      prisma.student.count({
        where: {
          class: {
            schedule: {
              some: {
                course: {
                  lectureId: id,
                },
              },
            },
          },
        },
      }),
      //3. ambil sks dari semua course milik lecture
      prisma.course.aggregate({
        where: {
          lectureId: id,
        },
        _sum: {
          credits: true,
        },
      }),
      //4. ambil total jadwal milik lecture
      prisma.schedule.count({
        where: {
          course: {
            lectureId: id,
          },
        },
      }),
      //5. ambil total kelas unik yang diajar oleh lecture
      prisma.schedule.findMany({
        where: {
          course: {
            lectureId: id,
          },
        },
        select: {
          classId: true,
        },
      }),
      //6. ambil jadwal milik lecture
      prisma.schedule.findMany({
        where: {
          course: {
            lectureId: id,
          },
        },
        select: {
          id: true,
          day: true,
          timeStart: true,
          timeEnd: true,
          class: {
            select: {
              id: true,
              name: true,
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
        },
      }),
      //7. ambil study plan milik lecture
      prisma.studyPlanCourse.findMany({
        where: {
          course: {
            lectureId: id,
          },
        },
        select: {
          studyPlan: {
            select: {
              status: true,
              student: {
                select: {
                  name: true,
                },
              },
            },
          },
          course: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    const upcomingTimeLine = await prisma.timeLine.findMany({
      where: {
        date: {
          gte: new Date(),
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    const totalCalsses = new Set(uniqueClasses.map((item) => item.classId));

    const formattedStudyPlans = studyPlans.map((item) => ({
      courseName: item.course.name,
      studentName: item.studyPlan.student.name,
      status: item.studyPlan.status,
    }));

    return successResponse(
      res,
      "berhasil mengambil data statistik",
      {
        profile: lecture, // Memisahkan data profil agar rapi
        totalStudents,
        totalSks: totalCredits._sum.credits || 0,
        totalSchedules,
        totalClasses: totalCalsses.size, // Ambil jumlah total kelas unik dari Set
        schedules,
        studyPlans: formattedStudyPlans,
        upcomingTimeLine,
      },
      200,
    );
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
//     getCoursesByLectureId,
export const getCoursesByLectureId = async (req, res) => {
  try {
    const tokenCredential = req.user;
    const { id } = tokenCredential; // ID Dosen dari token

    if (tokenCredential.role !== "lecture") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 1. Ambil data profil Dosen beserta Jurusan & Fakultasnya
    const lectureProfile = await prisma.lecture.findUnique({
      where: { id },
      include: {
        major: {
          include: {
            faculty: true,
          },
        },
      },
    });

    if (!lectureProfile) {
      return errorResponse(res, "Dosen tidak ditemukan", null, 404);
    }

    // 2. Ambil seluruh Jadwal yang diajar oleh Dosen ini untuk diekstrak data Mata Kuliahnya
    const schedules = await prisma.schedule.findMany({
      where: { lectureId: id },
      include: {
        course: true, // Ambil info mata kuliah
        class: true,  // Ambil info kelas (termasuk properti semester di dalamnya)
      },
    });

    // 3. FORMAT DATA: Lakukan grouping berdasarkan Mata Kuliah (Course)
    const courseGroups = {};

    schedules.forEach((s) => {
      const course = s.course;
      const kelas = s.class;

      if (!course) return; // Proteksi jika data matkul kosong

      // Jika mata kuliah belum terdaftar di objek kelompok, inisialisasi strukturnya
      if (!courseGroups[course.id]) {
        courseGroups[course.id] = {
          id: course.id,
          name: course.name,
          code: course.code || "-",
          credits: course.credits,
          classIds: new Set(),
          classes: new Set(),
        
        };
      }

      // Masukkan data kelas terkait ke dalam Set (Set otomatis menyaring data duplikat)
      if (kelas) {
        courseGroups[course.id].classIds.add(kelas.id);
        courseGroups[course.id].classes.add(kelas.name);
      }
    });

    // Konversi properti Set kembali menjadi Array biasa agar bisa dibaca oleh frontend JSON
    const formattedCourses = Object.values(courseGroups).map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      credits: c.credits,
      classId: Array.from(c.classIds),
      classes: Array.from(c.classes),

    }));

    // 4. Susun bentuk response data akhir
    const responseData = {
      id: lectureProfile.id,
      name: lectureProfile.name,
      majorId: lectureProfile.major?.id || null,
      majorName: lectureProfile.major?.name || null,
      facultyId: lectureProfile.major?.faculty?.id || null,
      facultyName: lectureProfile.major?.faculty?.name || null,
      courses: formattedCourses,
    };
    return successResponse(
      res,
      "Berhasil mengambil data mata kuliah yang diampu dosen",
      responseData,
      200,
    );
  } catch (error) {
    console.error("Error GetCoursesByLectureId: ", error.message);
    return errorResponse(res, "Terjadi kesalahan pada server", error.message, 500);
  }
};
//     getStudentByClassId,
export const getStudentByClassId = async (req, res) => {
  try {
    const tokenCredential = req.user;
    const { id: lectureId } = tokenCredential; // ID Dosen yang sedang login

    if (tokenCredential.role !== "lecture") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Hanya dosen yang memiliki akses.",
      });
    }

    const { courseId, classId } = req.params;
    if (!courseId || !classId) {
      return errorResponse(res, "courseId dan classId harus diisi", null, 400);
    }

    // 2. Ambil data mahasiswa (Disinkronkan dengan field 'studyPlan' tanpa 's')
    const students = await prisma.student.findMany({
      where: {
        classId: classId, 
        studyPlan: { // 🚀 PERBAIKAN: Ubah studyPlans -> studyPlan sesuai skema Prisma Anda
          some: {
            courses: {
              some: {
                courseId: courseId, 
                schedule: {
                  lectureId: lectureId, 
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        studentNumber: true,
        studyPlan: { // 🚀 PERBAIKAN: Ubah studyPlans -> studyPlan sesuai skema Prisma Anda
          select: {
            id: true,
            courses: {
              where: {
                courseId: courseId,
                schedule: {
                  lectureId: lectureId,
                },
              },
              select: {
                id: true,       
                score: true,    
                scheduleId: true,
              },
            },
          },
        },
      },
    });

    // 3. RAPAIKAN FORMAT DATA (Flat Formatting)
    const formattedStudents = students.map((s) => {
      // 🚀 PERBAIKAN: Sesuaikan pemanggilan variabel dari s.studyPlans -> s.studyPlan
      const matchedCourse = s.studyPlan?.[0]?.courses?.[0] || null;

      return {
        studentId: s.id,
        studentName: s.name,
        studentNumber: s.studentNumber,
        studyPlanCourseId: matchedCourse ? matchedCourse.id : null, 
        currentScore: matchedCourse ? matchedCourse.score : null,
      };
    });

    return successResponse(
      res, 
      "Berhasil mengambil daftar mahasiswa beserta lembar nilai kelas", 
      formattedStudents, 
      200
    );
  } catch (error) {
    console.error("Error GetStudentByClassId: ", error.message);
    return errorResponse(res, "Terjadi kesalahan pada server", error.message, 500);
  }
};
//     updatesStudyPlanCourse,
export const updatesStudyPlanCourse = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "lecture") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return errorResponse(res, "id course plan harus diisi", null, 400);
    }

    // do update
    const update = await prisma.studyPlanCourse.update({
      where: {
        id,
      },
      data: updateData,
    });
    return successResponse(res, "berhasil mengupdate data", update, 200);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};

//     getScheduleByLectureId, //jadwal
export const getScheduleByLectureId = async (req, res) => {
  try {
    const tokenCredential = req.user;
    const { id } = tokenCredential; // ID Dosen dari token

    if (tokenCredential.role !== "lecture") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 1. Langsung ambil data dari tabel schedule berdasarkan lectureId
    const schedules = await prisma.schedule.findMany({
      where: {
        lectureId: id,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            credits: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            major: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        timeStart: "asc", // Urutkan jadwal berdasarkan waktu mulai terawal
      },
    });

    // 2. Validasi jika dosen belum memiliki komitmen mengajar sama sekali
    if (schedules.length === 0) {
      return errorResponse(res, "Belum ada jadwal mengajar untuk dosen ini", null, 404);
    }

    // 3. FORMAT DATA: Lakukan grouping (pengelompokan) agar outputnya rapi per Mata Kuliah
    const courseGroups = {};

    schedules.forEach((s) => {
      const courseId = s.courseId;

      // Jika mata kuliah ini belum didaftarkan di objek group, buat struktur awalnya
      if (!courseGroups[courseId]) {
        courseGroups[courseId] = {
          courseId: s.course?.id || null,
          courseName: s.course?.name || "-",
          courseCode: s.course?.code || "-",
          credits: s.course?.credits || 0,
          schedules: [],
        };
      }

      // Masukkan detail jadwal kelas paralelnya ke dalam mata kuliah tersebut
      courseGroups[courseId].schedules.push({
        id: s.id,
        classId: s.classId,
        className: s.class?.name || "-",
        majorName: s.class?.major?.name || "-",
        day: s.day,
        room: s.room || "-",      // Ruangan mengajar
        capacity: s.capacity,     // Kuota kapasitas kelas
        timeStart: s.timeStart,
        timeEnd: s.timeEnd,
      });
    });

    // Mengubah objek group menjadi bentuk Array agar sesuai dengan kebutuhan frontend
    const responseData = {
      courses: Object.values(courseGroups),
    };

    return successResponse(res, "Berhasil mengambil data jadwal mengajar dosen", responseData, 200);
  } catch (error) {
    console.error("Error GetScheduleByLectureId: ", error.message);
    return errorResponse(res, "Terjadi kesalahan pada server", error.message, 500);
  }
};
//     //study plan
//     getStudyPlanCourseByLectureId,
export const getStudyPlanCourseByLectureId = async (req, res) => {
  try {
    const tokenCredential = req.user;
    const { id } = tokenCredential; // ID Dosen dari token login

    if (tokenCredential.role !== "lecture") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 1. Ambil data dengan memetakan include secara rapi (Sertakan relasi lecture di dalam schedule)
    const studyPlanCourses = await prisma.studyPlanCourse.findMany({
      where: {
        schedule: {
          lectureId: id,
        },
      },
      include: {
        course: true,
        //  Ikut sertakan tabel lecture di dalam schedule untuk mendapatkan nama dosen
        schedule: {
          include: {
            lecture: true, 
          }
        },
        studyPlan: {
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
          },
        },
      },
    });

    if (studyPlanCourses.length === 0) {
      return errorResponse(res, "tidak ada data study plan untuk dosen ini", null, 404);
    }

    const mergedData = [];
    
    // 2. Lakukan penggabungan (Grouping) berdasarkan Lembar KRS Mahasiswa
    studyPlanCourses.forEach((spc) => {
      let existingGroup = mergedData.find(
        (item) => item.studyPlan.id === spc.studyPlan.id
      );

      // Ambil nama dosen dari database, beri fallback "-" jika datanya kosong
      const lectureName = spc.schedule?.lecture?.name || "-";

      const courseData = {
        id: spc.course?.id || null,
        name: spc.course?.name || "-",
        code: spc.course?.code || "-",
        credits: spc.course?.credits || 0,
        score: spc.score, 
        room: spc.schedule?.room || "-", 
        day: spc.schedule?.day || "-",
        lectureName: lectureName, // 🚀 SEKARANG MUNCUL DI SINI: Nama dosen pengampu matkul
      };

      if (existingGroup) {
        existingGroup.courses.push(courseData);
      } else {
        mergedData.push({
          id: spc.id, 
          createdAt: spc.createdAt,
          updatedAt: spc.updatedAt,
          studyPlan: {
            id: spc.studyPlan.id,
            status: spc.studyPlan.status,
            gpa: spc.studyPlan.gpa,
            studentName: spc.studyPlan.student?.name || "-",
            studentNumber: spc.studyPlan.student?.studentNumber || "-",
            yearId: spc.studyPlan.student?.class?.year?.id || null,
            yearName: spc.studyPlan.student?.class?.year?.name || "-",
            createdAt: spc.studyPlan.createdAt,
            updatedAt: spc.studyPlan.updatedAt,
          },
          courses: [courseData],
        });
      }
    });

    return successResponse(res, "berhasil mengambil data krs mahasiswa bimbingan dosen", mergedData, 200);
  } catch (error) {
    console.error("Error GetStudyPlan Lecture: ", error.message);
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
//     updateStudyPlanById,
export const updateStudyPlanById = async (req, res) => {
  try {
    const tokenCredential = req.user;
    const { id } = req.params;
    const { status, gpa } = req.body;
    if (tokenCredential.role !== "lecture") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const existing = await prisma.studyPlan.findUnique({
      where: {
        id: id,
      },
      include: {
        student: true,
      },
    });
    if (!existing) {
      return errorResponse(res, "data study plan tidak ditemukan", null, 404);
    }
    const update = await prisma.studyPlan.update({
      where: {
        id: id,
      },
      data: {
        ...(status !== undefined && { status }),
        ...(gpa !== undefined && { gpa }),
      },
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
      },
    });
    if (update.student && update.student.password) {
      delete update.student.password;
    }
    return successResponse(res, "berhasil mengupdate data", update, 200);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
//     updateStudyPlanScoreById,
export const updateStudyPlanScoreById = async (req, res) => {
  try {
    const tokenCredential = req.user;
    const { id } = req.params; // Mengambil ID StudyPlanCourse dari URL (:id)
    const { score } = req.body; // Mengambil nilai baru dari Body (misal: 85 atau "A")

    // 1. Proteksi Hak Akses: Harus Dosen (lecture)
    if (tokenCredential.role !== "lecture") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Hanya dosen yang dapat memberikan atau mengubah nilai.",
      });
    }

    const { id: lectureId } = tokenCredential; // ID Dosen yang didapat dari token login

    // 2. Cari data item KRS mahasiswa tersebut beserta info Jadwalnya
    const existingCourseItem = await prisma.studyPlanCourse.findUnique({
      where: { id: id },
      include: {
        schedule: true, // Tarik data jadwal untuk divalidasi dosennya
        course: true    // Tarik info nama mata kuliah untuk response
      },
    });

    if (!existingCourseItem) {
      return errorResponse(res, "Data item rencana studi (KRS) mahasiswa tidak ditemukan", null, 404);
    }

    // 3. PENGAMAN UTAMA: Validasi apakah jadwal kuliah ini benar-benar diampu oleh dosen yang login?
    if (existingCourseItem.schedule?.lectureId !== lectureId) {
      return errorResponse(
        res, 
        "Unauthorized. Anda bukan dosen pengampu resmi untuk mata kuliah di kelas ini.", 
        null, 
        403
      );
    }

    // 4. Eksekusi Update: Perbarui nilai mahasiswa di database
    const updatedItem = await prisma.studyPlanCourse.update({
      where: { id: id },
      data: {
        score: Number(score), // Menyimpan nilai baru ke database
      },
    });

    // 5. Kirim data response sukses ke Postman
    return successResponse(
      res, 
      "Berhasil memperbarui nilai mata kuliah mahasiswa", 
      {
        studyPlanCourseId: updatedItem.id,
        courseName: existingCourseItem.course.name,
        updatedScore: updatedItem.score
      }, 
      200
    );
  } catch (error) {
    console.error("=== ERROR INPUT NILAI DOSEN ===", error.message);
    if (error.code === "P2003") {
      return res.status(400).json({
        code: "P2003",
        message: "Gagal memperbarui nilai karena masalah batasan database (foreign key).",
      });
    }
    return errorResponse(res, "Terjadi kesalahan pada server", error.message, 500);
  }
};

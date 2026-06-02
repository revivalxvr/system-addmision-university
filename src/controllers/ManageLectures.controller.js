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
    const { id } = tokenCredential;
    if (tokenCredential.role !== "lecture") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const lecture = await prisma.lecture.findUnique({
      where: { id },
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
        course: {
          select: {
            id: true,
            name: true,
            credits: true,
            schedule: {
              select: {
                class: {
                  select: {
                    id: true,
                    name: true,
                    student: {
                      select: {
                        semester: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!lecture) {
      return errorResponse(res, "lecture tidak ditemukan", null, 404);
    }

    //format courses
    const formattedCourses = lecture.course.map((c) => {
      const courseId = c.schedule.map((s) => s.class.id);
      const classNameList = c.schedule.map((s) => s.class.name);
      const semester = c.schedule.flatMap((s) =>
        s.class.student.map((st) => st.semester),
      );

      const uniqueClassIds = [...new Set(courseId)];
      const uniqueClassNames = [...new Set(classNameList)];
      const uniqueSemesters = [...new Set(semester)].sort((a, b) => a - b);
      return {
        id: c.id,
        name: c.name,
        credits: c.credits,
        classId: uniqueClassIds,
        classes: uniqueClassNames,
        semesters: uniqueSemesters,
      };
    });
    const responseData = {
      id: lecture.id,
      name: lecture.name,
      majorId: lecture.major?.id || null,
      majorName: lecture.major?.name || null,
      facultyId: lecture.major?.faculty?.id || null,
      faculty: lecture.major?.faculty?.name,
      courses: formattedCourses,
    };
    return successResponse(
      res,
      "berhasil mengambil data courses",
      responseData,
      200,
    );
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
  }
};
//     getStudentByClassId,
export const getStudentByClassId = async (req, res) => {
  try {
    const tokenCredential = req.user;
    if (tokenCredential.role !== "lecture") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { courseId, classId } = req.params;
    if(!courseId || !classId) {
      return errorResponse(res, "courseId dan classId harus diisi", null, 400);
    }
    
    const students = await prisma.student.findMany({
        where: {
            classId : classId,
            studyPlan : {
                some : {
                    courses: {
                        some : {
                            courseId : courseId,
                        }
                    }
                }
            }
        },
        select : {
            id : true,
            name : true,
            studentNumber : true,
            studyPlan : {
                select : {
                    id : true,
                    courses :{ 
                        where : {
                            courseId : courseId,
                        }
                    }
                }
            }
        }
    });
    
    return successResponse(res, "berhasil mengambil data", students, 200);
  } catch (error) {
    return errorResponse(res, "terjadi kesalahan", error.message, 500);
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
            where : {
                id 
            },
            data : updateData,
        });
        return successResponse(res, "berhasil mengupdate data", update, 200);
    } catch (error) {
        return errorResponse(res, "terjadi kesalahan", error.message, 500);
    }
}

//     getScheduleByLectureId, //jadwal

//     //study plan
//     getStudyPlanCourseByLectureId,
//     updateStudyPlanById,
//     updateStudyPlanScoreById,

import prisma from "../config/Prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

// adminStats
export const adminStats = async (req, res) => {
  try {
    //validate the role must be admin to access this route
    const tokenCredential = req.user;
    if (tokenCredential.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const [
      totalStudents,
      totalClasses,
      totalMajors,
      totalFaculties,

      studyPlanApproved,
      studyPlanRejected,
      studyPlanOnProcess,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.class.count(),
      prisma.major.count(),
      prisma.faculty.count(),
      prisma.studyPlan.count({ where: { status: "approved" } }),
      prisma.studyPlan.count({ where: { status: "rejected" } }),
      prisma.studyPlan.count({ where: { status: "on-process" } }),
    ]);

    //ambil semua fakultas
    const faculties = await prisma.faculty.findMany({
      select: { id: true, name: true },
    });

    // ambil semua student dengan relasi sampai fakultas
    const studentPerFaculty = await prisma.student.findMany({
      select: {
        id: true,
        class: {
          select: {
            major: {
              select: {
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
    });

    // Inisiliasasi semua fakultas dengan 0 students
    const facultyMap = new Map();
    faculties.forEach((fac) => {
      facultyMap.set(fac.id, {
        facultyId: fac.id,
        facultyName: fac.name,
        studentCount: 0,
      });
    });

    // update student per fakultas
    studentPerFaculty.forEach((student) => {
      const facObject = student.class?.major?.faculty;

      if (facObject && facObject.id) {
        const fac = facultyMap.get(facObject.id);
        if (fac) {
          fac.studentCount += 1;
        }
      }
    });
    const facultyStart = Array.from(facultyMap.values());

    //payment lewat student -> tfGroup -> amout
    const payments = await prisma.payment.findMany({
      select: {
        status: true,
        student: {
          select: {
            tfGroup: {
              select: {
                amount: true,
              },
            },
          },
        },
      },
    });

    // ambil semua studyplan dengan relasi student, course, dan lecture
    const studyPlans = await prisma.studyPlanCourse.findMany({
      select: {
        studyPlan: {
          select: {
            status: true,
            student: {
              select: {
                name: true,
                advisor :{
                  select: {
                    name: true,
                  }
                }
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
    });
    const fromatedStudyPlans = studyPlans.map((sp) => ({
      courseName: sp.course?.name ?? null,
      studentName: sp.studyPlan?.student?.name ?? null,
      lectureName: sp.studyPlan?.student?.advisor?.name ?? null,
      status: sp.studyPlan?.status ?? null,
    }));

    //hitung paid & unpaid
    let paidCount = 0;
    let unpaidCount = 0;
    let paidAmount = 0;
    let unpaidAmount = 0;
    payments.forEach((payment) => {
      const amount = payment.student?.tfGroup?.amount ?? 0;
      if (payment.status === "PAID") {
        paidCount++;
        paidAmount += amount;
      } else if (payment.status === "UNPAID") {
        unpaidCount++;
        unpaidAmount += amount;
      }
    });

    //ambil timeline yang akan datang
    const UpcomingTimeline = await prisma.timeLine.findMany({
      where: {
        date: {
          gte: new Date(), // hanya tanggal sekarang
        },
      },
      orderBy: {
        date: "asc", //urutkan paling date paling dekat
      },
    });
    return successResponse(res, "berhasil mendapatkan data statistik", {
      totalStudents,
      totalClasses,
      totalMajors,
      totalFaculties,
      studyPlan: {
        approved: studyPlanApproved,
        rejected: studyPlanRejected,
        onProcess: studyPlanOnProcess,
      },
      studentPerFaculty: facultyStart,
      payments: {
        paidCount,
        paidSum: paidAmount,
        unpaidCount,
        unpaidSum: unpaidAmount,
      },
      studyPlans: fromatedStudyPlans,
      UpcomingTimeline,
    });
  } catch (error) {
    console.log("=== ERROR ASLI ===", error);
    return errorResponse(
      res,
      "gagal untuk mendapatkan data",
      error.message,
      500,
    );
  }
};

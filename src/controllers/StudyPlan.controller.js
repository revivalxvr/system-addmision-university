import prisma from "../config/Prisma";
import { successResponse, errorResponse } from "../utils/response";

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
                  id: true,
                  name: true,
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

    const formattedStudyPlans = studyPlans.map((studyPlan) => {
      id: studyPlan.id;
      studentId: studyPlan.studentId;
      status: studyPlan.status;
      gpa: studyPlan.gpa;
      createdAt: studyPlan.createdAt;
      updatedAt: studyPlan.updatedAt;

      //student data
      studentId: studyPlan.student.id;
      studentName: studyPlan.student.name;
      studentNumber: studyPlan.student.studentNumber;
      studentYearId: studyPlan.student.class?.year?.id ?? null;
      studentSemester: studyPlan.student.semester;
      studentYearName: studyPlan.student.class?.year?.name ?? null;

      course: studyPlan.courses.map((course) => {
        id: course.id;
        courseId: course.courseId;
        studyPlanId: course.studyPlanId;
        courseName: course.course.name;
        courseCode: course.course.code;
        courseScore: course.score;
        credits: course.course.credits;
        lectureId: course.course.lecture.id ?? null;
        lectureName: course.course.lecture.name ?? null;
        lectureNumber: course.course.lecture.lectureNumber ?? null;
      });
    });
    return successResponse(
      res,
      "berhasil mendapatkan semua study plans",
      formattedStudyPlans,
      200,
    );
  } catch (error) {
    return errorResponse(res, "gagal mendapatkan semua study plans", null, 500);
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
    const studyPlan = await prisma.studyPlan.findUnique({
      where: {
        id,
      },
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
                  id: true,
                  name: true,
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
    if (!studyPlan) {
      return errorResponse(res, "study plan tidak ditemukan", null, 404);
    }

    const formattedStudyPlans = studyPlans.map((studyPlan) => {
      id: studyPlan.id;
      studentId: studyPlan.studentId;
      status: studyPlan.status;
      gpa: studyPlan.gpa;
      createdAt: studyPlan.createdAt;
      updatedAt: studyPlan.updatedAt;

      //student data
      studentId: studyPlan.student.id;
      studentName: studyPlan.student.name;
      studentNumber: studyPlan.student.studentNumber;
      studentYearId: studyPlan.student.class?.year?.id ?? null;
      studentYearName: studyPlan.student.class?.year?.name ?? null;

      course: studyPlan.courses.map((course) => {
        id: course.id;
        courseId: course.courseId;
        studyPlanId: course.studyPlanId;
        courseName: course.course.name;
        courseCode: course.course.code;
        credits: course.course.credits;
        lectureId: course.course.lecture.id ?? null;
        lectureName: course.course.lecture.name ?? null;
        lectureNumber: course.course.lecture.lectureNumber ?? null;
      });
    });
    return successResponse(res, "berhasil mendapatkan study plan", studyPlan, 200);
  } catch (error) {
    return errorResponse(res, "gagal mendapatkan semua study plans", null, 500);
  }
};
// createStudyPlan,
// updateStudyPlan,
// deleteStudyPlan,

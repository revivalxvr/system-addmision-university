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
    if (!rest.status && (res.gpa == undefined || res.gpa == null)) {
        return errorResponse(res, "data harus diisi", null, 400);
    }

    const courseIds = courseId ? courseId.split(",").map(id => id.trim()).filter(id => id !== "") : [];
    if(courseIds.length == 0){
        return errorResponse(res, "data harus diisi", null, 400);
    }

    //1. buat study plan
    const studyPlan = await prisma.studyPlan.create({
        data : {
            ...rest,
        }
    })
    //2. buat study plan course dan insert ke database
    const studyPlanCourses = courseIds.map(courseId => {
        studyPlanId: studyPlan.id;
        courseId: courseId;
    })
    await prisma.studyPlanCourse.createMany({
        data: studyPlanCourses
    })

    return successResponse(res, "berhasil membuat study plan", {
        ...studyPlan,
        courses: studyPlanCourses
    }, 200);
    } catch (error) {
        return errorResponse(res, "gagal mendapatkan semua study plans", error.message, 500);
  
    }
}
// updateStudyPlan,
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
        where : {id},
        include : {courses : true} // cek relasi ke study plan course
    })
    if(!existId) {
        return errorResponse(res, "data tidak ditemukan di database", null, 404);
    }

    //1. hapus semua relasi course terlebih dahulu
    await prisma.studyPlanCourse.deleteMany({
        where : {id}
    })
    //2. baur hapus yanga ada di table study plan
    await prisma.studyPlan.delete({
        where : {id}
    })
    return successResponse(res, "berhasil menghapus data", { deleteId : id});
    } catch (error) {
        return errorResponse(res, "terjadi kesalahan", error.message, 500);
    }
}

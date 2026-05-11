import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.models.js";
import Course from "../models/Course.models.js";
import Student from "../models/Student.models.js";
import Lesson from "../models/Lesson.models.js";
export const ensureCourseEnrollment = async (userId, courseId) => {
  if (!userId) {
    const error = new Error("Unauthorized user");
    error.statusCode = 401;
    throw error;
  }

  const course = await Course.findById(courseId);
  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  let student = await Student.findOne({ user: userId });
  if (!student) {
    student = await Student.create({ user: userId });
  }

  let enrollment = await Enrollment.findOne({
    user: userId,
    course: courseId,
  });
  const alreadyEnrolled = Boolean(enrollment);

  if (!enrollment) {
    enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      paymentStatus: "completed",
    });
  }

  await Promise.all([
    Student.findByIdAndUpdate(
      student._id,
      { $addToSet: { enrolledCourses: courseId } },
      { new: true }
    ),
    Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { enrolledStudents: userId } },
      { new: true }
    ),
  ]);

  return { enrollment, alreadyEnrolled };
};

export const enrollInCourse = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { courseId } = req.body;

    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (existingEnrollment) {
      res.status(400);
      throw new Error("You are already enrolled in this course");
    }

    const { enrollment } = await ensureCourseEnrollment(userId, courseId);
    res.status(201).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const getEnrolledCourses = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
        res.status(401);
        throw new Error("Unauthorized user");
    }
    const enrollments = await Enrollment.find({ user: userId }).populate("course", "title description price thumbnail category level lessons instructor enrolledStudents averageRating isPublished overview_video");
    const courses = enrollments.map((enrollment) => enrollment.course);
    res.status(200).json({
        success: true,
        data: courses,
    });
    } catch (error) {
    next(error);
    }
};

export const removeEnrollment = async (req, res, next) => {
  console.log("0")
  try {
    const userId = req.user?._id;
    const courseId = req.body.courseId || req.params.courseId;

    if (!userId) {
      res.status(401);
      throw new Error("Unauthorized user");
    }
    console.log("1")
    if (!mongoose.isValidObjectId(courseId)) {
      res.status(400);
      throw new Error("Invalid courseId");
    }
    console.log("2")
    
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) {
      res.status(404);
      throw new Error("Enrollment not found");
    }
    
    console.log("3")
    await Promise.all([
      Enrollment.deleteOne({ _id: enrollment._id }),
      Student.findOneAndUpdate({ user: userId }, { $pull: { enrolledCourses: courseId } }, { new: true }),
      Course.findByIdAndUpdate(courseId, { $pull: { enrolledStudents: userId } }, { new: true }),
    ]);
    
    console.log("4")
    res.status(200).json({
      success: true,
      message: "Course removed successfully",
    });
  } catch (error) {
    next(error);
  }
};


const getAllLessonsForCourse = async (req,res,next)=>{
    const {courseId} = req.params;
    try{
        const userId = req.user?._id;
        if (!mongoose.isValidObjectId(courseId)) {
            res.status(400);
            throw new Error("Invalid courseId");
        }

        if (req.user.role !== "user") {
            res.status(403);
            throw new Error("You do not have permission to view lessons for this course");
        }

        const enrollment = await Enrollment.findOne({
            user: userId,
            course: courseId,
        });

        if (!enrollment) {
            res.status(403);
            throw new Error("You are not enrolled in this course");
        }

        const course = await Course.findById(courseId);
        if (!course) {
            res.status(404);
            throw new Error("Course not found");
        }

        const lessons = await Lesson.find({ course: courseId })
            .select("title description videoUrl videoPublicId duration order resources course")
            .sort({ order: 1 });

        res.status(200).json({
            success: true,
            data: lessons
        });
    } catch(error){
        if (error.statusCode) {
            res.status(error.statusCode);
        }
        next(error);
    }
};

export { getAllLessonsForCourse };

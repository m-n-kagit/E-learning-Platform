import mongoose from "mongoose";
import Course from "../models/Course.models.js";
import Student from "../models/Student.models.js";

const getAllCourses = async (req, res, next) => {
  try {
    const rawOffset = Number(req.query.offset);
    const rawLimit = Number(req.query.limit);
    const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0;
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 12;

    const [total, courses] = await Promise.all([
      Course.countDocuments({ isPublished: true }),
      Course.find({ isPublished: true })
        .populate("instructor", "name email")
        .populate("lessons", "title order duration isPreview")
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit),
    ]);

    res.status(200).json({
      success: true,
      data: courses,
      total,
      offset,
      limit,
    });
  } catch (error) {
    next(error);
  }
};

const getCourseById = async (req, res, next) => {
  const { courseId } = req.params;

  try {
    if (!mongoose.isValidObjectId(courseId)) {
      res.status(400);
      throw new Error("Invalid courseId");
    }

    const course = await Course.findOne({ _id: courseId, isPublished: true })
      .populate("instructor", "name email")
      .populate("lessons");

    if (!course) {
      res.status(404);
      throw new Error("Course not found");
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

const enrollCourse = async (req, res, next) => {
  const { courseId } = req.body;

  try {
    if (!mongoose.isValidObjectId(courseId)) {
      res.status(400);
      throw new Error("Invalid courseId");
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error("Course not found");
    }

    const userId = req.user?._id;
    if (!userId) {
      res.status(401);
      throw new Error("Unauthorized user");
    }

    let student = await Student.findOne({ user: userId });
    if (!student) {
      student = await Student.create({ user: userId });
    }

    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: userId },
    });

    const updatedStudent = await Student.findByIdAndUpdate(
      student._id,
      { $addToSet: { enrolledCourses: courseId } },
      { new: true }
    ).populate("enrolledCourses");

    res.status(200).json({
      success: true,
      message: "Enrolled in course successfully",
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

const getMyCourses = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401);
      throw new Error("Unauthorized user");
    }

    let student = await Student.findOne({ user: userId }).populate({
      path: "enrolledCourses",
      populate: [
        { path: "instructor", select: "name email" },
        { path: "lessons", select: "title order duration isPreview" },
      ],
    });

    if (!student) {
      student = await Student.create({ user: userId });
      student = await Student.findById(student._id).populate({
        path: "enrolledCourses",
        populate: [
          { path: "instructor", select: "name email" },
          { path: "lessons", select: "title order duration isPreview" },
        ],
      });
    }

    res.status(200).json({
      success: true,
      data: student.enrolledCourses || [],
    });
  } catch (error) {
    next(error);
  }
};

export { getAllCourses, getCourseById, enrollCourse, getMyCourses };

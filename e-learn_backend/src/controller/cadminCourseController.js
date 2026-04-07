import mongoose from "mongoose";
import Instructor from "../models/Instructor.models.js";
import Course from "../models/Course.models.js";
import Lesson from "../models/Lesson.models.js";

const uploadContent  = async (req,res,next)=>{
    const course = req.body;
    await Course.create(course).then ((createdCourse)=>{
        res.status(201).json({  
            success: true,
            data: createdCourse
        })
    }).catch((error)=>{
        next(error);
    })
}

const getAllCourses = async (req,res,next)=>{
    try{
    const {email} = req.body;
    const instructor  =  await Instructor.getOne({email});
    if(!instructor){
        res.status(404);
        throw new Error("Instructor not found");
    }
    const courses = await Course.find({instructor: instructor._id}).populate("instructor", "name email");
    //populate the instructor field with name and email from the Instructor collection
    res.status(200).json({
        success: true,
        data: courses
    })}
    catch(error){
        next(error);
    }
}

const  updateCourse = async (req,res,next)=>{
    const {_id} = req.body;
    const courseData = req.body;
    try{
        const updatedCourse = await Course.findByIdAndUpdate(_id, courseData, {new: true});
        if(!updatedCourse){
            res.status(404);
            throw new Error("Course not found");
        }
        res.status(200).json({
            success: true,
            data: updatedCourse
        })}
    catch(error){
        next(error);
    }
}

const addLesson = async (req,res,next)=>{
    const {
        courseId,
        title,
        lessonName,
        description = "",
        videoUrl = "pending",
        duration = 0,
        isPreview = false,
        resources = [],
        order
    } = req.body;

    try{
        if (!mongoose.isValidObjectId(courseId)) {
            res.status(400);
            throw new Error("Invalid courseId");
        }

        const resolvedTitle = String(title || lessonName || "").trim();
        if (!resolvedTitle) {
            res.status(400);
            throw new Error("Lesson title is required");
        }

        const course = await Course.findById(courseId);
        if(!course){
            res.status(404);
            throw new Error("Course not found");
        }

        const resolvedOrder = Number.isFinite(Number(order))
            ? Number(order)
            : course.lessons.length + 1;

        const lesson = await Lesson.create({
            title: resolvedTitle,
            description,
            course: course._id,
            videoUrl,
            duration: Number(duration) || 0,
            order: resolvedOrder,
            isPreview: Boolean(isPreview),
            resources: Array.isArray(resources) ? resources : []
        });

        course.lessons.push(lesson._id);

        // Keep instructor-course mapping consistent in Instructor collection.
        if (course.instructor) {
            await Instructor.findOneAndUpdate(
                { user: course.instructor },
                { $addToSet: { courses: course._id } },
                { new: true }
            );
        }
        

        const updatedCourse = await course.save();
        res.status(200).json({
            success: true,
            message: "Lesson created and added to course successfully",
            data: {
                lesson,
                course: updatedCourse
            }
        })}
    catch(error){
        next(error);
    }
}

const removeLesson = async (req,res,next)=>{
    const {courseId, lessonId} = req.body;
    try{
        if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(lessonId)) {
            res.status(400);
            throw new Error("Invalid courseId or lessonId");
        }
        
        const course = await Course.findById(courseId);
        if(!course){
            res.status(404);
            throw new Error("Course not found");
        }
        
        const lessonIndex = course.lessons.indexOf(lessonId);
        if (lessonIndex === -1) {
            res.status(404);
            throw new Error("Lesson not found in course");
        }

        course.lessons.splice(lessonIndex, 1);
        await course.save();

        res.status(200).json({
            success: true,
            message: "Lesson removed from course successfully"
        });
    } catch (error) {
        next(error);
    }
}


export {uploadContent, getAllCourses, updateCourse, addLesson, removeLesson}

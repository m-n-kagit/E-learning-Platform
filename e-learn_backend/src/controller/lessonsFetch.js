const getAllCourses = async (req,res,next)=>{ // courses for course admin and instructor
    try{
    const userId = req.user?._id;
    if(!userId){
        res.status(401);
        throw new Error("Unauthorized user");
    }

    const filter = req.user.role === "admin" ? {} : { instructor: userId };
    const courses = await Course.find(filter)
        .populate("instructor", "name email")
        .populate("lessons")
        .sort({ createdAt: -1 });
    //populate the instructor field with name and email from the Instructor collection
    res.status(200).json({
        success: true,
        data: courses
    })}
    catch(error){
        if (error.statusCode) {
            res.status(error.statusCode);
        }
        next(error);
    }
}

const getAllLessonsForCourse = async (req,res,next)=>{
    const {courseId} = req.params;
    try{
        if (!mongoose.isValidObjectId(courseId)) {
            res.status(400);
            throw new Error("Invalid courseId");
        }

        const course = await Course.findById(courseId).populate("lessons");
        if(!course){
            res.status(404);
            throw new Error("Course not found");
        }
        const lessons = await Lesson.find({course: courseId}).sort({order: 1}); // store in array of objects and sort by order field in ascending order
        if (req.user.role !== "user" ) {
            res.status(403);
            throw new Error("You do not have permission to view lessons for this course");
        }
        res.status(200).json({
            success: true,
            data: lessons
        })}
    catch(error){
        if (error.statusCode) {
            res.status(error.statusCode);
        }
        next(error);
    }
}
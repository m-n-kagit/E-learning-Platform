import mongoose from "mongoose";
import Course from "../models/Course.models.js";

function getAllCourses(req,res,next){
    try{

        const courses = await Course.find({isPublished:true}).populate();
        res.status(200).json(courses);

    }
    catch(error){
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Internal server error" });
    }

}
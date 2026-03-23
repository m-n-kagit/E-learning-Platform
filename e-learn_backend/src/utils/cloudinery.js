import {v2 } from "cloudinary";
import {fs} from "fs";

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})

const uploadCloudinary = async (filePath) => {
    try {
        if(!filePath){ return null }
        const response =await v2.uploader.upload(filePath, {resource_type : "auto"})
        console.log("file is uploaded on cloudinary ",response.url);
        fs.unlinkSync(filePath) //delete the file from local storage after uploading to cloudinary
        return response;
        
    }
    catch(error){
        fs.unlinkSync(filePath) //delete the file from local storage after uploading to cloudinary
        console.log("Cloudinary upload error: ", error);
        return null
    }

    }
    
export default uploadCloudinary;
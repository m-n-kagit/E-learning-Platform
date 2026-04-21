//multer is a middleware for handling multipart/form-data, which is primarily used for uploading files.
//  In this code, we are configuring multer to handle file uploads for both admin verification documents and course media (thumbnails and lesson videos). 
// The uploaded files are temporarily stored in a specified directory before being processed and uploaded to Cloudinary. We also define file filters to ensure that only the appropriate file types are accepted for each use case, and we set limits on the file size to prevent performance issues.
import fs from "fs";
import path from "path";
import multer from "multer";

const tempDir = path.resolve(process.cwd(), "public", "temp");
//process.cwd() returns the current working directory of the Node.js process, which is typically the root directory of the project.

//tempdir is the directory where multer will temporarily
// store uploaded files before they are processed and uploaded to Cloudinary.
fs.mkdirSync(tempDir, { recursive: true });
//mkdir Sync is used to create the temporary directory 
// if it doesn't already exist. 
// The { recursive: true } option allows for the creation 
// of nested directories if needed, ensuring that the temp
// directory is available for storing uploaded files 
// before they are processed and uploaded to Cloudinary.

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});// here cb means callback function which is used to
//  specify the destination and filename for the uploaded file.
// The destination function specifies the directory where the 
// uploaded file will be stored temporarily, which is the tempDir 
// we defined earlier.
// The filename function generates a unique filename for the uploaded 
// file by combining the original field name, a unique suffix (based on the current timestamp and a random number), and the original file extension. This helps prevent filename collisions when multiple files are uploaded.  

const adminDocumentFilter = (req, file, cb) => {
  const isPdf =
    file.mimetype === "application/pdf" ||
    path.extname(file.originalname).toLowerCase() === ".pdf";
//mimetype is the media type of the file being uploaded,
//  and path.extname checks the file extension to ensure it's a PDF. 
// This double-check helps prevent users from uploading files with a .pdf 
// extension that aren't actually PDFs.
  if (!isPdf) {
    cb(new Error("Only PDF documents are allowed for admin verification."));
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter: adminDocumentFilter,
  limits: {
    fileSize: 500 * 1024, //limits the file size to 500KB to prevent large files from being uploaded which can cause performance issues
  },
});

const courseMediaFilter = (req, file, cb) => {
  if (file.fieldname === "thumbnail") {
    const isImage = file.mimetype.startsWith("image/png") || file.mimetype.startsWith("image/jpeg") || file.mimetype.startsWith("image/jpg");
    if (!isImage) {
      cb(new Error("Course thumbnail must be an image file."));
      return;
    }
    cb(null, true);
    return;
  }

  if (file.fieldname === "lessonVideo" || file.fieldname === "lessonVideos") {
    const isVideo = file.mimetype.startsWith("video/");
    if (!isVideo) {
      cb(new Error("Lesson upload must be a video file."));
      return;
    }
    cb(null, true);
    return;
  }

  cb(new Error(`Unexpected file field: ${file.fieldname}`));
};

export const courseMediaUpload = multer({
  storage,
  fileFilter: courseMediaFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, //200MB
  },
});

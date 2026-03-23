import multer from "multer"
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/public/temp')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)//unique suffix is 
    // generated using the current timestamp and a random number to ensure
    //  that each uploaded file has a unique name, preventing overwriting 
    // of existing files with the same name.
    cb(null, file.fieldname + '-' + uniqueSuffix) //generate a unique filename using the original fieldname and a unique suffix based on the current timestamp and a random number
  }//cb - callback function that takes an error 
  // (if any) and the generated filename as arguments. 
  // If there is no error, the first argument should be null, 
  // and the second argument should be the generated filename. 
  // This allows multer to save the uploaded file with the specified filename in the destination directory.
})

export const upload = multer({ storage: storage })
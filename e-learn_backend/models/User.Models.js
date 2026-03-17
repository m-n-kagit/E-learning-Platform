import mongoose from "mongoose"
const userSchema =  new mongoose.Schema({
    username : {
        type: String,
        // maxlength: 50,
        required  : true
    }

})
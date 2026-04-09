import mongoose from "mongoose";

const blockedTokenSchema = new mongoose.Schema(
  {
    token: {
        type: String,
        required: true,
        unique: true,
        expires: 5*60,// token will be automatically removed after 5 minutes (300 seconds)
    }             
    },
    { timestamps: true })
    ;

const BlockedToken = mongoose.model("BlockedToken", blockedTokenSchema);
export default BlockedToken;
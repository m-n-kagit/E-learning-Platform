import mongoose from "mongoose";

const blockedTokenSchema = new mongoose.Schema(
  {
    token: {
        type: String,
        required: true,
        unique: true
    }             
    },
    { timestamps: true })
    ;

const BlockedToken = mongoose.model("BlockedToken", blockedTokenSchema);
export default BlockedToken;
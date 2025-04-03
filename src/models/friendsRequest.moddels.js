import mongoose, { Schema } from "mongoose";

const friendRequestSchema = new Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    status:{
        type:String,
        enum:["pending","rejected","accepted"],
        default:"pending"
    }
},{timestamps:true})

export const FriendRequest = mongoose.model("FriendRequest",friendRequestSchema)
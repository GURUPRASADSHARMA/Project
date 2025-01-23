import { asyncHandler } from "../asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken"

export const verifyJwtToken = asyncHandler(async (req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ","")
        if(!token){
            throw new ApiError(400,"token is inavalid")
        }
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRATE)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(400,"token is inavalid")
        }
        req.user=user
        next()

    } catch (error) {
        throw new ApiError(400,error?.message||"your token is invalid")
    }
})
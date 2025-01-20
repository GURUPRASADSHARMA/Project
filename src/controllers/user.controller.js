import { asyncHandler } from "../asyncHandler.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/apiResponse.js"
// import ApiResponse from "../utils/ApiResponse"

const registerUser = asyncHandler(async (req,res)=>{
        const {username,email,password,fullname}=req.body
        
        if([username,email,password,fullname].some((field)=>field?.trim()=="")){
            throw new ApiError(400,"all field are required")
        }

        const existedUser = await User.findOne({
            $or:[{ email },{ username }]
        })

        if(existedUser){
            throw new ApiError(400,"username or email are already exist")
        }

       const user= await User.create({
            username:username,
            fullname,
            email,
            password,

        })
        
const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
)

if(!createdUser){
    throw new ApiError(400,"something went wrong while registering user")
}

return res
.status(200)
.json(new ApiResponse(200,createdUser,"user registered succesfully"))

})

const userLogin=asyncHandler(async (req,res)=>{
const {username,password}= req.body

})


export { registerUser,
        userLogin
        }
import { asyncHandler } from "../asyncHandler.js"
import { FriendRequest } from "../models/friendsRequest.moddels.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/apiResponse.js"
// import ApiResponse from "../utils/ApiResponse"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {

    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAcessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        console.log("problem during creating or setting tokens")
        throw new ApiError(400, "problem during setting or creating tokens")
    }

}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullname } = req.body

    if (
        [username, email, password, fullname].some((field) => field?.trim() == "")
    ) {
        throw new ApiError(400, "all field are required")
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existedUser) {
        throw new ApiError(400, "username or email are already exist")
    }
    // console.log(req.files)

    const profileImagePath = req.files?.profileImage[0]?.path
    // console.log(profileImagePath)
    if (!profileImagePath) {
        throw new ApiError(400, "profile image path cannot get")
    }

    const profileImage = await uploadOnCloudinary(profileImagePath)
    // console.log(profileImage)
    if (!profileImage) {
        throw new ApiError(400, "profile image is required")
    }

    const user = await User.create({
        username: username,
        fullname,
        email,
        password,
        profileImage: profileImage?.url

    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(400, "something went wrong while registering user")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, createdUser, "user registered succesfully"))

})

const userLogin = asyncHandler(async (req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({
        $or:[{ username },{ password }]
      })
    if (!user) {
        throw new ApiError(400, "account does not available")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "password is incorrect")
         
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            {
                user: loggedInUser, refreshToken, accessToken
            },
            "user logged in sucessfully"
        ))
})

const userLogout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }

    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "logged out successfully"))


})

const refreshAccessToken = asyncHandler( async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"invalid refresh Token")
    }
   try {
    const decodedToken =  jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
 
    const user =await User.findById(decodedToken?._id)
    if(!user){
     throw new ApiError(401,"invalid refresh Token")
 }
 
 if(incomingRefreshToken !== user?.refreshToken){
     throw new ApiError(401," refresh Token is expired or used")
 }
 
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)
 
    const options = {
     httpOnly:true,
     secure:true
    }

    return res 
   .status(200)
   .cookie("acessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(new ApiResponse(200,{accessToken,refreshToken},"acess token get refreshed"))

   } catch (error) {
    throw new ApiError(401,error?.message||"invalid refresh token")
   }
 
})

const findUser = asyncHandler(async (req,res)=>{
    const {username} = req.body

    const user=await User.findOne({username}).select(" -password -refreshToken -email ")
    if(!user){
        throw new ApiError(400,"user not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{user},"user found sucessfully"))
})

const changeProfileImage =asyncHandler(async(req,res)=>{
    const newProfileImagePath=req.files?.path
    const newProfileUrl = await uploadOnCloudinary(newProfileImagePath) 
    if(!newProfileUrl.url){
        throw new ApiError(400,"error occured during uploading profile")
    }
    const user= User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                profileImage:newProfileUrl.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,{user},"profile image updated succesfully"))

})

const passwordReset= asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    const user = User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(400,"old password does not matched")
    }
    user.password = newPassword;
    await user.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(new ApiResponse(200,{},"your password reset sucessfuly"))

})

const sendFriendRequest = asyncHandler(async (req,res)=>{
 
  const {senderId,receiverId}=req.body
  if(!senderId){
    throw new ApiError(400,"please provide a valid seinderId")
  }
  if(!receiverId){
    throw new ApiError(400,"please provide a valid receiverId")
  }
    if(senderId==receiverId){
        throw new ApiError(404,"you cannot send follow request to yourself")
    }
    try {
        const existingRequest = await FriendRequest.findOne({sender:senderId,receiver:receiverId})
        if(existingRequest){
            throw new ApiError(404,"request already sent")
        }
        const friendRequest = new FriendRequest({sender:senderId , receiver:receiverId})
        await friendRequest.save({validateBeforeSave:false})
        
        return res
        .status(200)
        .json(new ApiResponse(200,{},"friend request sent succesfully"))
    } catch (error) {
        throw new ApiError(404, error.message ||"error during sending friend request" )
    }
})

const pendingRequest=asyncHandler(async (req,res)=>{
    const {receiverId}=req.body
    if(!receiverId){
        throw new ApiError(400,"please provide valid receiverId")
    }
   const friendRequest = await FriendRequest.find({receiver:receiverId})
   if(!friendRequest){
    throw new ApiError(400,"no friend request available")
   }
   return res
   .status(200)
   .json(new ApiResponse(200,friendRequest,"friendRequest fetch succesfully"))
})

const acceptRequest = asyncHandler(async (req,res)=>{
    const {senderId,receiverId}=req.body
    // const friend = await FriendRequest.findOne({sender:senderId,receiver:receiverId})
    // if(
    //     [senderId,receiverId].some((field)=>field.trim()=="" || field==null)
    // ){
    //     throw new ApiError(404,"please provide valid id's")
    // }
    const user =  await User.findById(receiverId)
    user.friends = senderId;
    await user.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(new ApiResponse(200,{},"added to your friend list"))

})





export {
    registerUser,
    userLogin,
    userLogout,
    refreshAccessToken,
    findUser,
    changeProfileImage,
    passwordReset,
    sendFriendRequest,
    pendingRequest,
    acceptRequest
}
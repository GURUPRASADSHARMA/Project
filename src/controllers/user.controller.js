import { asyncHandler } from "../asyncHandler.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/apiResponse.js"
// import ApiResponse from "../utils/ApiResponse"


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

    if ([username, email, password, fullname].some((field) => field?.trim() == "")) {
        throw new ApiError(400, "all field are required")
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        throw new ApiError(400, "username or email are already exist")
    }

    const user = await User.create({
        username: username,
        fullname,
        email,
        password,

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
        $or: [{ username }, { password }]
    })
    if (!user) {
        throw new ApiError(400, "account does not available")
    }

    const isPasswordCorrect = user.isPasswordCorrect(password)
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


export {
    registerUser,
    userLogin
}
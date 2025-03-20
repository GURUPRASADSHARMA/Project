import { Router } from "express";
import { findUser, refreshAccessToken, registerUser, userLogin, userLogout } from "../controllers/user.controller.js";
import { verifyJwtToken } from "../middleware/auth.js"
import { upload } from "../middleware/multer.middleware.js";


const router=Router()
router.route("/register").post(
    upload.fields([
        {
            name:"profileImage",
            maxCount:1
        }
    ])
    ,registerUser)
router.route("/login").post(userLogin)
router.route("/logout").post(verifyJwtToken,userLogout)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/find-user").post(findUser)


export default router
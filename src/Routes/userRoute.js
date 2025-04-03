import { Router } from "express";
import { acceptRequest, findUser, pendingRequest, refreshAccessToken, registerUser, sendFriendRequest, userLogin, userLogout } from "../controllers/user.controller.js";
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
router.route("/send-request").post(sendFriendRequest)
router.route("/pending-request").get(pendingRequest)
router.route("/accept-request").get(acceptRequest)


export default router
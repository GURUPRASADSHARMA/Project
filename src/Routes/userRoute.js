import { Router } from "express";
import { registerUser, userLogin } from "../controllers/user.controller.js";
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



export default router
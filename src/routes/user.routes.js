import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controllers.js"; //assa naam tbhi le skte ho jb export {} kiya ho
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJwt } from "../middlewares/auth.middlewears.js";


const router = Router()
router.route("/register").post(  //this route says if the route is from /register than HTTP post to rgister user  controller

    //writing the middlwear uplaod from the multer midllewear  
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)
// router.route("/login").post(loginUser)

router.route("/login").post(loginUser)

//****Secured Routes */
router.route("/logout").post(verifyJwt, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)



export default router
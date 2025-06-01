import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js"; //assa naam tbhi le skte ho jb export {} kiya ho
import {upload} from "../middlewares/multer.middlewares.js"


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



export default router
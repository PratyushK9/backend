import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJwt = asyncHandler(async(req,_,next)=>{

    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if (!token) {
            throw new ApiError(401,"Unauthorised Request")
            
        }
        const verifiedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user =await User.findById(verifiedToken?._id)
        .select("-password -refreshToken")
    
        if (!user) {
            //TODO: next video
            throw new ApiError(401,"Invalid Access token")
            
        }
    
        req.user =user;;
        next()
    } catch (error) {

        throw new ApiError(401,error?.message|| "Invalid Access token")
        
    }
})
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import { ApiResponse } from "../utils/ApiResponse.js";  
import jwt from "jsonwebtoken"   
          

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body; // destructure request body

  //console.log("email:", email);

  // Check if any required field is missing or empty
  if ([username, email, fullname, password].some(field => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user with same username or email exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Get avatar and cover image paths from uploaded files (handle case where files may not be sent)
  const avatarOnLocalPath = req.files?.avatar?.[0]?.path;
  

  //Checks for the cover image presence
  //One way of doing it ------>
  //const coverImageOnLocalPath = req.files?.coverImage?.[0]?.path; 

  //Another way of doing it ------>
  let coverImageLocalPath=null
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
    coverImageLocalPath = req.files.coverImage[0].path
  }


  if (!avatarOnLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload avatar and cover image to Cloudinary (if coverImageOnLocalPath exists)
  const avatar = await uploadOnCloudinary(avatarOnLocalPath);
  let coverImage = null;
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  // Create new user
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  });

  // Select user without sensitive info
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req,res)=>{
  //*********Todos**********//
  //Ask for the credentials let us take email for example
  //take the email and verify it with the database email
  //ask for password and verify it
  //send it for decryption
  //if present redirect the usser to the page
  //if not send an 404 not found reponse
  
  //Destructuring the body details
  const {email,username,password} =req.body

  //checking for username and email provided
  if(!(username || email)){
    throw new ApiError(400,"Username or Email is required")
  }

  //finding the username in the MongoDb  , $or is and operator that finds either of them and respond
  const user = await User.findOne({
    $or:[{username},{email}]
  })

  //sending error  if not found
  if(!user){
    throw new ApiError(404,"No user found with this credentials")
  }


  //checking password
  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401,"Invalid Password")
  }


  //generating access and refresh tokem
  const generateAccesTokenAndRefreshToken =async(userId)=>{
    try {
      const user = await User.findOne(userId)
      const refreshToken= user.generateRefreshToken()
      const accessToken =user.generateAccessToken()

      user.refreshToken=refreshToken
      await user.save({validateBeforeSave: false})

      return {refreshToken,accessToken}
      
    } catch (error) {
      throw new ApiError(500,"Something went wrong while generating the Tokens")
      
    }

  }

  const {accessToken,refreshToken}=await generateAccesTokenAndRefreshToken(user._id)

  //Don't send the saved password and the refresh token to the user
  const loggedInUser = await User.findById(user._id)
  .select("-password -refreshToken")

  const options ={
    httpOnly:true,
    secure:true
  }

  return  res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refrshToken",refreshToken)
  .json(
    new ApiResponse(
      200,
      {
        user:loggedInUser,accessToken,refreshToken
      },
      "User Logged in Successful"
    )
  )



});

const logoutUser = asyncHandler(async(res,req)=>{
  //Remove the cookie of the user
  //Play with the refresh token

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )
  const options ={
    httpOnly:true,
    secure:true
  }

  return res
  .status(200)
  .clearCookie("accessToken",accessToken)
  .clearCookie("refreshToken",refreshToken)
  .json(
    new ApiResponse(200,{},"User Logged out succesfully")
  )




});

const refreshAccessToken=asyncHandler(async(req,res)=>{
  try {
    const incomingRefreshToken = req.cookie.refreshToken ||req.body.refreshToken
  
  if(!incomingRefreshToken){
    throw new ApiError(401,"Invalid Session Token")
  }

  const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

  const user = await User.findById(decodedToken?._id)

  if(!user){
    throw new ApiError(404,"Invalid User as invalid token ")
  }

  const options={
    httpOnly:true,
    secure:true
  }

  const {accessToken,newRefreshToken}= await generateAccesTokenAndRefreshToken(user._id)

  return res
  .status(200)
  .cookie("accessToken", accessToken)
  .cookie("refreshToken", newRefreshToken)
  .json(
    new ApiResponse(
      200,
      {accessToken,refreshToken:newRefreshToken},
      "Access Token is Invalid"
    )
  )
    
  } catch (error) {
    throw new ApiError(error?.message, "Invalid access token")
    
  }
  
});

const changeCurrentPassword = asyncHandler(async(req,res)=>{
  const {oldPassword, newPassword} = req.body;


  const user = await User.findById(req.user?._idid)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid Old Password")
  }

  user.password = newPassword;
  user.save({validateBeforeSave:false})


  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      {},
      "Password changed succesfully"
    )
  )
})

const getCurrentUser = asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(200,req.user,"Current user fetched succesfully")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullname,email}= req.body

  if(!fullname || !email){
    throw new ApiError(400, "All fields are required")
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullname,
        email
      }
    },
    {new:true}
  ).select("-passsword")

  res
  .staus(200)
  .json(new ApiResponse(
    200,
    user,
    "Account Details Updated Successfully"
  ))
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url){
    throw new ApiError(400,"Error while uploading on avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar:avatar.url
      }
    },
    {new:true}
  ).select("-passsword")

  res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user,
      "Avatar Uploaded Successfully"
    )
  )

})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
  const coverImageLocalPath = req.file?.path
  if(!coverImageLocalPath){
    throw new ApiError(400, "Cover Image not found")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!coverImage.url){
    throw new ApiError(400,"Error while uploading the Cover Image")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage:coverImage.url
    }
    },
    {new:true}
    
  ).select("Password")

  res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user,
      "Cover Image Uploaded Successfully"
    )
  )




})

export { 
  registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   updateUserCoverImage
  }

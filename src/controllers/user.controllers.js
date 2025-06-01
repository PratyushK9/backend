import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import { ApiResponse } from "../utils/ApiResponse.js";               

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body; // destructure request body

  console.log("email:", email);

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
  const coverImageOnLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarOnLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload avatar and cover image to Cloudinary (if coverImageOnLocalPath exists)
  const avatar = await uploadOnCloudinary(avatarOnLocalPath);
  let coverImage = null;
  if (coverImageOnLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageOnLocalPath);
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

export { registerUser };

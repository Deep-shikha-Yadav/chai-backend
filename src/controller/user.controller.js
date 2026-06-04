import { asyncHandler } from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import {ApiResponce} from '../utils/ApiResponce.js';

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    const { username, email, password, fullName } = req.body;
    console.log("email:", email);
    return res.status(200).json({
        message: "User data received successfully",
        email: email
    });
//     if(fullName === "") {
//    throw new ApiError("Full name is required", 400);
//     }

  if (
  [username, email, password, fullName].some(
    field => field?.trim() === ""
  )
) {
  throw new ApiError(400, "All fields are required");
}

const existingUser = await User.findOne({
    $or: [{ username }, { email }]
});
if (existingUser) {
    throw new ApiError(409, "User with the same username or email already exists");
}
   const avatarLocalPath =req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;

   if(!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if(!avatar){
    throw new ApiError(400, "Avatar file is required");
   }

  const user= awaitUser.create({
    username: username.toLowerCase(),
    email,
    password,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
})
  const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
)
 if(!createdUser){
    throw new ApiError(500, "Somthing went wrong while registering user");
 }
  return res.status(201).json(
    new ApiResponce(200, createdUser, "User registered successfully")
);
});
export { registerUser };
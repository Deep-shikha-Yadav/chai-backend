import { asyncHandler } from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponce } from '../utils/ApiResponce.js';

const generateAccessAndRefreshToken = asyncHandler(async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});

    return { accessToken, refreshToken };
    
  }
  catch(error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh tokens");
  }

})

// const registerUser = asyncHandler(async (req, res) => {
     // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    // const { username, email, password, fullName } = req.body;
    // console.log("email:", email);
    // return res.status(200).json({
    //     message: "User data received successfully",
    //     email: email
    // });
// const { username, email, password, fullName } = req.body;
// console.log("Received Data:", { username, email, password, fullName });
// if (
//     [username, email, password, fullName].some(
//         (field) => field?.trim() === ""
//     )
// ) {
//     throw new ApiError(400, "All fields are required");
// }
//     if(fullName === "") {
//    throw new ApiError("Full name is required", 400);
//     }
//   if (
//   [username, email, password, fullName].some(
//     field => field?.trim() === ""
//   )
// ) {
//   throw new ApiError(400, "All fields are required");
// }
// const existingUser = await User.findOne({
//     $or: [{ username }, { email }]
// });
// if (existingUser) {
//     throw new ApiError(409, "User with the same username or email already exists");
// }
//   const avatarLocalPath = req.files?.avatar?.[0]?.path;
//   const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
//    if(!avatarLocalPath) {
//     throw new ApiError(400, "Avatar file is required");
//    }
//    const avatar = await uploadOnCloudinary(avatarLocalPath)
//    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
//    if(!avatar){
//     throw new ApiError(400, "Avatar file is required");
//    }
//   const user= await User.create({
//     username: username.toLowerCase(),
//     email,
//     password,
//     fullName,
//     avatar: avatar.url,
//     coverImage: coverImage?.url || "",
// })
//   const createdUser= await User.findById(user._id).select(
//     "-password -refreshToken"
// )
//  if(!createdUser){
//     throw new ApiError(500, "Somthing went wrong while registering user");
//  }
//   return res.status(201).json(
//     new ApiResponce(200, createdUser, "User registered successfully")
// );
// });


const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullName } = req.body;

    console.log("Received Data:", { username, email, password, fullName });

    if (
        [username, email, password, fullName].some(
            (field) => field?.trim() === ""
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

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file upload failed on Cloudinary");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullname : fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    // return res.status(201).json(
    //     new ApiResponse(200, createdUser, "User registered successfully")
    // );
return res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: createdUser
});

})

const loginUser = asyncHandler(async (req, res) => {
    // reqbody ->data
    //userName or email
    //find the useer
    //check for password
    //generate access token and refresh token
    //send cookie

    const { email,username ,password } = req.body
    if(!email || !username){
       throw new ApiError(400,"Email or username is required")
    }
      const user= await User.findOne({
    $or:[
        {email},{username}
    ]
  })
  if(!user){
    throw new ApiError(404,"User does not exist")
  }

   const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credentials")
    }
   const {accessToken, refreshToken} = await
    generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options={
    httpOnly: true,
    secure=true,
    }
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    
    .json(
        new ApiResponce(200,
            {
                user:loggedInUser,accessToken,
                 refreshToken
            },
            "User logged in successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
         {
            $set:{
             refreshToken: undefined
            }
             },
             
             { new: true

              }
            )
    const options={
    httpOnly: true,
    secure=true,
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponce(200,{},"User logged Out"))
})

export {
     registerUser,
     loginUser,
     logoutUser
 };
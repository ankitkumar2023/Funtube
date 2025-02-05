import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  asyncHandler  from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
   
    //steps to follow -->

    // 1 -- get user details from the frontend
    // 2 --validation -- any field is empty
    // 3 --check whether user already exist  : by using  username,email
    // 4 -- check for the images,check for avator
    // 5 --upload them to cloudinary--> specific for avator uploaded or not
    // 6 --create user object - create entry in db
    // 7 -- remove password and refresh token field from the response
    // 8 --check for user creation
    // 9 --return response


     // 1 -- get user details from the frontend
    const { fullName, email, username, password } = req.body
    console.log("email", email)

    // 2 --validation -- any field is empty
    if (
        [fullName,email,username,password].some((field)=> field?.trim()==="")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // 3 --check whether user already exist  : by using  username,email
    
    const existedUser = User.findOne({
        $or:[{ username },{ email }]
    })

    if (existedUser) {
        throw new ApiError(409,"User with email or username already exist")
    }

    // 4 -- check for the images,check for avator

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
    }

    //here we have not checked for coverimage whether coverimage is being given by the user or not 
    // because in out database it is not compulsary

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400,"Avatar file is required")
    }

    // 6 --create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",  //because we have not checked for coverimage so if given by user then give the cloudanery url or if not given by user then put empty string.
        email,
        password,
        username: username.toLowerCase()
    })

     // 7 -- remove password and refresh token field from the response

    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // 8 --check for user creation

    if (!createduser) {
        throw new ApiError(
            500,
            "Something went wrong while reqistering the user")
    }

    // 9 --return response

    return res.status(200).json(
        new ApiResponse(200,createduser,"User registered successfully")
    )




})

export {registerUser}
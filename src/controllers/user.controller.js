import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  asyncHandler  from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generateAccessAndRefreshToken } from "../utils/TokenGenerator.js";
import jwt from "jsonwebtoken"

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
    console.log("email", email,)
    console.log("password", password)
    console.log("username", username)
    console.log("fullName", fullName)
    
    

    // 2 --validation -- any field is empty
    if (
        [fullName,email,username,password].some((field)=> field?.trim()==="")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // 3 --check whether user already exist  : by using  username,email
    
    const existedUser = await User.findOne({
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

const loginUser = asyncHandler(async (req, res) => {
    
    // steps to follow :--

    // step 1 --> Get the user id and password from the req.body
    // step 2 --> checks whether user exists in the data base or not
    // steps 3 --> if user get  validated then -->generate the access token and refresh token for the user
    // step 4 -->  send the access token and refresh token of the user through cookies
    // step 5 -->  send  response if user get validated

    // step 1 --> Get the user id and password from the req.body

    const { email, username, password } = req.body;
    console.log("email is",email , " and password is ",password)

    if (!(username || email)) {
        throw new ApiError(400,"username or email any one is required")
    }

    const user= await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "user does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401,"Invalid User Credential")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);


    const loggedInUser = await User.findById(user._id).
        select("-password -refreshToken")
    
    const options = {
        httpOnly: true,
        secure:true
    }
    
    return res
        .status(200)
        .cookie("accessTokes", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user:loggedInUser,accessToken,refreshToken
                },
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken:undefined
        }
    },
        {
        new:true
        })
    
    const options = {
        httpOnly: true,
        secure:true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200,{},"user logged out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
try {
    
        //request comming from frontend carring cookie
        // if cookie have refreshToken
        const incomingRefreshToken = req?.cookie?.refreshToken || req.body.refreshToken;
    
        if (!incomingRefreshToken) {
            throw new ApiError(401, "unauthorized request");
        }
       
        // token comming from frontend is encoded so we have to decode that token
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        
        // refreshToken is containing only id 
        // through id we can find the user
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if (incomingRefreshToken != user?.refreshToken) {
            throw new ApiError(401,"Refresh token is expired or used")
        }
        const options = {
            httpOnly: true,
            secure:true
        }
    
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);
    
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newRefreshToken
                    
                },
                "Access token refreshed successfully"
            ))
} catch (error) {
    throw new ApiError(401,error?.message || "Invalid refresh token")
}

})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";


 const verifyJWT = asyncHandler(async (req, res, next) => {
    
   try {
     // we have access to cookies in request
     //so we check whether accesstoken is present or not
     //if accessToken not present then by default a header is being send with name "Authorization"
     // that Authorization header will contain a Bearear token like -- > Bearer <token>  <-- go and read jwt doc or chatgpt it
     //we only want to that token not "Bearer " string
     //so we replace the "Bearer " with empty space so we can directly get the token
 
 
     const token = req.cookies?.accessToken || req.
         header("Authorization")?.replace("Bearer ", "")
     
     if (!token) {
         throw new ApiError(401,"Unauthorized request")
     }
 
     //token can only decrypt by those who have access token secret
     const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
 
     const user = await User.findById(decodedtoken?._id).select(
         "-password -refreshtoken"
     )
 
     if (!user) {
         throw new ApiError(401,"Invalid Access token")
     }
 
     req.user = user;
     next()
   } catch (error) {
    throw new ApiError(401,error?.message || "Invalid Access token")
   }
 })

 export {verifyJWT}
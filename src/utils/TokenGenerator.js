import User from "../models/User.model.js"
import ApiError from "./ApiError.js"

const generateAccessAndRefreshToken = async function (userId){ 
    try {
        const user = await User.findById(userId)

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken;

        //so when ever we will try to save any changes in the user model
        //then the mongoose model will run the structure and in structure all fields which have required = true needs to be given again
        // so to skip providing those fields detail again which have required=true we use {validateBeforeSave:false}
        // so to not validate or tell mongoose that --> i know what i am doing you just save the changes
        await user.save({ validateBeforeSave: false });

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

export { generateAccessAndRefreshToken };
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index:true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
       
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index:true
    },
    avatar: {
        type: String, //cloudinary url
        required:true,
    },
    coverImage: {
        type:String, //cloudnary url
    },
    watchhistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password: {
        type: String,
        required:[true,"Password is required"]
    },
    refreshToken: {
        type:String
    }
}, { timestamps: true })


userSchema.pre("save", async function (next) {
    
    //i dont want when ever user make changes on any field this method changes passeword again and again
    // so i first check where password get change or not

    if (!this.password.isModified("password")) return next();  //if password not modified then dont do anything just move out

    this.password = await bcrypt.hash(this.password, 10)
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password) //here password = the one that user has given
                                                         //     this.password = the hash version of the password the we have hashed above
}

userSchema.methods.generateAccessToken = function () {
   return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname:this.fullname
    }, process.env.ACCESS_TOKEN_SECRET,
        {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken = function () {
   return jwt.sign({
        _id: this._id,
        
    }, process.env.REFRESH_TOKEN_SECRET,
        {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}
const User = mongoose.model("User", userSchema);

export default User;
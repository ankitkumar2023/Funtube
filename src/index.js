// import mongoose from 'mongoose';
// import { DB_NAME } from './constants';

import dotenv from 'dotenv';
import connectDb from './db/db.js';
import app from './app.js'




dotenv.config({
    path : "./env"
})

const port = process.env.PORT || 8000;

connectDb()
    .then(() => {
        app.listen(port, () => {
            console.log(`App is listning at port ${port}`)
        })
    })
    .catch((error) => {
        console.log("MongoDb connection failed !!!  ",error)
    })



//This is one of the way to connect to database directly from index file but it is not consider as a good practice 
//we should keep our data base connection in a separate file so that it  make code more readable
//IFFI - immediately envocked function
/*
(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", () => {
            console.log("Our application is facing some issue while connectin to database")
        });
        app.listen(process.env.PORT, () => {
            console.log(`Listning at port ${process.env.PORT}`)
        })
    } catch (error) {
        console.log("Error", error)
    }
})();
*/

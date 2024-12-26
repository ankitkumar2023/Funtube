// import mongoose from 'mongoose';
// import { DB_NAME } from './constants';
import express from 'express'
import dotenv from 'dotenv';
import connectDb from './db/db.js';

dotenv.config({
    path : "./env"
})

const app = express();

connectDb();


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

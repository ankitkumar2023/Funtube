import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
}))


//This sets the limit of size of data that is being sent from the frontend 
// ie the backend will accept at  max "20kb" of json data
app.use(express.json({ limit: "20kb" }))

//This helps in url whereever there is a space or any special symbol there this urlencode will provide
//the encoded value of that like space ha  -> %20 encoded value 
app.use(express.urlencoded({ extended: true, limit: "20kb" }))

app.use(cors());
app.use(cookieParser());
app.use(express.static("public"))

export default app;
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//use is used for middleware, it is used to add functionality to the express app

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json({
    limit: "10mb",
}));
app.use(cookieParser());
app.use(express.urlencoded({
    extended: true,
    limit: "10mb",
}));

app.use(express.static("public")); 



export { app };
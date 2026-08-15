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



//import routes  .js add in all files if i is js
import userRoutes from "./routes/user.routes.js";




//routes declaration
app.use("/api/v1/users", userRoutes);
// http://localhost:3000/api/v1/users/register


export { app };
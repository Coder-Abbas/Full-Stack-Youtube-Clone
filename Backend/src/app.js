import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//use is used for middleware, it is used to add functionality to the express app

app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ].filter(Boolean),
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
import videoRoutes from "./routes/video.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js"
import likeRoutes from "./routes/like.routes.js";
import commentRoutes from "./routes/comment.routes.js";



//routes declaration
app.use("/api/v1/users", userRoutes);

app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/subscription", subscriptionRoutes)
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/comments", commentRoutes);


export { app };
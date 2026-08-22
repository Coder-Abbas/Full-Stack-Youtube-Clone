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

// Basic security headers (no external dependency required)
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader(
        "Permissions-Policy",
        "geolocation=(), microphone=(), camera=()"
    );
    next();
});

app.use(express.static("public"));



//import routes  .js add in all files if i is js
import userRoutes from "./routes/user.routes.js";
import videoRoutes from "./routes/video.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js"
import likeRoutes from "./routes/like.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import searchRouter from "./routes/search.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import realtimeRouter from "./routes/realtime.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import adminRouter from "./routes/admin.routes.js";



//routes declaration
app.use("/api/v1/users", userRoutes);

app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/subscription", subscriptionRoutes)
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use(
    "/api/v1/search",
    searchRouter
);
app.use(
    "/api/v1/playlists",
    playlistRouter
);
app.use(
    "/api/v1/events",
    realtimeRouter
);
app.use(
    "/api/v1/dashboard",
    dashboardRouter
);
app.use(
    "/api/v1/admin",
    adminRouter
);


// ==========================================
// Global error-handling middleware
// Converts thrown errors (including APIError from
// controllers/middlewares) into a clean JSON
// response instead of Express's default HTML
// stack trace. Must be the LAST app.use().
// ==========================================

app.use((err, req, res, next) => {
    const statusCode = err?.statusCode || err?.status || 500;
    const message = err?.message || "Internal Server Error";

    if (res.headersSent) {
        return next(err);
    }

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        ...(process.env.NODE_ENV === "development" && err?.stack
            ? { stack: err.stack }
            : {}),
    });
});


export { app };
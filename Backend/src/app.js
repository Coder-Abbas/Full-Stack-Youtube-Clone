import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

const app = express();

// Security headers
app.use(helmet());

// Gzip compression
app.use(compression());

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, message: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api/", apiLimiter);

// CORS configuration
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ].filter(Boolean),
    credentials: true,
};
app.use(cors(corsOptions));

// Body parsers with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Static files
app.use(express.static("public"));

// Import routes
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

// Routes declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/subscription", subscriptionRoutes)
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/events", realtimeRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/admin", adminRouter);

// Global error handler
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
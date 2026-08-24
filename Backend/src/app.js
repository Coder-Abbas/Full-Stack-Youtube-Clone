import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";

const _dirname = path.resolve();
const app = express();

// Security headers
// NOTE: Helmet's default Content-Security-Policy only allows 'self' for
// images/media, which silently blocks ALL Cloudinary thumbnails and videos
// in the browser. Allow Cloudinary explicitly for img/media.
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                baseUri: ["'self'"],
                fontSrc: ["'self'", "https:", "data:"],
                formAction: ["'self'"],
                frameAncestors: ["'self'"],
                imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
                mediaSrc: ["'self'", "https://res.cloudinary.com"],
                objectSrc: ["'none'"],
                scriptSrc: ["'self'"],
                scriptSrcAttr: ["'none'"],
                styleSrc: ["'self'", "https:", "'unsafe-inline'"],
                connectSrc: ["'self'"],
            },
        },
    })
);

// Gzip compression
app.use(compression());

// Rate limiting
// NOTE: In production (Render) all requests arrive via a proxy, so the real
// client IP is only available in X-Forwarded-For. Without trusting the proxy,
// express-rate-limit treats every visitor as the same IP and the limiter is
// exhausted by normal usage -> the API returns 429 and images/videos break.
app.set("trust proxy", 1);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: Number(process.env.RATE_LIMIT_MAX) || 500, // per real client IP
    skip: (req) => req.path?.includes("/events"), // long-lived SSE connections
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

// Public static files served from the project's /public folder
app.use(express.static(path.join(_dirname, "public")));

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

// Serve the built React frontend (SPA fallback).
// IMPORTANT: This must run AFTER the /api routes, and it must NOT catch
// unmatched /api/* requests (let the error handler return JSON 404 instead).
app.use(express.static(path.join(_dirname, "frontend", "dist")));
app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api/")) {
        return next();
    }
    return res.sendFile(path.join(_dirname, "frontend", "dist", "index.html"));
});

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
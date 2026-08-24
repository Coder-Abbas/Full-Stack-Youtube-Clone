import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.db.js";
import path from "path";
import { fileURLToPath } from "url";


const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
        });

        // Graceful shutdown
        process.on("SIGTERM", () => {
            console.log("SIGTERM received, shutting down gracefully");
            server.close(() => {
                console.log("Process terminated");
            });
        });

        process.on("SIGINT", () => {
            console.log("SIGINT received, shutting down gracefully");
            server.close(() => {
                console.log("Process terminated");
            });
        });
    })
    .catch((err) => {
        console.error("Failed to connect to database:", err);
        process.exit(1);
    });

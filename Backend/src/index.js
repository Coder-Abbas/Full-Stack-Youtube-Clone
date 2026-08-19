import dotenv from "dotenv";
import http from "http";
import { app } from "./app.js";
import connectDB from "./db/index.db.js";
import { initializeSocketIO } from "./socket/socketServer.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

connectDB()
    .then(() => {
        const httpServer = http.createServer(app);

        // Initialize Socket.io on the HTTP server
        initializeSocketIO(httpServer);

        httpServer.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT || 3000}`);
        });

        httpServer.on("error", (err) => {
            console.log("Error! ", err);
            throw err;
        });
    })
    .catch((err) => {
        console.log("Error DB connection failed! ", err);
        throw err;
    });
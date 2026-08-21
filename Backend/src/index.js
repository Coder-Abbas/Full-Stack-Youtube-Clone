import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.db.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            
        });

        app.on("error", (err) => {
            
            throw err;
        });
    })
    .catch((err) => {
        
        throw err;
    });

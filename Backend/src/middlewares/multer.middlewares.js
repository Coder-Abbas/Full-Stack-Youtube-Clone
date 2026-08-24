import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Resolve the upload temp directory to an ABSOLUTE path so it works no matter
// where the server is launched from (npm run dev runs from the project root,
// so a relative "./public/temp" would wrongly point to <root>/public/temp).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "..", "..", "public");

// Uploads are stored in /public/temp and deleted after being pushed to Cloudinary.
const tempDir = path.join(publicDir, "temp");
fs.mkdirSync(tempDir, { recursive: true }); // ensure the folder exists

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

export const upload = multer({ storage: storage });


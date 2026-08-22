import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/social-media-youtube";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model("User", userSchema);

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const adminData = {
            fullName: "Admin User",
            username: "admin",
            email: "admin@example.com",
            password: "admin123",
            avatar: "https://res.cloudinary.com/demo/image/upload/v1/samples/people/boy-snow-hoodie.jpg",
            role: "admin",
        };

        const existingUser = await User.findOne({
            $or: [
                { email: adminData.email },
                { username: adminData.username },
            ],
        });

        if (existingUser) {
            console.log("User already exists. Updating role to admin...");
            existingUser.role = "admin";
            existingUser.password = adminData.password;
            await existingUser.save({ validateBeforeSave: false });
            console.log("User updated to admin successfully!");
            console.log("Username:", adminData.username);
            console.log("Password:", adminData.password);
            console.log("Email:", adminData.email);
        } else {
            const admin = await User.create(adminData);
            console.log("Admin user created successfully!");
            console.log("Username:", admin.username);
            console.log("Password:", adminData.password);
            console.log("Email:", admin.email);
            console.log("Role:", admin.role);
        }

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error.message);
        process.exit(1);
    }
};

createAdmin();

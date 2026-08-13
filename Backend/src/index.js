// require("dotenv").config({path: "./env"});
import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";
dotenv.config({path: "./env"});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });

    app.on("error", (err) => {
        console.log("Error! ",err);
        throw err;
    });
})
.catch((err) => {
    console.log("Error DB connection failed! ",err);
    throw err;
});














/*

import express from "express";
const app = express();

async function connectDB() {
    try{
        mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on("error", (err) => {
            console.log("Error! ",err);
            throw err;
        });

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });

    }catch(error){
        console.log("Error! ",error);
        throw error;
    }
}


 */
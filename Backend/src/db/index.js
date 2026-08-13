import mongoose from "mongoose";




const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`MongoDB Connected:`);

        //do assignment of console log to connectionInstance

    }catch(error) {
        console.log("Error connecting to database: ", error);
        process.exit(1); // Exit process with failure
        throw error;
    }
}


export default connectDB;
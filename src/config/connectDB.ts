import mongoose from 'mongoose';


const connectDB = async (): Promise<void> => {
    try{
        const URL = process.env.MONGO_URL;
        if(!URL){
            throw new Error("MONGO_URL is not defined in the env varibles")
        }
        await mongoose.connect(URL)
        console.log("Successfully connected to database")
    }catch(error){
        console.log("Failed to connect to database")
    }
}

export default connectDB;
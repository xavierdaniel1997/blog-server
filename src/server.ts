import express, {Request, Response, Application} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDB from './config/connectDB';
import apiRoutes from './routes/api.routes';
import { configureCloudinary } from './config/cloudinary';


const app: Application = express();

const PORT : Number = 8000;

dotenv.config()
configureCloudinary();
connectDB()

const allowedOrigin = process.env.CLIENT_ORIGIN;

app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: allowedOrigin,
    credentials: true,
    allowedHeaders: ["Content-type", "Authorization"]
}))    

app.get("/", (req: Request, res: Response) => {
    res.json({message: "test message form the blog server"})
})

app.use("/api", apiRoutes);

app.listen(PORT, () => {
    console.log(`server starts running at PORT ${PORT}`)
})
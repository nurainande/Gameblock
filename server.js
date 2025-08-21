import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();
import { connectDB } from './config/database.js';
import userRoutes from "./routes/userRoute.js";


connectDB();

const app = express();

app.use(cors({ origin: `${process.env.CLIENT_URL}`, credentials: true }));

app.use(express.json());

app.use(cookieParser()); // allows us to parse incoming cookies

app.use("/api/v1/user", userRoutes);


app.listen(process.env.PORT, () => {
    console.log(`server running on port ${process.env.PORT}`)
})
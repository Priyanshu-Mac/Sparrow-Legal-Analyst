import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const app = express();

app.use(cors());
app.use(express.json());
dotenv.config();

//testing
app.get("/", (req, res) => {
    res.send("API is running...");
    console.log("API is running...");
})

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server running on port ${process.env.PORT || 8000}`);
});
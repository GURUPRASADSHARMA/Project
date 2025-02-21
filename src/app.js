import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: 'http://localhost:5173', // Allow only this frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Allow cookies if needed
  }));

app.use(express.json({
    limit:"16kb"
}))  // for the json response commming from user

app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))  // for the  response commming from url

app.use(express.static("public")) // it helps to store some files or images
app.use(cookieParser()) // it helps to access the coookie value of user

import router from "./Routes/userRoute.js"

app.use("/api/v1/user",router)

export {app}


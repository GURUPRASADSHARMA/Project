import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin:"*" ,// allow specific origin 
    // origin:"http://localhost:4040",// allow specific origin 
    methods:['GET','POST','PUT'], // allow some methods
    credentials:true, // allow cookies for authentication
    allowedHeaders:['Content-Type','Authorization'] // allow content type and authorization heders
}))

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


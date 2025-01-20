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
}))

app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))

app.use(express.static("public"))
app.use(cookieParser())


import router from "./Routes/userRoute.js"

app.use("/api/v1/user",router)

export {app}


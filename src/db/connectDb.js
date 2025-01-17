import mongoose from "mongoose"
import { DB_name } from "../constant"

const connectDb = async ()=>{
    try {
       const connectionInstances= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`)
        console.log(`mongodb connection host ${connectionInstances.connection.host}`)

    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

export {connectDb}
import { connectDb } from "./db/connectDb.js";
import {app} from "./app.js"
 connectDb()
.then(()=>{
    app.on("error",(error)=>{
        console.log(error)
    });

    app.listen(process.env.PORT || 4000,()=>{
        console.log("server is running")
    })
    
})
.catch((err)=>{
console.log('problem while connecting database',err)
})
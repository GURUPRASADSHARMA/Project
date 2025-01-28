import multer, { MulterError } from "multer"



const storage = multer.diskStorage({
    destination: (req,res,cb)=>{
        cb('null','./public/temp')
    }, // folder on which uploaded file to be saved
    filename:(req,file,cb)=>{

        cb('null',file.originalname)
    } // at which name file should saved
})

export const upload = multer({
    storage:storage
})
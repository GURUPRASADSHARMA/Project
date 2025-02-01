import multer from "multer"



const storage = multer.diskStorage({

    destination: function (req,res,cb) {
        cb(null,'./public/temp')
    },
     // folder on which uploaded file to be saved
    filename: function (req,file,cb) {
        cb(null,file.originalname)
    } 
    // at which name file should saved
})

export const upload = multer({
    storage:storage,
})
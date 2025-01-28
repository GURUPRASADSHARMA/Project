import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_UPLOAD, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET_KEY // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null
      const res= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })    // uploading file to cloudinary 
        console.log("image uploaded successfully",res.url)
        
        return res

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove malicious file(which are not uploaded) from the server
        return null
    }
}

export {uploadOnCloudinary}
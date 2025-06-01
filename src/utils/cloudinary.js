import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

//cloudinary configuration


// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});
const uploadOnCloudinary=async (localFilePath)=>{
    try {
        if(!localFilePath) return null;
        //uplaodig the file to the cloudinary from the local server
        const uploadResult = await cloudinary.uploader
        .upload(localFilePath, {
           resource_type: "auto",
       })
       fs.unlinkSync(localFilePath) //removes the locally saved temp file
       return uploadResult
       
    } catch (error) {
        fs.unlinkSync(localFilePath) //removes the loaclly saved temp file as the uploaded ops go failed
        return null;
        
    }
}

     


export {uploadOnCloudinary}
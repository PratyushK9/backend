import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()


//CORS 
//Middle wwear for config CORS
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

// config for JSON
app.use(express.json({limit:"16kb"}))
//config encoding url
app.use(express.urlencoded({extended:true,limit:"16kb"}))

app.use(express.static("public")) ///name is given , public is the name here

//Config for cookieParsor
app.use(cookieParser())


//***********Routes**************/
import userRouter from "./routes/user.routes.js"  //Assa manchaha naam tbhi le skte ho jb export default  kiya ho

//route declaration
app.use("/api/v1/users",userRouter) //This is a good way of link geneartion

// http://localhost:8000/api/v1/users/register

// We are not writing ""app.get()"" because as we r exporting the rout so we have to add a middwear. Instead we use "app.use()"



export {app}
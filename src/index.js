import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

//Assiginin a port from the env variables else running it on 8000
const port = process.env.PORT ;

dotenv.config({
    path: './env'
})

connectDB()
.then(()=>{
    //Doubt : What does app.on() does 
    app.on("error",()=>{
       console.log('There is some issue in app express')
    })

    //Listening to the browser using express
    app.listen(port,()=>{
        console.log(`Server is running at ${port}`)
    })
})
.catch((err)=>{
    console.log("Mongo DB connection failed!!",err);
})

import express from "express"
import cookieParser from "cookie-parser"
import  cors from "cors"
const app = express()
app.use(cors({
  origin:"*",
  credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
//route import
import userRoute from "./routes/user.routes.js"
//routes declaration
app.use("/api/v1/user",userRoute);

//http://localhost:8000/api/v1/users/register

// ... your other middlewares and routes up here

// app.post("/test-register", (req, res) => {
//     res.status(200).json({ message: "Direct app.js connection works!" });
// });

export { app };


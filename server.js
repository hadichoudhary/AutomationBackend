const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require('dotenv').config()

const authRouter = require("./router/authRoutes");
const excelRouter = require("./router/excelRoutes");
const postRouter = require("./router/getPosts");
const verifyRouter = require("./router/verifyRoutes");
const platformRoutes = require("./router/platformRoutes");
const settingsRoutes = require("./router/settingRoutes");
const promptRoutes = require("./router/promptRoutes");
const activityRoutes = require("./router/activity.routes");
const customRoute = require("./router/customN8nRouter");
const contentRoute = require("./router/content.routes");
const scheduleRoutes = require("./router/schedule.routes");

const dbConnection = require("./config/db");

const app = express();


app.use(express.json({
  limit: "10mb",
  type: "application/json"
}));

app.use(express.urlencoded({
  extended: true
}));

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});


app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));


dbConnection();


app.use("/api/prompt", promptRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/platforms", platformRoutes);
app.use("/api/post", postRouter);
app.use("/api/auth", authRouter);
app.use("/api", excelRouter);
app.use("/api/check", verifyRouter);
app.use("/api/custom", customRoute);
app.use("/api/n8n", contentRoute);

app.get("/api/run/server",(req,res)=>{
  res.send("server is connected")
})


app.listen(4000, () => {
  console.log("Server running on port 4000");
});

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import Authsiakad from "./routes/Authsiakad.js";
import Faculty from "./routes/Faculty.js";
import Major from "./routes/Major.js";
import Year from "./routes/Year.js";
import Class from "./routes/Class.js";
import TfGroup from "./routes/TfGroup.js"
import Student from "./routes/Student.js"
import Lecture from "./routes/Lecture.js"
import Course from "./routes/Course.js"
import Schedule from "./routes/Schedule.js"
import UserSiakad from "./routes/UserSiakad.js"
import TuitionFees from "./routes/TuitionFees.js"
import Payment from "./routes/Payment.js"
import StudyPlan from "./routes/StudyPlan.js"
import adminStats from "./routes/adminStats.js"


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5025;


//Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Routes
app.use("/api/authsiakad", Authsiakad);
app.use("/api/faculties/", Faculty);
app.use("/api/majors/", Major);
app.use("/api/years/", Year);
app.use("/api/class/", Class)
app.use("/api/tf-groups/",  TfGroup)
app.use("/api/students/", Student)
app.use("/api/lecture/", Lecture)
app.use("/api/courses/", Course)
app.use("/api/schedule/", Schedule)
app.use("/api/users/", UserSiakad)
app.use("/api/tuition-fees/", TuitionFees)
app.use("/api/payment/", Payment)
app.use("/api/study-plans/", StudyPlan)
app.use("/api/stats/", adminStats)


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

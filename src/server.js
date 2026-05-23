import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import Authsiakad from "./routes/Authsiakad.js";
import Faculty from "./routes/Faculty.js";
import Major from "./routes/Major.js";
import Year from "./routes/Year.js";



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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

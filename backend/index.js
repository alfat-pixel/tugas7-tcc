import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Routes
import NotesRoute from "./routes/notesRoute.js";
import UserRoute from "./routes/userRoute.js";

// Middleware
import { authenticateToken } from "./middleware/VerifyToken.js";

const app = express();

app.use(cors());

app.use(cookieParser());            // untuk parsing cookie (optional jika pakai refresh token via cookie)
app.use(express.json());            // parsing body JSON

// Public Routes
app.use(UserRoute);                 // Auth: /register, /login

// Protected Routes (pakai token JWT)
app.use(authenticateToken);               // Middleware untuk validasi JWT
app.use(NotesRoute);                // Hanya bisa diakses jika token valid

// Start server
app.listen(5000, () => console.log("Server berjalan di port 5000"));

import "dotenv/config"
import express from "express";
import recordRoutes from "./routes/record.routes.js";
const app = express();

app.use(express.json());
app.use(recordRoutes);

const PORT = 3000;
app.listen(3000, console.log("listening: http://localhost:" + PORT));
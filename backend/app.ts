
import express from "express";
import cors from "cors";
import jobsRouter from "./routes/jobs.js";
import trendsRouter from "./routes/trends.js"; 
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/jobs", jobsRouter);
app.use("/api/trends", trendsRouter);

app.listen(8080, () => {
  console.log("✅ API server running on http://localhost:8080");
});
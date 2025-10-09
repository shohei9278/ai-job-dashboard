
import express from "express";
import cors from "cors";
import jobsRouter from "./routes/jobs";
import trendsRouter from "./routes/trends"; 
const app = express();
app.use(cors());

app.use(
  cors({
    origin: [
      "http://localhost:5173", // 開発用
      "https://ai-job-dashboard-plum.vercel.app/" // Vercel本番用
    ],
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use(express.json());
app.use("/api/jobs", jobsRouter);
app.use("/api/trends", trendsRouter);

// app.listen(8080, () => {
//   console.log("API server running on http://localhost:8080");
// });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
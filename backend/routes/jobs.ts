import { Router } from "express";
import { supabase } from "../db.js";
import fs from "fs";
import { createRequire } from "module";
import express, { Request, Response } from "express";

const require = createRequire(import.meta.url);
const csv = require("csv-parser");

const router = Router();

router.post("/import", async (req, res) => {
  try {
    const results: any[] = [];

      fs.createReadStream("../analysis/jobs_with_summary.csv")
          .pipe(csv())
          .on("data", (data: any) => results.push(data))
          .on("end", async () => {
              try {
                  // skills を text[] 形式に変換
                  const formatted = results.map((r) => ({
                      ...r,
                      skills: r.skills
                          ? `{${r.skills
                              .split(" ")
                              .filter(Boolean)
                              .map((s: any) => `"${s}"`)
                              .join(",")}}`
                          : "{}", // 空の場合は空配列に
                  }));

                  const { error } = await supabase.from("jobs").insert(formatted);

                  if (error) {
                      console.error("Supabase insert error:", error);
                      return res.status(500).json({ error: error.message });
                  }

                  console.log(`✅ Inserted ${formatted.length} rows into Supabase`);
                  res.json({ success: true, count: formatted.length });
              } catch (e: any) {
                  console.error("⚠️ Insert exception:", e);
                  res.status(500).json({ error: e.message });
              }
          })
          .on("error", (err :any) => {
        console.error("CSV読み込みエラー:", err);
        res.status(500).json({ error: err.message });
      });
  } catch (err: any) {
    console.error("ルートエラー:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const { q, skill, location } = req.query;

    let query = supabase.from("jobs").select("*").order("collected_date", { ascending: false });

    // キーワード検索（タイトル・本文・要約に含まれる）
    if (q && typeof q === "string") {
      query = query.or(
        `title.ilike.%${q}%,description.ilike.%${q}%,summary.ilike.%${q}%`
      );
    }

    // スキルフィルタ（text[]カラムに部分一致）
    if (skill && typeof skill === "string") {
      query = query.contains("skills", [skill]); // Supabase text[] 用
    }

    //  勤務地フィルタ
    if (location && typeof location === "string") {
      query = query.ilike("location", `%${location}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err:any) {
    console.error("/api/jobs error:", err);
    res.status(500).json({ error: err.message });
  }
});




export default router;


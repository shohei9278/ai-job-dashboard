import { Router } from "express";
import { supabase } from "../db";
import fs from "fs";
import { createRequire } from "module";
import express, { Request, Response } from "express";


const router = Router();




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


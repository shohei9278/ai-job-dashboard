import { Router } from "express";
import { supabase } from "../db";

const router = Router();

// スキルデータ
router.get("/skill", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("skill_trends")
      .select("*")
        .order("trend_score", { ascending: false })
        .limit(20);

    if (error) {
      console.error(" Supabase fetch error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err:any) {
    console.error(" /api/trends/skil error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 実測データAIコメント
router.get("/summary", async (req, res) => {
  try {
    const { data, error } = await supabase
    .from("job_count_summary")
    .select("summary")
    .order("date", { ascending: false })
    .limit(1);
    
      if (error) {
      console.error(" Supabase fetch error:", error);
      return res.status(500).json({ error: error.message });
    }


    res.json({ data });
  } catch (err: any) {
    console.error(" /api/trends/summray error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 予想データAIコメント
router.get("/insight", async (req, res) => {
  try {
    const { data, error } = await supabase
    .from("job_insights")
    .select("summary")
    .order("date", { ascending: false })
    .limit(1);
    
      if (error) {
      console.error(" Supabase fetch error:", error);
      return res.status(500).json({ error: error.message });
    }


    res.json({ data });
  } catch (err: any) {
    console.error(" /api/trends/insight error:", err);
    res.status(500).json({ error: err.message });
  }
});


// 実測データ
router.get("/actual", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("prefecture_job_counts")
      .select("collected_date, job_count")
      .order("collected_date", { ascending: false });

    if (error) {
      console.error(" Supabase fetch error:", error);
      return res.status(500).json({ error: error.message });
    }

    // 日ごとに求人数を集計
    const grouped = data.reduce((acc:any, row: any) => {
      const date = row.collected_date;
      acc[date] = (acc[date] || 0) + (row.job_count || 0);
      return acc;
    }, {});

    // グラフ用に整形して直近7日だけ返す
    const formatted = Object.entries(grouped)
      .map(([date, total]) => ({
        collected_date: date,
        total_jobs: total,
      }))
      .sort(
        (a, b) =>
          new Date(a.collected_date).getTime() -
          new Date(b.collected_date).getTime()
      )
      .slice(-7);

    res.json(formatted);
  } catch (err:any) {
    console.error(" /api/trends/actual error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 予測データ
router.get("/forecast", async (req, res) => {
  try {
    const today = new Date();

    const { data, error } = await supabase
      .from("job_trend_forecast")
      .select("date, predicted_count, lower_bound, upper_bound")
      .order("date", { ascending: true });

    if (error) {
      console.error(" Supabase forecast fetch error:", error);
      return res.status(500).json({ error: error.message });
    }

    // 今日より未来のデータのみ取得
    const upcoming = data.filter((row: any) => new Date(row.date) > today);

    // //7日先まで
    // const next7days = upcoming.slice(0, 7);

    res.json(upcoming);
  } catch (err: any) {
    console.error("/api/trends/forecast error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("prefecture_job_counts")
      .select("collected_date, job_count")
      .order("collected_date", { ascending: false });

    if (error) {
      console.error(" Supabase fetch error:", error);
      return res.status(500).json({ error: error.message });
    }

    

    res.json(data);
  } catch (err:any) {
    console.error(" /api/trends error:", err);
    res.status(500).json({ error: err.message });
  }
});


// 都道府県別
router.get("/:prefecture", async (req, res) => {
  try {
    const { prefecture } = req.params;
    const { data, error } = await supabase
      .from("prefecture_job_counts")
      .select("collected_date, job_count")
      .eq("prefecture", prefecture)
      .order("collected_date", { ascending: true });

    if (error) {
      console.error(" Prefecture fetch error:", error);
      return res.status(500).json({ error: error.message });
    }

    const formatted = data.map((row: any) => ({
      collected_date: row.collected_date,
      total_jobs: row.job_count,
    }));

    res.json(formatted);
  } catch (err:any) {
    console.error(" /api/trends/:prefecture error:", err);
    res.status(500).json({ error: err.message });
  }
});






export default router;

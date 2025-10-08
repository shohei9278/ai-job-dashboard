import React, { useEffect, useState, createContext } from "react";


import SkillSalaryChart from "../components/analytics/SkillSalaryChart";
import DashboardKPI from "../components/analytics/DashboardKPI";
import SalaryDistributionChart from "../components/analytics/SalaryDistributionChart";
import SkillRankingChart from "../components/analytics/SkillRankingChart";
import SkillTrendChart from "../components/analytics/SkillTrendChart";
import SkillTrendRank from "../components/analytics/SkillTrendRank";
import JobTrendChart from "../components/analytics/JobTrendChart";
import JobTrendForecastChart from "../components/analytics/JobTrendForecastChart";

import LocationChart from "../components/analytics/LocationChart";
import Card from "../components/common/Card";

export const JobsContext = createContext<any[]>([]);


export default function Dashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      fetch("http://localhost:8080/api/jobs")
        .then((res) => res.json())
        .then((data) => {
          setJobs(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch jobs:", err);
          setLoading(false);
        });
    }, []);
  
  return (
    <div className="min-h-screen bg-gray-100">

      <JobsContext.Provider value={jobs}>

         <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

       
        <div className="col-span-12">
          <DashboardKPI />
        </div>

        
        <div className="col-span-12 lg:col-span-6">
          <Card title="新着求人件数の推移（直近7日）">
            <JobTrendChart />
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <Card title="新着求人件数の推移予測">
            <JobTrendForecastChart />
          </Card>
        </div>

       
        <div className="col-span-12 lg:col-span-6">
          <Card title="年収分布（万円）">
            <SalaryDistributionChart />
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <Card title="スキル別 平均年収 Top10">
            <SkillSalaryChart />
          </Card>
        </div>

      
        <div className="col-span-12 lg:col-span-4">
          <Card title="スキル出現ランキング Top10">
            <SkillRankingChart />
          </Card>
        </div>

        
        <div className="col-span-12 lg:col-span-4">
          <Card title="スキル需要予測">
            <SkillTrendRank />
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <Card title="スキル別平均年収トレンド（万円）">
            <SkillTrendChart />
          </Card>
            </div>
            
             <div className="col-span-12">
          <Card title="地域別求人数">
            <LocationChart />
          </Card>
        </div>

      </div>
    </div>
      </JobsContext.Provider>
     
     
    </div>
  );
}
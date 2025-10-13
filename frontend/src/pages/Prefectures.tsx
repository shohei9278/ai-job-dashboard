import { useEffect, useState, createContext } from "react";
import LocationChart from "../components/pefectures/LocationChart";
import Card from "../components/common/Card";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);


interface IntegrationType {
  actual: any[];
  forecast: any[];
  skills: any[];
  ai: {
    trend_ai_comment: string;
    summary_ai_comment: string;
    trend_score_summary: string;
  };
}


interface JobsContextType {
  jobs: any[];
  integration:IntegrationType
}


export const JobsContext = createContext<JobsContextType>({
  jobs: [],
  integration: {
    actual: [],
    forecast: [],
    skills: [],
    ai: {
      trend_ai_comment: "",
      summary_ai_comment: "",
      trend_score_summary: "",
    },
  },
});


export default function Dashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [integration, setIntegration] = useState<IntegrationType>({
    actual: [],
    skills: [],
    forecast: [],
    ai: {
      trend_ai_comment: "",
      summary_ai_comment: "",
      trend_score_summary: "",
    },
  });
  
  const API_URL = import.meta.env.VITE_API_URL;
  
    useEffect(() => {
      fetch(`${API_URL}/jobs`)
        .then((res) => res.json())
        .then((data) => {
          const normalized = data.map((job: any) => ({
        ...job,
        id: Number(job.id),            
        salary: job.salary ? Number(job.salary) : null, 
        collected_date: job.collected_date
    ? dayjs(job.collected_date).utc(job.collected_date).format('YYYY/MM/DD')
    : null,
      }));
          
          setJobs(normalized);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch jobs:", err);
           setLoading(false);
        });
      
       fetch(`${API_URL}/trends/integration`)
        .then((res) => res.json())
         .then((data) => {
          
          setIntegration(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch Integrations", err);
           setLoading(false);
        });
      
    }, []);
  
  return (

    

    
    <div className="min-h-screen bg-gray-100">

      {loading ? (
       <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 text-white z-50">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-semibold tracking-wide">読み込み中...</p>
    </div>
      )  : (
            
          <JobsContext.Provider value={{ jobs,integration }}>

         <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">


        <div className="col-span-12 lg:col-span-12">
          <Card title="地域別求人数">
            <LocationChart />
          </Card>
        </div>
   

      </div>
    </div>
      </JobsContext.Provider>
      )}


      
     
     
    </div>
  );
}
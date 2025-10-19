
import { useEffect, useState, createContext } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getProfile } from "../api/profile";
import MatchJobs from "../components/match/MatchJobs";
import MatchSkillRate from "../components/match/MatchSkillRate";
import MatchSkillGap from "../components/match/MatchSkillGap";
import MatchSkillSalary from "../components/match/MatchSkillSalary";
import MatchComment from "../components/match/MatchComment";
import Card from "../components/common/Card";

const API_URL = import.meta.env.VITE_API_URL;


interface IntegrationType {
  comment: string;
  matchedJobs: any[];
  skillGap: any[];
  salarySim: any;
  skillOverview: any;
}


interface IntegrationContextType {
  integration:IntegrationType
}

type Skill = { skill: string; level: number };

export const IntegrationContext = createContext<IntegrationContextType>({
  integration: {
    comment: "",
    matchedJobs: [],
    skillGap: [],
    salarySim: null,
   skillOverview: {},
  },
});

export default function SkillMatchOverview() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[] | null>(null);
  const [integration, setIntegration] = useState<IntegrationType | null>(null);
  useEffect(() => {
    if (!user) return;
    
    (async () => {

       try {
         const data = await getProfile();
         setSkills(data.skills?.length ? data.skills : []);
      } catch {
        toast.error("プロフィール情報の取得に失敗しました");
       }

       try {
        const res = await axios.get(`${API_URL}/match/summary`, { withCredentials: true });
        setIntegration(res.data);
      } catch {
        toast.error("個人分析データの取得に失敗しました");
       }

    })();


  }, [user]);

  if (!user)
    return <p className="text-center mt-20 text-gray-500">ログインしてください</p>;

   if (skills === null)
    return (
      <p className="text-center mt-20 text-gray-500">分析準備中...</p>
    );
  

  if (skills.length === 0)
    return <div className="flex items-start gap-2 p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded mb-8 max-w-5xl mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 4.5l7.5 13h-15L12 4.5z" />
        </svg>
        <p className="text-sm text-yellow-800">
        スキルを登録するとデータが表示されます。<br></br>
        <a href="/settings" className="text-blue-500 underline">設定ページへ</a>
        </p>
        </div>;

  if (!integration)
    return <p className="text-center mt-20 text-gray-500">データ生成中...<br></br>※AIコメントを生成する為、表示に時間がかかる場合がございます。</p>;

  
  return (
    
    <div className="min-h-screen bg-gray-100">
       <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">


          <IntegrationContext.Provider value={{ integration }}>
             
           <div className="col-span-12 lg:col-span-6">
            <Card title="マッチした求人一覧">
              <MatchJobs />
            </Card>
           </div>
      
           
           <div className="col-span-12 lg:col-span-6">
            <Card title="スキル市場マッチ率">
              <MatchSkillRate />
            </Card>
           </div>
          
          <div className="col-span-12 lg:col-span-6">
            <Card title="スキルギャップ分析">
              <MatchSkillGap />
            </Card>
          </div>
          
          <div className="col-span-12 lg:col-span-6">
            <Card title="年収シミュレーション">
              <MatchSkillSalary />
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-12">
            <Card title="AIコメント">
              <MatchComment />
            </Card>
          </div>
            
          </IntegrationContext.Provider>

        </div>
        </div>
     
    </div>
  );
}
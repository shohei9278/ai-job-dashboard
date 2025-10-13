import { useContext } from "react";
import { JobsContext } from "../../pages/Forecast";
import Comment from "../common/Comment";

export default function JobTrendChart() {
    const { integration } = useContext(JobsContext);

  return (
    <div className="bg-white  overflow-visible">
      

      <Comment comment={integration.ai.trend_ai_comment} />
      
    </div>
  );
}

import { useContext } from "react";
import { JobsContext } from "../../pages/Skills";
import Comment from "../common/Comment";

export default function JobTrendChart() {
    const { integration } = useContext(JobsContext);

  return (
    <div className="bg-white  overflow-visible">
      

      <Comment comment={integration.ai.trend_score_summary} />
      
    </div>
  );
}

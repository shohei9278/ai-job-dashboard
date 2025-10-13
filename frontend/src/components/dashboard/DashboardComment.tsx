import { useContext } from "react";
import { JobsContext } from "../../pages/Dashboard";
import Comment from "../common/Comment";

export default function JobTrendChart() {
    const { integration } = useContext(JobsContext);

  return (
    <div className="bg-white  overflow-visible">
      

      <Comment comment={integration.ai.summary_ai_comment} />
      
    </div>
  );
}

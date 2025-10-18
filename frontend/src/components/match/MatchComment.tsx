import { useContext } from "react";
import { IntegrationContext } from "../../pages/Match";
import Comment from "../common/Comment";

export default function MatchComment() {
  const { integration } = useContext(IntegrationContext);

  return (
    <div className="bg-white  overflow-visible">
      
      <Comment comment={integration.comment} />
      
    </div>
  );
}

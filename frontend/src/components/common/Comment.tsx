export default function comment({
  comment,
}: {
  comment: string;
}) {
  return (
     <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg whitespace-pre-line">
          <p className="text-gray-800 text-sm leading-relaxed">
            {comment}
          </p>
        </div>
  );
}
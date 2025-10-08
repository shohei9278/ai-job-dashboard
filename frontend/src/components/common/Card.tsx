export default function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition h-[100%]">
      <h2 className="text-lg font-semibold mb-3 text-gray-700">{title}</h2>
      {children}
    </div>
  );
}
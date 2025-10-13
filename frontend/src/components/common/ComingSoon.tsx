import { Wrench, Clock } from "lucide-react";

interface ComingSoonProps {
  title?: string;
  message?: string;
}

export default function ComingSoon({
  title = "開発中ページ",
  message = "現在この機能は開発中です。近日公開予定です。",
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center text-gray-600">
      <div className="flex items-center gap-2 mb-3 text-gray-500">
        <Wrench size={28} />
        <Clock size={28} />
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="max-w-md text-sm leading-relaxed mb-6">{message}</p>

      <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-xs">
         開発バージョン v2.0.0
      </div>
    </div>
  );
  }
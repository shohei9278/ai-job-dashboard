import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  LineChart,
  MapPin,
  FileText,
  Settings,
  Briefcase,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { name: "ダッシュボード", path: "/", icon: <LayoutDashboard size={18} /> },
    { name: "個人分析", path: "/match", icon: <Briefcase size={18} /> },
    { name: "求人一覧", path: "/jobsList", icon: <Briefcase size={18} /> },
    { name: "スキル分析", path: "/skills", icon: <BarChart3 size={18} /> },
    { name: "予測", path: "/forecast", icon: <LineChart size={18} /> },
    { name: "地域別動向", path: "/prefectures", icon: <MapPin size={18} /> },
    { name: "レポート", path: "/reports", icon: <FileText size={18} /> },
    { name: "設定", path: "/settings", icon: <Settings size={18} /> },
  ];

  return (
    <>
      {/* 背景の半透明オーバーレイ（モバイル時のみ） */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* サイドバー本体 */}
      <aside
        className={`fixed md:static top-0 left-0 z-50 w-56 bg-white h-full  shadow-md transform transition-transform duration-200
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* ヘッダー部） */}
        <div className="flex items-center justify-between p-4 mb-10">
          <h2 className="text-lg font-semiboldtext-gray-400 dark:text-gray-500">
            AI Job Dashboard
          </h2>
          <button
            onClick={onClose}
            className="md:hidden p-1 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* ナビゲーション */}
        <div>
            <h3 className="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3">
            PAGES
          </h3>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose} // 選択後自動で閉じる
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors mb-4 ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

       
      </aside>
    </>
  );
}

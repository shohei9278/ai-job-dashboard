import { useState, useEffect, useRef } from "react";
import { LogOut, Settings, RefreshCcw, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 外クリックでメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout(); // Contextのlogout実行
    navigate("/"); 
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="h-14 bg-white border-gray-200 shadow-sm flex items-center justify-between px-6">
      {/* 左側：メニュー */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded hover:bg-gray-100 md:hidden"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* 右側：操作アイコン */}
      <div className="flex items-center gap-4 relative">
        <button
          onClick={handleRefresh}
          className="p-2 rounded hover:bg-gray-100 transition cursor-pointer"
          title="更新"
        >
          <RefreshCcw size={18} />
        </button>



        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="focus:outline-none flex items-center gap-2 cursor-pointer"
            >
              <img
                key={user.avatar_url || "default"}
                src={
                  user.avatar_url ||
                 "https://placehold.jp/120x120.png?text=No+Image"
                }
                alt="user avatar"
                className="w-8 h-8 rounded-full border border-gray-200"
              />
              <span className="hidden sm:block text-sm text-gray-700 font-medium">
                {user.name || "ユーザー"} さん
              </span>

              <svg className="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 12 12"><path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z"></path></svg>
            </button>

            {menuOpen && (
              <div className="absolute origin-top-right z-10 absolute top-full min-w-44 bg-white  border border-gray-200  py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 right-0 enter-done">
                <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 font-medium text-gray-800 text-sm">
                  {user.name}
                </div>

                <button
                 onClick={() => navigate("/settings")}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 w-full cursor-pointer"
                >
                   <Settings size={18} /> 設定
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 w-full cursor-pointer"
                >
                  <LogOut size={16} /> ログアウト
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
          >
            ログイン
          </button>
        )}
      </div>
    </header>
  );
}

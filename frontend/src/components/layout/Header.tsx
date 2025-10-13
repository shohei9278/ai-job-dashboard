import { useState, useEffect } from "react";
import { LogOut, Settings, RefreshCcw,Menu } from "lucide-react";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 現在のログイン状態を確認
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
      setLoading(false);
    });

    // 認証状態の変更を監視
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="h-14 bg-white  border-gray-200 dark:border-gray-700/60 shadow-sm flex items-center justify-between px-6">
      {/* 左側：タイトル */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded hover:bg-gray-100 md:hidden"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* 右側：操作アイコン＋ユーザー */}
      <div className="flex items-center gap-4">

        
        <button
          onClick={handleRefresh}
          className="p-2 rounded hover:bg-gray-100 transition"
          title="更新"
        >
          <RefreshCcw size={18} />
        </button>

        <button
          className="p-2 rounded hover:bg-gray-100 transition"
          title="設定"
        >
          <Settings size={18} />
        </button>

        {!loading && (
          <>
            {user ? (
              <div className="relative group">
                <img
                  src={
                    user.user_metadata?.avatar_url ||
                    "https://api.dicebear.com/8.x/identicon/svg?seed=" + user.email
                  }
                  alt="user avatar"
                  className="w-8 h-8 rounded-full cursor-pointer border"
                />
                {/* ホバーでメニュー */}
                <div className="absolute right-0 mt-2 hidden group-hover:block bg-white border rounded shadow-md">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 w-full"
                  >
                    <LogOut size={16} /> ログアウト
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => (window.location.href = "/login")}
                className="px-4 py-2 bg-blue-500 text-white rounded pointer-events-none opacity-60 "
              >
                ログイン
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}
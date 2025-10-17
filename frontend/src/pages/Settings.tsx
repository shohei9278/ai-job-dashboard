import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../api/profile";
import { toast } from "react-hot-toast";
import { PlusCircle, Trash2, Save, Upload } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";


const API_URL = import.meta.env.VITE_API_URL;

type Skill = { skill: string; level: number };

export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [skills, setSkills] = useState<Skill[]>([{ skill: "", level: 3 }]);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { setUser } = useAuth();
  // 初期データ取得
  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        setName(data.user?.name ?? "");
        setEmail(data.user?.email ?? "");
        setAvatarUrl(data.user?.avatar_url ?? "");
        setSkills(data.skills?.length ? data.skills : [{ skill: "", level: 3 }]);
      } catch {
        toast.error("プロフィール情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // スキル編集系
  const addSkill = () => setSkills([...skills, { skill: "", level: 3 }]);
  const removeSkill = (i: number) => setSkills(skills.filter((_, idx) => idx !== i));

  const updateSkill = (i: number, key: keyof Skill, val: string | number) => {
    const newSkills = [...skills];
    (newSkills[i] as any)[key] = val;
    setSkills(newSkills);
  };

  // 保存
  const handleSubmit = async () => {
    setSaving(true);
    try {
       const validSkills = skills.filter((s) => s.skill.trim() !== "");
    await updateProfile({ name, skills: validSkills });
    const newProfile = await getProfile();
    setUser((prev) => ({ ...prev, ...(newProfile.user || newProfile) })); 
    toast.success("プロフィールを更新しました！");
    } catch (err: any) {
      toast.error(err.message || "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  // ファイル選択
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setAvatarUrl(URL.createObjectURL(selected)); // 即プレビュー
    }
  };

  // アップロード処理
  const handleUpload = async () => {
    if (!file) return toast.error("画像を選択してください");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/profile/avatar`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatarUrl(res.data.avatarUrl);
      setFile(null);
      const newProfile = await getProfile();
    setUser((prev) => ({ ...prev, ...(newProfile.user || newProfile) }));
      
      toast.success("プロフィール画像を更新しました！");
    } catch (err) {
      toast.error("アップロードに失敗しました");
    }
  };

   const removeImage = async () => {
    if (!avatarUrl) return toast.error("プロフィール画像が設定されていません");


     try {
       await axios.delete(`${API_URL}/profile/avatar`, {
         withCredentials: true,
        });
       setAvatarUrl("");
       setFile(null); 
       const newProfile = await getProfile();
    setUser((prev) => ({ ...prev, ...(newProfile.user || newProfile) }));
       toast.success("プロフィール画像を削除しました");
              } catch {
                toast.error("削除に失敗しました");
              }
  };

  if (loading)
    return <p className="text-center mt-20 text-gray-500">読み込み中...</p>;




  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-md space-y-8">
      <h1 className="text-2xl font-bold border-b pb-3">プロフィール設定</h1>

             {/* プロフィール画像 */}
      <section className="flex flex-col md:flex-row items-center gap-6 border-b pb-6">
        <div className="flex flex-col items-center gap-3">
          <img
             key={avatarUrl || "default"}
            src={
              avatarUrl ||
              "https://placehold.jp/120x120.png?text=No+Image"
            }
            alt="avatar"
            className="w-28 h-28 rounded-full border-gray-200 object-cover"
          />
          <div className="flex flex-col items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm text-gray-600"
            />
            <button
              onClick={handleUpload}
              disabled={!file}
              className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload size={16} />
              アップロード
            </button>

            {avatarUrl && ( <button
              onClick={() => removeImage()}
                className="inline-flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
              >
              <Trash2 size={18} />
              削除
              </button>)}
            
          </div>
        </div>
      </section>

      {/* ユーザー情報 */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-700">ユーザー情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-500 mb-1">名前</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-100"
              placeholder="お名前を入力"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">メールアドレス</label>
            <input
              value={email}
              disabled
              className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500"
            />
          </div>
        </div>
      </section>

      {/* スキル設定 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-700">スキル</h2>
          <button
            onClick={addSkill}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <PlusCircle size={18} /> 追加
          </button>
        </div>

        <div className="space-y-3">
          {skills.map((s, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row items-center gap-3 border p-3 rounded-md"
            >
              <input
                type="text"
                value={s.skill}
                onChange={(e) => updateSkill(i, "skill", e.target.value)}
                placeholder="スキル名 (例: React, Python)"
                className="flex-1 border rounded px-3 py-2"
              />

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={s.level}
                  onChange={(e) => updateSkill(i, "level", Number(e.target.value))}
                  className="cursor-pointer"
                />
                <span className="text-sm text-gray-600 w-6 text-center">
                  {s.level}
                </span>
              </div>

              <button
                onClick={() => removeSkill(i)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 保存ボタン */}
      <div className="text-right">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? "保存中..." : "保存"}
        </button>
      </div>

    
    </div>
  );
}

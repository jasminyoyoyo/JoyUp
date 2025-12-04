import React, { useState } from 'react';
import { generateHealingImage } from '../services/geminiService';
import { Sparkles, Loader, Image as ImageIcon, Download } from 'lucide-react';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const suggestions = [
    "一只正在吃西瓜的快乐小仓鼠 🐹🍉",
    "云端上的梦幻城堡 🏰☁️",
    "在一个阳光明媚的下午喝茶的小猫 🐱🍵",
    "充满鲜花的宁静花园 🌸🌺"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError('');
    setImage(null);

    try {
      const base64 = await generateHealingImage(prompt);
      if (base64) {
        setImage(base64);
      } else {
        setError('生成失败，请稍后再试。');
      }
    } catch (err) {
      setError('生成图片时遇到了一点小问题，可能是网络太拥挤啦。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 overflow-y-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-pink-600 mb-2 flex items-center justify-center gap-2">
          <Sparkles className="text-yellow-400" /> 治愈画廊
        </h2>
        <p className="text-gray-500 text-sm">描述一个让你感到快乐的画面，AI帮你画出来。</p>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-6 mb-6 flex-1 flex flex-col min-h-[400px]">
        
        {/* Result Area */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 mb-6 overflow-hidden relative group">
          {loading ? (
            <div className="flex flex-col items-center text-gray-400 gap-3">
              <Loader className="animate-spin text-pink-400 w-10 h-10" />
              <p className="text-sm animate-pulse">正在绘制美好画面...</p>
            </div>
          ) : image ? (
            <>
                <img src={image} alt="Generated healing art" className="w-full h-full object-contain animate-fade-in" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a href={image} download="joy-up-healing.jpg" className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/30 transition">
                        <Download size={20} /> 保存图片
                    </a>
                </div>
            </>
          ) : error ? (
            <div className="text-center px-4">
                <p className="text-red-400 mb-2">😕</p>
                <p className="text-gray-500 text-sm">{error}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-300 gap-2">
              <ImageIcon size={48} />
              <p className="text-sm">画面将出现在这里</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex flex-col gap-4">
            <div>
                <p className="text-xs text-gray-400 mb-2 ml-1">试试这些灵感：</p>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {suggestions.map((s, i) => (
                        <button 
                            key={i} 
                            onClick={() => setPrompt(s)}
                            className="whitespace-nowrap text-xs px-3 py-1.5 bg-pink-50 text-pink-600 rounded-full border border-pink-100 hover:bg-pink-100 transition"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="例如：一只在太空中漂浮的柯基犬..."
                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-200 focus:outline-none"
                />
                <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                    className="px-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-pink-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    生成
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
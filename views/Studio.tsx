
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { generateImage, editImage, generateVideo } from '../services/geminiService';
import { ImageSize } from '../types';

enum StudioMode {
  Generate = 'Generate',
  Edit = 'Edit',
  Animate = 'Animate'
}

const Studio: React.FC = () => {
  const [mode, setMode] = useState<StudioMode>(StudioMode.Generate);
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setSourceImage(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAction = async () => {
    setLoading(true);
    setResultImage(null);
    setVideoUrl(null);
    
    try {
      // Create fresh instance right before call as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      if (mode === StudioMode.Generate) {
        if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
            await window.aistudio.openSelectKey();
        }
        const img = await generateImage(prompt, imageSize);
        setResultImage(img);
      } 
      else if (mode === StudioMode.Edit && sourceImage) {
        const img = await editImage(sourceImage, prompt);
        setResultImage(img);
      }
      else if (mode === StudioMode.Animate && sourceImage) {
        if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
            await window.aistudio.openSelectKey();
        }
        const video = await generateVideo(prompt, sourceImage);
        setVideoUrl(video);
      }
    } catch (err: any) {
      console.error("Studio Action Error:", err);
      if (err.message === "KEY_REQUIRED") {
        if (window.aistudio?.openSelectKey) await window.aistudio.openSelectKey();
      } else if (err.message.includes("Requested entity was not found")) {
        // Reset and ask again if key is invalid
        if (window.aistudio?.openSelectKey) await window.aistudio.openSelectKey();
      } else {
        alert("创作室遇到了点小麻烦，请稍后重试。");
      }
    } finally {
      setLoading(false);
    }
  };

  const inspirationPrompts = [
    "赛博朋克风格的图书馆，霓虹灯光映照着古老的书卷",
    "极简主义的晨曦森林，第一缕阳光穿透薄雾",
    "一个在书海中航行的小船，星空作为背景"
  ];

  return (
    <div className="p-6 space-y-8 pb-32">
      {/* Creation Interface */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 space-y-6">
        
        {/* Mode Selector - Apple Tab Style */}
        <div className="flex bg-gray-100/80 p-1 rounded-2xl">
             {Object.values(StudioMode).map(m => (
               <button 
                key={m}
                onClick={() => {
                  setMode(m);
                  setResultImage(null);
                  setVideoUrl(null);
                }} 
                className={`flex-1 py-2 text-[11px] font-black rounded-xl transition-all duration-300 ${
                  mode === m ? 'bg-white text-black shadow-sm scale-100' : 'text-gray-400'
                }`}
               >
                 {m === StudioMode.Generate ? '文本生图' : m === StudioMode.Edit ? '局部重绘' : '静态转视频'}
               </button>
             ))}
        </div>

        {/* Upload Slot for Edit/Animate */}
        {(mode === StudioMode.Edit || mode === StudioMode.Animate) && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-56 border-2 border-dashed border-gray-100 rounded-[2rem] flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-200 transition-all duration-500 overflow-hidden bg-gray-50/50 group"
          >
            {sourceImage ? (
              <img src={sourceImage} className="w-full h-full object-cover animate-in zoom-in-95 duration-500" alt="Source" />
            ) : (
              <div className="text-center space-y-3 group-hover:scale-110 transition-transform">
                <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center mx-auto text-blue-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                </div>
                <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">选择基准图片</span>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
        )}

        {/* Prompt Input */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">描述您的创意</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              mode === StudioMode.Generate ? "例如：'一张油画风格的、在云端漂浮的图书馆...'" :
              mode === StudioMode.Edit ? "例如：'在背景中添加几只飞鸟'" :
              "描述动态效果，如：'柔和的灯光在书页上跳动'"
            }
            className="w-full bg-gray-50/50 border border-gray-100 rounded-[1.5rem] p-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 resize-none h-32"
          />
        </div>

        {/* Inspirations */}
        {mode === StudioMode.Generate && !prompt && (
          <div className="flex flex-wrap gap-2 animate-in fade-in duration-1000">
             {inspirationPrompts.map((p, idx) => (
               <button 
                key={idx} 
                onClick={() => setPrompt(p)}
                className="text-[11px] px-3 py-1.5 bg-gray-50 text-gray-500 rounded-full border border-gray-100 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95"
               >
                 {p.slice(0, 15)}...
               </button>
             ))}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAction}
          disabled={loading || (!prompt && mode === StudioMode.Generate) || (!sourceImage && mode !== StudioMode.Generate)}
          className={`group relative w-full py-4 rounded-[1.5rem] font-black text-white transition-all duration-500 shadow-xl active:scale-[0.98] ${
            loading ? 'bg-gray-200 cursor-not-allowed overflow-hidden' : 'bg-black hover:bg-gray-900 shadow-black/10'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                <span className="text-gray-500">正在创造魔法...</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer"></div>
            </div>
          ) : (
            <span className="flex items-center justify-center gap-2">
               {mode === StudioMode.Generate ? '开始生成' : mode === StudioMode.Edit ? '执行重绘' : '生成动态视频'}
               <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7-7 7"/></svg>
            </span>
          )}
        </button>
      </div>

      {/* Results Display */}
      {(resultImage || videoUrl) && (
        <div className="animate-in zoom-in-95 fade-in duration-700 space-y-4">
           <div className="rounded-[2.5rem] overflow-hidden shadow-2xl bg-white p-2 border border-gray-100">
             {resultImage && <img src={resultImage} alt="Result" className="w-full h-auto rounded-[2.2rem]" />}
             {videoUrl && (
               <video controls autoPlay loop className="w-full h-auto rounded-[2.2rem]">
                 <source src={videoUrl} type="video/mp4" />
               </video>
             )}
           </div>
           <div className="flex gap-4">
             <button 
               onClick={() => {
                 setResultImage(null);
                 setVideoUrl(null);
                 setPrompt('');
               }}
               className="flex-1 py-4 rounded-[1.2rem] border border-gray-100 text-gray-500 font-bold text-sm bg-white active:scale-95 transition"
             >
               重新开始
             </button>
             <a 
               href={resultImage || videoUrl || '#'} 
               download={`lumina_creation_${Date.now()}`}
               className="flex-[2] py-4 bg-gray-100 text-black rounded-[1.2rem] font-black text-sm text-center shadow-inner active:scale-95 transition"
             >
               保存至相册
             </a>
           </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default Studio;

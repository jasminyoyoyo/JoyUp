import React, { useState } from 'react';
import { MessageCircle, Wind, Gamepad2, Hand } from 'lucide-react';
import { Tab } from './types';
import ChatInterface from './components/ChatInterface';
import BubbleWrap from './components/BubbleWrap';
import BreathingExercise from './components/BreathingExercise';
import SokobanGame from './components/SokobanGame';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CHAT);
  const [reliefMode, setReliefMode] = useState<'bubble' | 'breath'>('bubble');

  const renderContent = () => {
    switch (activeTab) {
      case Tab.CHAT:
        return <ChatInterface />;
      case Tab.RELIEF:
        return (
            <div className="h-full flex flex-col bg-white/60 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
                <div className="flex justify-center p-4 gap-4 bg-white/50">
                    <button 
                        onClick={() => setReliefMode('bubble')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${reliefMode === 'bubble' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <Hand size={16} /> 捏泡泡
                    </button>
                    <button 
                        onClick={() => setReliefMode('breath')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${reliefMode === 'breath' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <Wind size={16} /> 深呼吸
                    </button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    {reliefMode === 'bubble' ? <BubbleWrap /> : <BreathingExercise />}
                </div>
            </div>
        );
      case Tab.GAME:
        return (
          <div className="h-full bg-white/60 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
            <SokobanGame />
          </div>
        );
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-indigo-50 text-gray-800 font-sans selection:bg-pink-200">
      {/* Main Container */}
      <div className="max-w-md mx-auto h-screen flex flex-col shadow-2xl bg-white/30 relative">
        
        {/* Top Bar */}
        <header className="pt-4 pb-2 px-6 flex items-center justify-between">
            <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-600">
                JoyUp ✨
            </h1>
            {/* Optional Settings or Profile icon could go here */}
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden p-4 pt-0">
          {renderContent()}
        </main>

        {/* Bottom Navigation */}
        <nav className="p-4 pb-6 bg-white/80 backdrop-blur-lg border-t border-white/50 flex justify-around items-center rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10">
          <button
            onClick={() => setActiveTab(Tab.CHAT)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeTab === Tab.CHAT ? 'text-pink-500 -translate-y-1' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all ${activeTab === Tab.CHAT ? 'bg-pink-100' : 'bg-transparent'}`}>
                <MessageCircle size={24} fill={activeTab === Tab.CHAT ? "currentColor" : "none"} />
            </div>
            <span className="text-[10px] font-bold">陪伴</span>
          </button>

          <button
            onClick={() => setActiveTab(Tab.RELIEF)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeTab === Tab.RELIEF ? 'text-purple-500 -translate-y-1' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all ${activeTab === Tab.RELIEF ? 'bg-purple-100' : 'bg-transparent'}`}>
                <Wind size={24} />
            </div>
            <span className="text-[10px] font-bold">解压</span>
          </button>

          <button
            onClick={() => setActiveTab(Tab.GAME)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeTab === Tab.GAME ? 'text-orange-500 -translate-y-1' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all ${activeTab === Tab.GAME ? 'bg-orange-100' : 'bg-transparent'}`}>
                <Gamepad2 size={24} />
            </div>
            <span className="text-[10px] font-bold">游戏</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default App;
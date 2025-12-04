import React, { useState } from 'react';
import { MessageCircle, Wind, Gamepad2, Hand, ChevronDown, ChevronUp, Menu } from 'lucide-react';
import { Tab } from './types';
import ChatInterface from './components/ChatInterface';
import BubbleWrap from './components/BubbleWrap';
import BreathingExercise from './components/BreathingExercise';
import SokobanGame from './components/SokobanGame';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CHAT);
  const [reliefMode, setReliefMode] = useState<'bubble' | 'breath'>('bubble');
  const [isNavOpen, setIsNavOpen] = useState(true);

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-indigo-50 text-gray-800 font-sans selection:bg-pink-200 overflow-hidden">
      {/* Main Container */}
      <div className="max-w-md mx-auto h-screen flex flex-col shadow-2xl bg-white/30 relative">
        
        {/* Creative Top Navigation - Floating Dynamic Island Style */}
        <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          {/* The actual interactive area needs pointer-events-auto */}
          <div className="pointer-events-auto flex flex-col items-center">
            
            {/* Expanded Navigation Bar */}
            <div 
              className={`
                bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/50
                transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                overflow-hidden flex flex-col items-center
                ${isNavOpen ? 'h-20 opacity-100 translate-y-0 w-[96%] mt-2 rounded-2xl' : 'h-0 opacity-0 -translate-y-4 w-[60%] mt-0 rounded-b-2xl'}
              `}
            >
              <div className="w-full h-full flex items-center justify-between px-6">
                {/* Logo Area */}
                <div className="flex items-center gap-2">
                   <h1 className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-600">
                    JoyUp
                  </h1>
                </div>

                {/* Tabs */}
                <nav className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-full">
                  <button
                    onClick={() => setActiveTab(Tab.CHAT)}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      activeTab === Tab.CHAT ? 'bg-white text-pink-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <MessageCircle size={20} fill={activeTab === Tab.CHAT ? "currentColor" : "none"} />
                  </button>

                  <button
                    onClick={() => setActiveTab(Tab.RELIEF)}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      activeTab === Tab.RELIEF ? 'bg-white text-purple-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Wind size={20} />
                  </button>

                  <button
                    onClick={() => setActiveTab(Tab.GAME)}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      activeTab === Tab.GAME ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Gamepad2 size={20} />
                  </button>
                </nav>
              </div>
            </div>

            {/* The Toggle Handle / Pull String */}
            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              className={`
                flex items-center justify-center gap-1
                bg-white/80 backdrop-blur shadow-md hover:bg-white
                text-gray-400 hover:text-pink-500
                transition-all duration-300
                border border-t-0 border-gray-100
                ${isNavOpen 
                  ? 'rounded-b-xl px-4 py-0.5 -mt-[1px] text-xs' // Small tab when open
                  : 'rounded-b-3xl px-6 py-2 mt-0 text-sm' // Larger handle when closed
                }
              `}
              title={isNavOpen ? "收起导航" : "展开导航"}
            >
              {isNavOpen ? (
                <ChevronUp size={14} />
              ) : (
                <>
                  <span className="font-bold text-xs tracking-widest uppercase">Menu</span>
                  <ChevronDown size={14} />
                </>
              )}
            </button>

          </div>
        </div>

        {/* Content Area - Full Height */}
        <main 
          className={`
            flex-1 overflow-hidden p-4 
            transition-all duration-500
            ${isNavOpen ? 'pt-24' : 'pt-12'} 
          `}
        >
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
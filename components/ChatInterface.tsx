import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender } from '../types';
import { createChatSession } from '../services/geminiService';
import { Send, Loader2, Smile, Heart } from 'lucide-react';
import { Chat, GenerateContentResponse } from '@google/genai';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: '嘿！我是开心果 🥑。今天过得怎么样？有什么开心或不开心的事情都可以告诉我哦！我可以给你讲笑话，或者只是静静地听。',
      sender: Sender.AI,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat session only once
  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: Sender.USER,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatSessionRef.current.sendMessageStream({ message: input });
      
      const aiMsgId = (Date.now() + 1).toString();
      // Initialize AI message placeholder
      setMessages(prev => [...prev, {
        id: aiMsgId,
        text: '',
        sender: Sender.AI,
        timestamp: Date.now(),
        isStreaming: true
      }]);

      let fullText = '';
      
      for await (const chunk of result) {
        const textChunk = (chunk as GenerateContentResponse).text;
        if (textChunk) {
            fullText += textChunk;
            setMessages(prev => prev.map(msg => 
                msg.id === aiMsgId ? { ...msg, text: fullText } : msg
            ));
        }
      }

      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg
      ));

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "哎呀，我好像有点走神了（网络错误），能再说一遍吗？🤕",
        sender: Sender.SYSTEM,
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (text: string) => {
    setInput(text);
    // Optional: auto-send
  };

  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 p-4 flex items-center gap-3 border-b border-pink-100">
        <div className="w-10 h-10 bg-gradient-to-tr from-pink-400 to-orange-300 rounded-full flex items-center justify-center text-white shadow-md">
            <Smile size={24} />
        </div>
        <div>
            <h3 className="font-bold text-gray-800">开心果</h3>
            <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> 
                在线陪你
            </p>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === Sender.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm sm:text-base shadow-sm leading-relaxed ${
                msg.sender === Sender.USER
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none'
                  : msg.sender === Sender.SYSTEM
                  ? 'bg-red-100 text-red-600'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
              }`}
            >
              {msg.text}
              {msg.isStreaming && <span className="inline-block w-1 h-4 ml-1 bg-gray-400 animate-pulse align-middle">|</span>}
            </div>
          </div>
        ))}
        {isTyping && messages.length === messages.filter(m => !m.isStreaming).length && (
            <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions - Only show if chat is empty-ish or user might need prompts */}
      {messages.length < 3 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
              <button onClick={() => handleQuickAction("给我讲个笑话 😂")} className="whitespace-nowrap px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs hover:bg-yellow-200 transition">讲个笑话</button>
              <button onClick={() => handleQuickAction("我感觉压力好大 😫")} className="whitespace-nowrap px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition">压力大</button>
              <button onClick={() => handleQuickAction("夸夸我 🥺")} className="whitespace-nowrap px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs hover:bg-pink-200 transition">求夸奖</button>
          </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="说点什么..."
            className="flex-1 p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="p-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
          >
            {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
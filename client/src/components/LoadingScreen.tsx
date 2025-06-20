
import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [text, setText] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const fullText = 'Welcome to Mentora...';

  useEffect(() => {
    let index = 0;
    const typewriterTimer = setInterval(() => {
      if (index < fullText.length) {
        setText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typewriterTimer);
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(onLoadingComplete, 300);
        }, 1000);
      }
    }, 100);

    return () => clearInterval(typewriterTimer);
  }, [onLoadingComplete]);

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50 transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="text-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
            <Brain className="w-12 h-12 text-purple-600 animate-pulse" />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-4 border-white/30 animate-spin border-t-white"></div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white">
            {text}
            <span className="animate-pulse">|</span>
          </h1>
          <p className="text-xl text-white/80">Your AI Study Companion</p>
        </div>

        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

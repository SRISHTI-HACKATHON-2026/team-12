import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const CommunityScore: React.FC = () => {
  const { score } = useAppContext();
  const [prevScore, setPrevScore] = useState(score);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (score > prevScore) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
    setPrevScore(score);
  }, [score, prevScore]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'text-green-500';
  let emoji = '🤩';
  if (score < 40) {
    colorClass = 'text-red-500';
    emoji = '😟';
  } else if (score < 70) {
    colorClass = 'text-yellow-500';
    emoji = '😊';
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 my-4 bg-white rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: -100 }}
          exit={{ opacity: 0 }}
          className="absolute z-10 text-4xl"
        >
          ✨ +Points! ✨
        </motion.div>
      )}

      <h2 className="text-xl font-bold text-slate-700 mb-4">Community Score</h2>
      
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90 absolute">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-slate-100"
          />
          {/* Progress circle */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
            className={colorClass}
          />
        </svg>
        
        <div className="flex flex-col items-center justify-center z-10">
          <span className="text-4xl font-bold text-slate-800">{score}</span>
          <span className="text-3xl mt-1">{emoji}</span>
        </div>
      </div>
      
      <p className="mt-4 text-slate-500 text-sm font-medium">Keep improving your area!</p>
    </div>
  );
};

export default CommunityScore;

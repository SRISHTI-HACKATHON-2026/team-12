import React from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { Check } from 'lucide-react';

const NudgeCarousel: React.FC = () => {
  const { nudges, completeNudge } = useAppContext();

  return (
    <div className="w-full my-6">
      <div className="flex justify-between items-end mb-4 px-4">
        <h2 className="text-xl font-bold text-slate-800">Action Needed</h2>
        <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">Earn Points!</span>
      </div>
      
      <div className="flex overflow-x-auto pb-4 px-4 gap-4 no-scrollbar snap-x">
        {nudges.map((nudge) => (
          <motion.div
            key={nudge.id}
            className={`min-w-[280px] p-5 rounded-3xl snap-center flex flex-col justify-between shadow-sm border ${
              nudge.completed 
                ? 'bg-slate-50 border-slate-200 opacity-60' 
                : 'bg-white border-green-200 shadow-green-100/50'
            }`}
            whileTap={!nudge.completed ? { scale: 0.98 } : {}}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-3xl">{nudge.icon}</span>
                <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-xl text-sm">+{nudge.points} pts</span>
              </div>
              <h3 className={`font-bold text-lg ${nudge.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                {nudge.title}
              </h3>
              <p className="text-slate-500 text-sm mt-1">{nudge.description}</p>
            </div>
            
            <button
              onClick={() => completeNudge(nudge.id)}
              disabled={nudge.completed}
              className={`mt-4 w-full py-3 rounded-2xl font-bold flex justify-center items-center gap-2 transition-all min-h-[48px] ${
                nudge.completed
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300'
              }`}
            >
              {nudge.completed ? (
                <>
                  <Check className="w-5 h-5" /> Done
                </>
              ) : (
                'Mark Complete'
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NudgeCarousel;

import React from 'react';
import { Match } from '../types';
import { motion } from 'motion/react';
import { CheckCircle, Radio } from 'lucide-react';

export const MatchResultCard: React.FC<{ match: Match }> = ({ match }) => {
  const { homeTeam, awayTeam, homeFlag, awayFlag, league, status, homeScore, awayScore } = match;

  const isFinished = status === 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      {/* Matchup Header */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center border-emerald-500/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
        <div className="flex items-center gap-2 text-sm font-semibold tracking-widest text-emerald-400 uppercase mb-6">
          {isFinished ? <CheckCircle className="w-4 h-4" /> : <Radio className="w-4 h-4 animate-pulse" />}
          {isFinished ? '已完赛' : '进行中'}
        </div>
        
        <div className="flex items-center gap-6 justify-center w-full">
           <div className="flex flex-col items-center flex-1">
             {homeFlag && <img src={homeFlag} alt={homeTeam} className="w-20 h-20 rounded-full object-cover shadow-[0_0_20px_rgba(255,255,255,0.1)] border-4 border-emerald-500/20 mb-3" referrerPolicy="no-referrer" />}
             <span className="text-xl md:text-2xl font-bold text-slate-100">{homeTeam}</span>
           </div>
           
           <div className="flex flex-col items-center justify-center">
             <div className="text-4xl md:text-5xl font-black text-emerald-400 tracking-wider mb-2">
               {homeScore !== null && homeScore !== undefined ? homeScore : 0} 
               <span className="text-slate-500 mx-2">:</span> 
               {awayScore !== null && awayScore !== undefined ? awayScore : 0}
             </div>
             <div className="text-slate-500 font-bold text-sm">实际比分</div>
           </div>
           
           <div className="flex flex-col items-center flex-1">
             {awayFlag && <img src={awayFlag} alt={awayTeam} className="w-20 h-20 rounded-full object-cover shadow-[0_0_20px_rgba(255,255,255,0.1)] border-4 border-emerald-500/20 mb-3" referrerPolicy="no-referrer" />}
             <span className="text-xl md:text-2xl font-bold text-slate-100">{awayTeam}</span>
           </div>
        </div>
      </div>

      <div className="text-center text-slate-400 text-sm mt-4">
        这是比赛的实际{isFinished ? '最终' : '当前'}比分，您可以将其与下方的 AI 预测进行对比。
      </div>
    </motion.div>
  );
}

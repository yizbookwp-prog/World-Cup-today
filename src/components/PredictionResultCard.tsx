import React from 'react';
import { PredictionResult, Match } from '../types';
import { motion } from 'motion/react';
import { Target, TrendingUp, Star, Percent, Database } from 'lucide-react';

export const PredictionResultCard: React.FC<{ result: PredictionResult, match: Match }> = ({ result, match }) => {
  
  const renderStars = (count: number) => {
    return Array.from({ length: count }).map((_, i) => (
      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
    ));
  };

  const { homeTeam, awayTeam, homeFlag, awayFlag, league } = match;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      {/* Matchup Header */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-400"></div>
        <div className="text-sm font-semibold tracking-widest text-amber-500/80 uppercase mb-6">{league} - 赛事预测</div>
        
        <div className="flex items-center gap-6 justify-center w-full">
           <div className="flex flex-col items-center flex-1">
             {homeFlag && <img src={homeFlag} alt={homeTeam} className="w-20 h-20 rounded-full object-cover shadow-[0_0_20px_rgba(255,255,255,0.1)] border-4 border-white/10 mb-3" referrerPolicy="no-referrer" />}
             <span className="text-xl md:text-2xl font-bold text-slate-100">{homeTeam}</span>
           </div>
           
           <div className="text-2xl font-bold text-slate-500 italic pb-6">VS</div>
           
           <div className="flex flex-col items-center flex-1">
             {awayFlag && <img src={awayFlag} alt={awayTeam} className="w-20 h-20 rounded-full object-cover shadow-[0_0_20px_rgba(255,255,255,0.1)] border-4 border-white/10 mb-3" referrerPolicy="no-referrer" />}
             <span className="text-xl md:text-2xl font-bold text-slate-100">{awayTeam}</span>
           </div>
        </div>
      </div>

      {/* 1X2 Probabilities */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Percent className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-xl font-display font-semibold">比赛结果概率</h3>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
          <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center">
            <div className="text-sm font-medium text-slate-300 mb-1">主胜 ({homeTeam})</div>
            <div className="text-2xl font-bold text-emerald-400">{result.winProbabilities.home}%</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center">
            <div className="text-sm font-medium text-slate-300 mb-1">平局</div>
            <div className="text-2xl font-bold text-slate-400">{result.winProbabilities.draw}%</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center">
            <div className="text-sm font-medium text-slate-300 mb-1">客胜 ({awayTeam})</div>
            <div className="text-2xl font-bold text-rose-400">{result.winProbabilities.away}%</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <span className="text-emerald-100/70 font-medium">AI 推荐赛果:</span>
          <span className="font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
            {result.recommendedResult}
          </span>
        </div>
      </div>

      {/* Score Predictions */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-xl font-display font-semibold">精确比分预测</h3>
        </div>

        <div className="space-y-3">
          {result.scorePredictions.map((score, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + (idx * 0.1) }}
              className={`flex items-center justify-between p-4 rounded-xl border ${idx === 0 ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-white/5 border-white/5'}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold tracking-widest text-slate-100">
                  {score.home} : {score.away}
                </span>
                {idx === 0 && (
                  <span className="text-xs font-semibold px-2 py-1 bg-blue-500/30 text-blue-300 rounded-md">
                    最大概率
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {renderStars(score.stars)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Handicap Analysis */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
         <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-xl font-display font-semibold">优势差距分析</h3>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
           <div className="w-full md:w-1/3 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
             <div className="text-sm text-slate-400 mb-1">分析基准线</div>
             <div className="text-xl font-bold text-slate-200 mt-2">
                主队 {result.asianHandicap.line}
             </div>
           </div>
           
           <div className="w-full md:w-2/3 p-4 bg-purple-500/10 rounded-xl border border-purple-500/30 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-purple-300">AI 判断结果</div>
                <div className="flex gap-1">
                   {renderStars(result.asianHandicap.stars)}
                </div>
              </div>
              <div className="text-lg font-bold text-purple-100 bg-purple-500/20 px-3 py-2 rounded-lg text-center border border-purple-500/30">
                {result.asianHandicap.prediction}
              </div>
           </div>
        </div>
      </div>

      {/* Data Source Analysis */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-violet-400"></div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Database className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-xl font-display font-semibold">数据来源分析</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Home Team Data */}
          <div className="space-y-3">
            <div className="text-center mb-4">
              <span className="text-lg font-semibold text-slate-200">{homeTeam}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">综合实力</span>
                <span className="text-slate-200 font-medium">{result.dataAnalysis.homeTeam.overallStrength}</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full" style={{width: `${result.dataAnalysis.homeTeam.overallStrength}%`}}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">进攻效率</span>
                <span className="text-slate-200 font-medium">{result.dataAnalysis.homeTeam.attackEfficiency}</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{width: `${result.dataAnalysis.homeTeam.attackEfficiency}%`}}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">防守强度</span>
                <span className="text-slate-200 font-medium">{result.dataAnalysis.homeTeam.defenseStrength}</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" style={{width: `${result.dataAnalysis.homeTeam.defenseStrength}%`}}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">FIFA 排名</span>
                <span className="text-slate-200 font-medium">{result.dataAnalysis.homeTeam.fifaRanking}</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: `${result.dataAnalysis.homeTeam.fifaRanking}%`}}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">世界杯底蕴</span>
                <span className="text-slate-200 font-medium">{result.dataAnalysis.homeTeam.worldCupPedigree}</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full" style={{width: `${result.dataAnalysis.homeTeam.worldCupPedigree}%`}}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">伤病影响</span>
                <span className="text-rose-400 font-medium">-{result.dataAnalysis.homeTeam.injuryImpact}</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-rose-500 to-red-600 h-2 rounded-full" style={{width: `${Math.min(result.dataAnalysis.homeTeam.injuryImpact * 6.67, 100)}%`}}></div>
              </div>
            </div>
          </div>

          {/* Away Team Data */}
          <div className="space-y-3">
            <div className="text-center mb-4">
              <span className="text-lg font-semibold text-slate-200">{awayTeam}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">综合实力</span>
                <span className="text-slate-200 font-medium">{result.dataAnalysis.awayTeam.overallStrength}</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full" style={{width: `${result.dataAnalysis.awayTeam.overallStrength}%`}}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">进攻效率</span>
                <span className="text-slate-200 font-medium">{result.dataAnalysis.awayTeam.attackEfficiency}</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{width: `${result.dataAnalysis.awayTeam.attackEfficiency}%`}}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">防守强度</span>
                <span className="text-slate-200 font-medium">{result.dataAnalysis.awayTeam.defenseStrength}</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" style={{width: `${result.dataAnalysis.awayTeam.defenseStrength}%`}}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">FIFA 排名</span>
                <span className="text-slate-200 font-medium">{result.dataAnalysis.awayTeam.fifaRanking}</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: `${result.dataAnalysis.awayTeam.fifaRanking}%`}}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">世界杯底蕴</span>
                <span className="text-slate-200 font-medium">{result.dataAnalysis.awayTeam.worldCupPedigree}</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full" style={{width: `${result.dataAnalysis.awayTeam.worldCupPedigree}%`}}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">伤病影响</span>
                <span className="text-rose-400 font-medium">-{result.dataAnalysis.awayTeam.injuryImpact}</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-rose-500 to-red-600 h-2 rounded-full" style={{width: `${Math.min(result.dataAnalysis.awayTeam.injuryImpact * 6.67, 100)}%`}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Weights Explanation */}
        <div className="pt-4 border-t border-white/10">
          <div className="text-xs text-slate-400 mb-2">算法权重配比：</div>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-slate-300">基础实力 {result.dataAnalysis.weights.baseStrength}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-slate-300">FIFA排名 {result.dataAnalysis.weights.fifaRanking}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-slate-300">世界杯历史 {result.dataAnalysis.weights.worldCupHistory}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-slate-300">攻防能力 {result.dataAnalysis.weights.attackDefense}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <span className="text-slate-300">伤病因素 {result.dataAnalysis.weights.injuries}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

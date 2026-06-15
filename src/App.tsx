import React, { useState, useEffect } from 'react';
import { generatePrediction } from './lib/predictor';
import { Match, PredictionResult } from './types';
import { PredictionResultCard } from './components/PredictionResultCard';
import { MatchResultCard } from './components/MatchResultCard';
import { Activity, Cpu, ChevronDown, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [isPredicting, setIsPredicting] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [showRealResult, setShowRealResult] = useState(false);

  useEffect(() => {
    const fetchMatches = () => {
      fetch('/api/matches')
        .then(res => res.json())
        .then((data: Match[]) => {
          setMatches(data);
          setSelectedMatchId(prev => {
             if (!prev && data.length > 0) {
               const liveMatch = data.find(m => m.status === 3);
               if (liveMatch) return liveMatch.id;
               const upcomingMatch = data.find(m => m.status === 1);
               if (upcomingMatch) return upcomingMatch.id;
               return data[data.length - 1].id;
             }
             return prev;
          });
          setIsLoadingMatches(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingMatches(false);
        });
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const selectedMatch = matches.find(m => m.id === selectedMatchId);
  const isMatchStarted = selectedMatch ? selectedMatch.status !== 1 : false;

  const handlePredict = () => {
    setIsPredicting(true);
    setResult(null);
    setShowRealResult(false);

    // Simulate network delay / AI processing
    setTimeout(() => {
      if (selectedMatch) {
        const generatedResult = generatePrediction(selectedMatch);
        setResult(generatedResult);
        if (selectedMatch.status !== 1) {
          setShowRealResult(true);
        }
      }
      setIsPredicting(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-cyan-500/30 overflow-x-hidden p-6 md:p-12 relative">
      {/* Background decorations */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-3xl mx-auto space-y-10 relative z-10">
        
        {/* Header */}
        <header className="text-center space-y-4 pt-10 pb-4">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/10 mb-2 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <Activity className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight bg-gradient-to-br from-slate-100 to-slate-500 bg-clip-text text-transparent">
            今日赛程数据终端
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base">
            高精度足球赛果预测引擎。获取 AI 计算的胜平负概率、精确比分预测，或查看已经开始的真实赛事比分。
          </p>
        </header>

        {/* Controls */}
        <div className="glass rounded-2xl p-6 md:p-8 space-y-6 max-w-xl mx-auto">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">选择今日比赛</label>
              <div className="relative">
                <select 
                  value={selectedMatchId}
                  onChange={(e) => {
                    setSelectedMatchId(e.target.value);
                    setResult(null);
                    setShowRealResult(false);
                  }}
                  disabled={isPredicting || isLoadingMatches}
                  className="w-full appearance-none bg-black/20 border border-white/10 rounded-xl px-4 py-4 pr-10 text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMatches ? (
                    <option>加载真实数据中...</option>
                  ) : matches.map((match) => {
                    const dateObj = new Date(match.time);
                    const formattedDate = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日 ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
                    const statusText = match.status === 0 ? " [已完赛]" : match.status === 3 ? " [进行中]" : "";
                    return (
                      <option key={match.id} value={match.id} className="bg-slate-900">
                        {statusText} [{formattedDate}] {match.league} | {match.homeTeam} vs {match.awayTeam}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>

            {selectedMatch && (
              <div className="flex items-center justify-between bg-black/20 border border-white/5 rounded-xl p-4 mt-2">
                <div className="flex items-center gap-3">
                  {selectedMatch.homeFlag && <img src={selectedMatch.homeFlag} alt={selectedMatch.homeTeam} className="w-8 h-8 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />}
                  <span className="font-semibold">{selectedMatch.homeTeam}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-slate-500 font-bold text-sm">VS</div>
                  {isMatchStarted && (
                     <div className="text-xs text-emerald-400 font-medium mt-1">{selectedMatch.status === 0 ? '已完赛' : '进行中'}</div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{selectedMatch.awayTeam}</span>
                  {selectedMatch.awayFlag && <img src={selectedMatch.awayFlag} alt={selectedMatch.awayTeam} className="w-8 h-8 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handlePredict}
            disabled={isPredicting}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-80 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-[0.98]"
          >
            {isPredicting ? (
              <>
                <motion.div
                   animate={{ rotate: 360 }}
                   transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Cpu className="w-5 h-5 opacity-80" />
                </motion.div>
                <span>AI 核心正在运算走势矩阵...</span>
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                <span>启动全局 AI 预测</span>
              </>
            )}
          </button>
        </div>

        {/* Results Area */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
             {isPredicting && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-64 space-y-4"
                >
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 opacity-20"></div>
                    <motion.div 
                      className="absolute inset-0 rounded-full border-t-2 border-cyan-400"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-cyan-400">
                       <Cpu className="w-6 h-6" />
                    </div>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                    className="text-cyan-400 font-mono text-sm tracking-widest"
                  >
                    正在解算多维赔率模型
                  </motion.div>
                </motion.div>
             )}

      {!isPredicting && showRealResult && selectedMatch && (
         <MatchResultCard match={selectedMatch} key={`real-${selectedMatch.id}`} />
      )}

      {!isPredicting && result && selectedMatch && (
         <PredictionResultCard 
           result={result} 
           match={selectedMatch}
           key={`pred-${selectedMatch.id}`}
         />
      )}
          </AnimatePresence>
        </div>

        {/* Disclaimer Area */}
        <div className="pt-12 pb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-slate-400 space-y-4">
            <h3 className="text-amber-500/90 font-semibold mb-2 flex items-center gap-2">
              ⚠️ 世界杯比分推演·重要免责防范申明 (Legal & Anti-Gambling Disclaimer)
            </h3>
            <p>
              本网站（"世界杯 AI 比分推演室"）为个人开发的人工智能娱乐项目，所有比赛预测均由 AI 模型基于公开资料自动生成，仅代表算法推演结果，不代表任何机构或个人观点。
            </p>
            <p>
              本站全部内容仅供娱乐和球迷交流使用，不构成任何形式的建议或决策依据。AI 预测存在固有不确定性，历史命中率不代表对未来结果的任何保证。
            </p>
            <p className="text-rose-400/90 font-medium">
              严禁将本站任何内容用于赌博、博彩、竞猜投注等违法活动。根据《中华人民共和国刑法》及相关法律法规，参与赌博属违法行为，本站坚决反对并抵制任何形式的赌球。
            </p>
            <p>
              未经书面许可，任何单位或个人不得将本站内容用于商业目的，包括但不限于转售、付费推荐、引流营销等。任何违反本声明使用本站内容所产生的一切后果，由使用者自行承担，与本站无关。
            </p>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-2">
              <span className="text-xl leading-none pt-0.5">💡</span>
              <p>本站不收集任何个人信息、不设任何付费项目。凡以本站名义收费荐彩、拉群带单的，均系假冒诈骗，请通过下方“站内信箱”模块提交反馈与举报。</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

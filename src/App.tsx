import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, CheckCircle2, User, Coins, Download, Copy, Check, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';

// --- Audio Effect ---
const playChipSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Create a short, high-pitched "clack" sound simulating poker chips
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

// --- Components ---
const PlayingCard: React.FC<{ r: string; s: string }> = ({ r, s }) => {
  const isRed = s === '♥' || s === '♦';
  return (
    <div className="w-12 h-16 sm:w-14 sm:h-20 bg-white rounded-lg shadow-md border border-slate-200 flex flex-col items-center justify-center font-bold text-xl sm:text-2xl relative overflow-hidden">
      <span className={`${isRed ? "text-red-600" : "text-slate-900"} leading-none z-10`}>{r}</span>
      <span className={`${isRed ? "text-red-600" : "text-slate-900"} leading-none z-10 text-lg sm:text-xl mt-0.5`}>{s}</span>
      {/* Subtle gradient for realism */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-100 opacity-50 pointer-events-none" />
    </div>
  );
};

const ScenarioVisualizer = ({ scenario, actionType }: { scenario: any, actionType: string | null }) => {
  return (
    <div className="bg-slate-900 rounded-3xl p-5 sm:p-8 mb-8 shadow-xl border border-slate-800 flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-between relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 to-transparent pointer-events-none" />
      
      {/* Left: Hand */}
      <div className="flex flex-col items-center z-10 w-full md:w-auto">
        <span className="text-slate-400 text-xs mb-3 font-medium tracking-widest uppercase">你的手牌</span>
        <motion.div 
          className="flex gap-2"
          animate={actionType === 'fold' ? { y: 150, opacity: 0, rotate: -15, scale: 0.8 } : { y: 0, opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {scenario.hand.map((c: any, i: number) => <PlayingCard key={i} r={c.r} s={c.s} />)}
        </motion.div>
      </div>

      {/* Middle: Board */}
      <div className="flex flex-col items-center z-10 w-full md:w-auto flex-1 border-y md:border-y-0 md:border-x border-slate-700/50 py-5 md:py-0 md:px-8">
        <span className="text-slate-400 text-xs mb-3 font-medium tracking-widest uppercase">公共牌</span>
        <div className="flex gap-2 min-h-[5rem] items-center justify-center flex-wrap">
          {scenario.board.length > 0 ? (
            scenario.board.map((c: any, i: number) => <PlayingCard key={i} r={c.r} s={c.s} />)
          ) : (
            <span className="text-slate-500 text-sm italic bg-slate-800/50 px-5 py-2.5 rounded-xl border border-slate-700/50">翻牌前 (Pre-flop)</span>
          )}
        </div>
      </div>

      {/* Right: Stats */}
      <div className="flex flex-col w-full md:w-auto min-w-[220px] z-10">
        {scenario.note && (
          <div className="text-xs text-indigo-300 mb-4 pb-3 border-b border-slate-700/50 flex items-start gap-2 leading-relaxed">
            <User className="w-4 h-4 mt-0.5 opacity-60 blur-[0.5px] flex-shrink-0" />
            <span>{scenario.note}</span>
          </div>
        )}
        <div className="space-y-3 text-sm bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50 shadow-inner">
          <div className="flex justify-between items-center gap-4">
            <span className="text-slate-400">底池 (Pot)</span>
            <span className="text-yellow-400 font-bold text-lg">{scenario.pot}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-slate-400">你已投入</span>
            <span className="text-emerald-400 font-bold">{scenario.invested}</span>
          </div>
          <div className="pt-3 border-t border-slate-700/50 mt-2">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1.5">
              <User className="w-3.5 h-3.5 opacity-60 blur-[0.5px]" /> 
              <span>对手操作</span>
            </div>
            <div className="text-red-400 font-bold text-base animate-pulse">
              {scenario.oppAction}
            </div>
          </div>
        </div>
      </div>
      
      {/* Call Animation Overlay */}
      <AnimatePresence>
        {actionType === 'call' && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1.2, opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <div className="flex items-center gap-3 bg-slate-900/90 px-8 py-4 rounded-full border-2 border-yellow-500/50 shadow-[0_0_40px_rgba(234,179,8,0.4)]">
              <Coins className="w-8 h-8 text-yellow-400" />
              <span className="font-bold text-yellow-400 text-2xl tracking-wider">+ CALL</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Data ---
const questions = [
  {
    id: 1,
    question: "刚坐下还没摸清对手，你拿到 K♦ 10♥ 这种中等偏上的牌，通常会？",
    options: [
      { text: "A. 稳健起见，直接弃牌。", v: -2, a: 0, s: 0 },
      { text: "B. 加注进入，拿回主动权。", v: 0, a: 2, s: 0 },
      { text: "C. 跟着前面的平跟玩家一起 Limp 进去看牌。", v: 2, a: -1, s: 0 }
    ]
  },
  {
    id: 2,
    question: "前面有 3 个人平跟（Limp）进池，你在大盲位拿着 5♠ 7♠（小同花连牌），你会？",
    options: [
      { text: "A. 难得进场便宜，肯定看看翻牌。", v: 2, a: -1, s: 0 },
      { text: "B. 牌太烂，哪怕免费看牌也不想玩，直接过牌。", v: -2, a: 0, s: 0 }
    ]
  },
  {
    id: 3,
    question: "你在翻牌中了顶对，但对手先下注了，你的第一反应是？",
    scenario: {
      hand: [{r:'A',s:'♠'}, {r:'Q',s:'♥'}],
      board: [{r:'Q',s:'♦'}, {r:'7',s:'♣'}, {r:'2',s:'♠'}],
      pot: 100,
      invested: 40,
      oppAction: "下注 60"
    },
    options: [
      { text: "A. 马上加注（Raise），告诉他我也有牌。", v: 0, a: 2, s: 0 },
      { text: "B. 先跟注（Call）看看，怕他有更大的。", v: 0, a: -2, s: 1 }
    ]
  },
  {
    id: 4,
    question: "翻牌出来你什么都没中，对手下了一个底池 1/3 的小注，你会？",
    scenario: {
      hand: [{r:'K',s:'♠'}, {r:'J',s:'♠'}],
      board: [{r:'7',s:'♣'}, {r:'4',s:'♦'}, {r:'2',s:'♥'}],
      pot: 120,
      invested: 40,
      oppAction: "下注 35"
    },
    options: [
      { text: "A. 既然没中，直接弃牌，不浪费筹码。", v: 0, a: 0, s: -2 },
      { text: "B. 稍微有点后门听牌的机会，我就想跟注看看。", v: 0, a: -1, s: 2 }
    ]
  },
  {
    id: 5,
    question: "【灵魂拷问】在桌上出现以下两个情况哪个是你更讨厌的？",
    options: [
      { text: "A. 说出“我fold弃牌。”（总觉得扔了之后，后面会出我要的牌，或者觉得被偷了）", v: 0, a: 0, s: 2 },
      { text: "B. 听到“我all-in全进。”（讨厌别人突然打很大，让我很难决定跟还是不跟）", v: 0, a: -2, s: -1 }
    ]
  },
  {
    id: 6,
    question: "翻牌和转牌你都跟注了，底池已经不小。河牌发出来一张无关痛痒的小牌，你手里依然只是个底对。这时对方突然发起重注攻击（Pot Size Bet），你的第一反应是？",
    scenario: {
      hand: [{r:'A',s:'♦'}, {r:'2',s:'♦'}],
      board: [{r:'J',s:'♥'}, {r:'9',s:'♠'}, {r:'8',s:'♣'}, {r:'4',s:'♦'}, {r:'2',s:'♣'}],
      pot: 400,
      invested: 180,
      oppAction: "下注 400 (满池)"
    },
    options: [
      { text: "A. “他肯定在偷！我不信，我要抓他。”", v: 0, a: -1, s: 2 },
      { text: "B. “算了，我这牌肯定赢不了，弃牌。”", v: 0, a: 0, s: -2 }
    ]
  },
  {
    id: 7,
    question: "在长达一小时的牌局中，你发现自己弃牌的次数？",
    options: [
      { text: "A. 非常多，我只玩我觉得稳赢的。", v: -2, a: 0, s: -1 },
      { text: "B. 很少，我喜欢参与其中的感觉。", v: 2, a: -1, s: 1 },
      { text: "C. 中规中矩，主要看位置和对手的漏洞出手。", v: 0, a: 1, s: 0 }
    ]
  },
  {
    id: 8,
    question: "你手持 A♣ K♦，翻牌是 7♠ 2♥ 9♣。你没中，对手突然推了全进，你会？",
    scenario: {
      hand: [{r:'A',s:'♣'}, {r:'K',s:'♦'}],
      board: [{r:'7',s:'♠'}, {r:'2',s:'♥'}, {r:'9',s:'♣'}],
      pot: 150,
      invested: 60,
      oppAction: "全进 (All-in) 800"
    },
    options: [
      { text: "A. 秒弃，没中就没道理跟。", v: 0, a: 0, s: -2 },
      { text: "B. 我有 AK，这是大牌，我要搏一张 A 或 K。", v: 0, a: -1, s: 2 }
    ]
  },
  {
    id: 9,
    question: "如果你连续输了三手牌，你接下来的打法是？",
    options: [
      { text: "A. 变得更紧，找机会回血。", v: -2, a: 0, s: 0 },
      { text: "B. 变得更松，什么牌都想进去“报仇”。", v: 2, a: 2, s: 0 }
    ]
  },
  {
    id: 10,
    question: "当你加注后被对手再加注（3-bet），你通常会？",
    scenario: {
      hand: [{r:'8',s:'♣'}, {r:'8',s:'♦'}],
      board: [],
      pot: 180,
      invested: 40,
      oppAction: "再加注到 140",
      note: "对手是一个很稳的玩家，他突然对你 3-bet"
    },
    options: [
      { text: "A. 既然已经投入了筹码，就一定要看看翻牌。", v: 1, a: -1, s: 2 },
      { text: "B. 如果手里的牌不是顶级的，就果断弃牌。", v: -1, a: 0, s: -2 }
    ]
  }
];

const getResult = (v: number, a: number, s: number) => {
  if (v >= 0) { // Loose
    if (a >= 0) { // Aggressive
      return {
        type: "🔥 松凶 (LAG)",
        vpip: "VPIP 25~35%",
        desc: "宽范围 + 高频施压，难以读牌",
        color: "text-red-500",
        bg: "bg-red-50"
      };
    } else { // Passive
      if (s >= 3) {
        return {
          type: "🐟 鱼 / 跟注站",
          vpip: "VPIP >45%",
          desc: "范围极宽，喜欢跟注，很少弃牌",
          color: "text-blue-500",
          bg: "bg-blue-50"
        };
      } else {
        return {
          type: "🌀 松弱 (LP)",
          vpip: "VPIP 30~45%",
          desc: "入池多，但翻后被动，容易被诈唬或盲目跟注",
          color: "text-indigo-500",
          bg: "bg-indigo-50"
        };
      }
    }
  } else { // Tight
    if (a >= 0) { // Aggressive
      return {
        type: "⚔️ 紧凶 (TAG)",
        vpip: "VPIP 15~22%",
        desc: "紧的范围 + 激进的加注/诈唬",
        color: "text-amber-500",
        bg: "bg-amber-50"
      };
    } else { // Passive
      return {
        type: "⛰️ 岩石 (Rock)",
        vpip: "VPIP ≤15%",
        desc: "极紧，只玩顶级牌，极少诈唬",
        color: "text-emerald-600",
        bg: "bg-emerald-50"
      };
    }
  }
};

export default function App() {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState({ v: 0, a: 0, s: 0 });
  const [finished, setFinished] = useState(false);
  const [actionAnim, setActionAnim] = useState<'fold' | 'call' | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleStart = () => {
    setStarted(true);
    setCurrentIndex(0);
    setScores({ v: 0, a: 0, s: 0 });
    setFinished(false);
  };

  const handleCopy = async () => {
    const result = getResult(scores.v, scores.a, scores.s);
    const text = `我在德扑玩家类型测试中被评为：${result.type}！\n入池倾向：${result.vpip}\n特征：${result.desc}\n快来测测你是哪种玩家吧！`;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = async () => {
    if (!resultRef.current) return;
    setIsDownloading(true);
    try {
      // Add a small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(resultRef.current, {
        cacheBust: true,
        backgroundColor: '#f8fafc', // match slate-50
        pixelRatio: 2,
      });
      
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = '德扑玩家测试战报.png';
      a.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOptionClick = (option: any) => {
    if (actionAnim) return; // Prevent double clicks during animation

    const text = option.text;
    let type: 'fold' | 'call' | null = null;
    
    // Determine animation type based on option text
    if (text.includes('弃牌') || text.includes('秒弃') || text.includes('过牌')) {
      type = 'fold';
    } else if (text.includes('跟注') || text.includes('加注') || text.includes('全进') || text.includes('抓他') || text.includes('Limp') || text.includes('看看翻牌') || text.includes('搏一张')) {
      type = 'call';
      playChipSound();
    }

    setActionAnim(type);

    // Wait for animation to complete before moving to next question
    setTimeout(() => {
      setScores(prev => ({
        v: prev.v + option.v,
        a: prev.a + option.a,
        s: prev.s + option.s
      }));

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setFinished(true);
      }
      setActionAnim(null);
    }, type ? 700 : 0); // 700ms delay if there's an animation, otherwise instant
  };

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      <header className="w-full max-w-3xl mx-auto p-6 flex justify-between items-center">
        <div className="font-bold text-xl tracking-tight text-indigo-950 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            ♠
          </div>
          德扑玩家类型测试
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 text-center"
            >
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
                你是哪种德州扑克玩家？
              </h1>
              <p className="text-slate-500 mb-8 text-lg leading-relaxed max-w-xl mx-auto">
                只需 10 道题，基于 VPIP（入池率）、Aggression（激进程度）和 Stickiness（粘性）三个维度，精准测出你的牌桌风格。
              </p>
              <button
                onClick={handleStart}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-medium text-lg transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                开始测试
              </button>
            </motion.div>
          ) : !finished ? (
            <motion.div
              key={`question-${currentIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div className="mb-8">
                <div className="flex justify-between text-sm font-medium text-slate-500 mb-3">
                  <span>问题 {currentIndex + 1} / {questions.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-indigo-600 rounded-full"
                    initial={{ width: `${((currentIndex) / questions.length) * 100}%` }}
                    animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 sm:p-8 md:p-10">
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-8 leading-snug">
                  {currentQuestion.question}
                </h2>
                
                {/* Render Scenario Visualizer if available */}
                {currentQuestion.scenario && (
                  <ScenarioVisualizer scenario={currentQuestion.scenario} actionType={actionAnim} />
                )}

                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(option)}
                      disabled={actionAnim !== null}
                      className="w-full text-left p-4 md:p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all group flex items-start gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-indigo-600 flex items-center justify-center mt-0.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-slate-700 group-hover:text-indigo-950 font-medium leading-relaxed">
                        {option.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              {(() => {
                const result = getResult(scores.v, scores.a, scores.s);
                return (
                  <div className="flex flex-col gap-6">
                    <div ref={resultRef} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 text-center overflow-hidden relative">
                      <div className={`absolute top-0 left-0 w-full h-2 ${result.bg.replace('bg-', 'bg-').replace('50', '500')}`} />
                      
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 mb-6">
                        <CheckCircle2 className={`w-8 h-8 ${result.color}`} />
                      </div>
                      
                      <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-2">
                        你的测试结果
                      </h2>
                      <h3 className={`text-3xl md:text-4xl font-bold tracking-tight mb-3 ${result.color}`}>
                        {result.type}
                      </h3>
                      <div className="inline-block bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-6 border border-slate-200 shadow-sm">
                        {result.vpip}
                      </div>
                      <p className="text-slate-600 text-lg mb-10 max-w-md mx-auto">
                        {result.desc}
                      </p>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">VPIP</div>
                          <div className="text-xl font-bold text-slate-900">{scores.v > 0 ? '松' : '紧'}</div>
                          <div className="text-xs text-slate-400 mt-1">入池倾向</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">AGG</div>
                          <div className="text-xl font-bold text-slate-900">{scores.a > 0 ? '激进' : '被动'}</div>
                          <div className="text-xs text-slate-400 mt-1">激进程度</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">STICK</div>
                          <div className="text-xl font-bold text-slate-900">{scores.s >= 3 ? '高粘性' : '易弃牌'}</div>
                          <div className="text-xs text-slate-400 mt-1">跟注站指数</div>
                        </div>
                      </div>

                      {/* Watermark for image export */}
                      <div className="mt-8 pt-6 border-t border-slate-100 text-slate-400 text-xs font-medium tracking-widest uppercase opacity-80">
                        ♠ 德扑玩家类型测试
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="inline-flex flex-1 items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-4 rounded-2xl font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                      >
                        {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        生成战报图片
                      </button>
                      <button
                        onClick={handleCopy}
                        className="inline-flex flex-1 items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-4 rounded-2xl font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                      >
                        {isCopied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                        {isCopied ? '已复制' : '复制结果'}
                      </button>
                      <button
                        onClick={handleStart}
                        className="inline-flex flex-1 items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-2xl font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                      >
                        <RotateCcw className="w-5 h-5" />
                        重新测试
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

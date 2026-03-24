import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, CheckCircle2, User, Coins, Download, Copy, Check, Loader2, MapPin, Layers, BrainCircuit, Coffee } from 'lucide-react';
import { toPng } from 'html-to-image';
declare var gtag: Function;

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
          animate={
            actionType === 'fold' ? { y: 150, opacity: 0, rotate: -15, scale: 0.8 } : 
            actionType === 'raise' ? { y: -20, scale: 1.1 } :
            actionType === 'call' ? { y: -10, scale: 1.05 } :
            { y: 0, opacity: 1, rotate: 0, scale: 1 }
          }
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
        {actionType === 'raise' && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1.2, opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <div className="flex items-center gap-3 bg-slate-900/90 px-8 py-4 rounded-full border-2 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.4)]">
              <Coins className="w-8 h-8 text-red-400" />
              <span className="font-bold text-red-400 text-2xl tracking-wider">↑ RAISE</span>
            </div>
          </motion.div>
        )}
        {actionType === 'fold' && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, y: -50 }}
            animate={{ scale: 1.2, opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <div className="flex items-center gap-3 bg-slate-900/90 px-8 py-4 rounded-full border-2 border-slate-500/50 shadow-[0_0_40px_rgba(100,116,139,0.4)]">
              <span className="font-bold text-slate-400 text-2xl tracking-wider">✕ FOLD</span>
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
    question: "刚坐下还没摸清对手，拿到 K♦10♥ (K10o) 且前面没人加注，你会？",
    proDetails: { pot: 15, position: "UTG (枪口位)", stack: "1000" },
    options: [
      { text: "A. 稳健起见，直接弃牌。", v: -3, a: 0, s: 0 },
      { text: "B. 加注进入，拿下主动权。", v: 1, a: 2, s: 0 },
      { text: "C. 跟着前面的平跟玩家一起 Limp 进去看牌。", v: 2, a: -1, s: 0 }
    ]
  },
  {
    id: 2,
    question: "底池有3个溜入者，你在大盲位持 5♠7♠。大家都在等你就位看翻牌，你会？",
    proDetails: { pot: 45, position: "BB (大盲位)", stack: "1000" },
    options: [
      { text: "A. 过牌。免费看个翻牌，不中就扔（Check-Fold）。", v: 1, a: -2, s: 0 },
      { text: "B. 弃牌。即便免费也不想纠缠，我拒绝在差位置玩烂牌。", v: -2, a: 0, s: 0 },
      { text: "C. 加注挤压(Squeeze)！大尺度加注到60+，直接收走底池死钱。", v: 1, a: 3, s: 0 }
    ]
  },
  {
    id: 3,
    question: "顶对面临 Lead Bet。你持 AQ 在 Q-7-2 牌面，对手抢先下注底池的 60%，你会？",
    proDetails: { pot: 100, position: "BTN (庄位)", stack: "800" },
    scenario: {
      hand: [{r:'A',s:'♠'}, {r:'Q',s:'♥'}],
      board: [{r:'Q',s:'♦'}, {r:'7',s:'♣'}, {r:'2',s:'♠'}],
      pot: 100,
      invested: 40,
      oppAction: "下注 60"
    },
    options: [
      { text: "A. 反推加注(Raise)！牌面很干，直接拿价值并封杀对手。", v: 0, a: 2, s: 0 },
      { text: "B. 跟注(Call)。我的牌很稳，留出空间诱导对手继续诈唬。", v: 0, a: 1, s: 1 },
      { text: "C. 弃牌。对方下注尺度极具压迫感，怕他有Q7或暗三。", v: 0, a: -2, s: -1 }
    ]
  },
  {
    id: 4,
    question: "翻牌没中。持 KJ 面对 1/3 底池的“试探注”，你的真实选择是？",
    proDetails: { pot: 120, position: "CO (关位)", stack: "1200" },
    scenario: {
      hand: [{r:'K',s:'♠'}, {r:'J',s:'♠'}],
      board: [{r:'7',s:'♣'}, {r:'4',s:'♦'}, {r:'2',s:'♥'}],
      pot: 120,
      invested: 40,
      oppAction: "下注 35"
    },
    options: [
      { text: "A. 弃牌。没中就没道理跟，拒绝无效投入。", v: 0, a: 0, s: -2 },
      { text: "B. 浮动跟注(Float)。利用赔率看一注，转牌他敢示弱我就偷。", v: 0, a: 2, s: 1 },
      { text: "C. 跟注。注这么小，万一转牌发个 K 或 J 我就反超了。", v: 0, a: -1, s: 2 }
    ]
  },
  {
    id: 5,
    question: "长期游戏后，你发现哪种局面最让你感到挫败？",
    proDetails: { pot: 0, position: "N/A", stack: "N/A" },
    options: [
      { text: "A. 弃牌（Fold）：每次弃牌都觉得可能错过了一个大底池，或者觉得自己被偷了。", v: 0, a: 0, s: 2 },
      { text: "B. 面对重压（Pressure）：对手频繁的全进或超大注，让你感到决策非常痛苦。", v: 0, a: -2, s: 0 },
      { text: "C. 枯燥无味（Idle）：大家都很稳，底池都很小，没有人搞事。", v: 1, a: 2, s: 0 }
    ]
  },
  {
    id: 6,
    question: "手持 AJ 在 J-9-8-4-5 牌面（顶对），翻牌转牌你都跟了，河牌对手突然满池重注 400，你会？",
    proDetails: { pot: 400, position: "SB (小盲位)", stack: "500" },
    scenario: {
      hand: [{r:'A',s:'♠'}, {r:'J',s:'♥'}],
      board: [{r:'J',s:'♦'}, {r:'9',s:'♣'}, {r:'8',s:'♠'}, {r:'4',s:'♥'}, {r:'5',s:'♦'}],
      pot: 400,
      invested: 180,
      oppAction: "下注 400 (满池)"
    },
    options: [
      { 
        text: "A. 不信！这牌面顺子虽然多，但他很可能在偷鸡，我要抓他！", 
        v: 0, a: 0, s: 3,
        desc: "典型的粘性思维，不忍放弃顶对的价值"
      },
      { 
        text: "B. 理智弃牌：牌面太湿了，对手的范围里全是顺子和两对。", 
        v: 0, a: 0, s: -2,
        desc: "优秀的风险控制，懂得在劣势时止损"
      },
      { 
        text: "C. 根据对手形象：如果是疯子就接，如果是稳健选手就弃。", 
        v: 0, a: 1, s: 0,
        desc: "剥削型思维，决策依据于对手特征而非情绪"
      }
    ]
  },
  {
    id: 7,
    question: "在长达一小时的牌局中，你发现自己弃牌的次数？",
    proDetails: { pot: 0, position: "N/A", stack: "N/A" },
    options: [
      { text: "A. 非常多，我只玩我觉得稳赢的。", v: -2, a: 0, s: -1 },
      { text: "B. 很少，我喜欢参与其中的感觉。", v: 2, a: -1, s: 1 },
      { text: "C. 中规中矩，主要看位置和对手的漏洞出手。", v: 0, a: 1, s: 0 }
    ]
  },
  {
    id: 8,
    question: "你手持 A♣ K♦，翻牌是 7♠ 2♥ 9♣。你没中，对手突然推了全进，你会？",
    proDetails: { pot: 150, position: "MP (中位)", stack: "1500" },
    scenario: {
      hand: [{r:'A',s:'♣'}, {r:'K',s:'♦'}],
      board: [{r:'7',s:'♠'}, {r:'2',s:'♥'}, {r:'9',s:'♣'}],
      pot: 150,
      invested: 60,
      oppAction: "全进 (All-in) 800"
    },
    options: [
      { text: "A. 秒弃，没中就没道理跟。", v: 0, a: 0, s: -2 },
      { text: "B. 我有 AK，这是大牌，我要搏一张 A 或 K。", v: 1, a: -1, s: 2 }
    ],
    proVersion: {
      question: "底池 150，对方突然超额全进 800。",
      proDetails: { pot: 150, position: "MP (中位)", stack: "1500" },
      scenario: {
        hand: [{r:'A',s:'♣'}, {r:'K',s:'♦'}],
        board: [{r:'7',s:'♠'}, {r:'2',s:'♥'}, {r:'9',s:'♣'}],
        pot: 150,
        invested: 60,
        oppAction: "全进 (All-in) 800"
      },
      options: [
        { text: "A. 弃牌。800 对 150 是严重的超池溢价，底池赔率完全不支持我用 AK 高牌去搏命。", v: 0, a: 0, s: -2 },
        { text: "B. 跟注。我不信他有牌，AK 已经很大了，我不能在这种大底池里被他偷走。", v: 1, a: 0, s: 3 },
        { text: "C. 弃牌。没中对子就不接全进，这是我的打牌纪律，跟赔率无关。", v: -1, a: -1, s: -1 }
      ]
    }
  },
  {
    id: 9,
    question: "如果你连续输了三手牌，你接下来的打法是？",
    proDetails: { pot: 0, position: "N/A", stack: "N/A" },
    options: [
      { text: "A. 变得更紧，找机会回血。", v: -2, a: 0, s: 0 },
      { text: "B. 变得更松，什么牌都想进去“报仇”。", v: 2, a: 2, s: 0 }
    ]
  },
  {
    id: 10,
    question: "88 加注到 40，对手 3-bet 你到 140。他后手仅剩 300。",
    proDetails: { pot: 180, position: "UTG+1", stack: "2000" },
    scenario: {
      hand: [{r:'8',s:'♣'}, {r:'8',s:'♦'}],
      board: [],
      pot: 180,
      invested: 40,
      oppAction: "再加注到 140",
      note: "对手后手仅剩 300"
    },
    options: [
      { text: "A. 弃牌。对方后手已不足，博三条的隐含赔率完全不划算。", v: -2, a: 0, s: -2 },
      { text: "B. 跟注。既然已经投了 40，硬着头皮也要再跟 100。", v: 2, a: -1, s: 2 },
      { text: "C. 全进 (All-in)！既然他筹码不多了，我直接反推给他施加压力。", v: 1, a: 3, s: 0 }
    ]
  }
];

const getResult = (v: number, a: number, s: number) => {
  // 定义一个中性区间，防止轻微的偏差导致分类突变
  const threshold = 2; 

  // 分支 1: 松 (Loose)
  if (v > threshold) { 
    if (a > threshold) {
      return {
        type: "🔥 松凶 (LAG)",
        vpip: "VPIP 25~35%",
        desc: "宽范围 + 高频施压，难以读牌",
        color: "text-red-500",
        bg: "bg-red-50"
      }; // 典型的狂野选手
    } else {
      // 在松的象限里，靠 S (粘性) 区分鱼和松弱
      if (s >= 4) { // 提高鱼的阈值，必须足够粘才是鱼
        return {
          type: "🐟 鱼 / 跟注站",
          vpip: "VPIP >45%",
          desc: "范围极宽，喜欢跟注，很少弃牌",
          color: "text-blue-500",
          bg: "bg-blue-50"
        };
      }
      return {
        type: "🌀 松弱 (LP)",
        vpip: "VPIP 30~45%",
        desc: "入池多，但翻后被动，容易被诈唬或盲目跟注",
        color: "text-indigo-500",
        bg: "bg-indigo-50"
      };
    }
  } 
  // 分支 2: 紧 (Tight)
  else if (v < -threshold) {
    if (a > 0) {
      return {
        type: "⚔️ 紧凶 (TAG)",
        vpip: "VPIP 15~22%",
        desc: "紧的范围 + 激进的加注/诈唬",
        color: "text-amber-500",
        bg: "bg-amber-50"
      }; // 职业选手/鲨鱼
    }
    return {
      type: "⛰️ 岩石 (Rock)",
      vpip: "VPIP ≤15%",
      desc: "极紧，只玩顶级牌，极少诈唬",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    }; // 极端保守
  }
  // 分支 3: 标准/平衡型 (Balanced)
  else {
    // 如果 V 分数在 [-2, 2] 之间，说明玩得很平衡
    return {
      type: "⚖️ 均衡型 (Balanced)",
      vpip: "VPIP 20~25%",
      desc: "起手牌选择合理，不极端。具备进阶牌手的基本素质。",
      color: "text-blue-600",
      bg: "bg-blue-50"
    };
  }
};

export default function App() {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState({ v: 0, a: 0, s: 0 });
  const [finished, setFinished] = useState(false);
  const [actionAnim, setActionAnim] = useState<'fold' | 'call' | 'raise' | null>(null);
  const [proMode, setProMode] = useState(true);

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
    if (actionAnim) return; // 防止动画期间重复点击

    const text = option.text;
    let type: 'fold' | 'call' | 'raise' | null = null;
    
    // 动作类型判断
    if (text.includes('弃牌') || text.includes('秒弃') || text.includes('过牌') || text.includes('放弃') || text.includes('一枪不接')) {
      type = 'fold';
    } else if (text.includes('加注') || text.includes('反拉') || text.includes('Squeeze') || text.includes('全进')) {
      type = 'raise';
      playChipSound();
    } else if (text.includes('跟注') || text.includes('抓他') || text.includes('Limp') || text.includes('看看翻牌') || text.includes('搏一张') || text.includes('接')) {
      type = 'call';
      playChipSound();
    }

    setActionAnim(type);

    // 等待动画完成后处理数据
    setTimeout(() => {
      // 1. 计算最新总分
      const nextV = scores.v + option.v;
      const nextA = scores.a + option.a;
      const nextS = scores.s + option.s;

      setScores({ v: nextV, a: nextA, s: nextS });

      if (currentIndex < questions.length - 1) {
        // 进入下一题
        setCurrentIndex(prev => prev + 1);
      } else {
        // --- 核心埋点区：测试结束 ---
        const finalResult = getResult(nextV, nextA, nextS);
        
        if (typeof gtag === 'function') {
          gtag('event', 'test_complete', {
            'player_type': finalResult.type,
            'v_score': nextV,
            'a_score': nextA,
            's_score': nextS
          });
        }
        setFinished(true);
      }
      setActionAnim(null);
    }, type ? 700 : 0);
  }; // 这里是函数结束的括号，一定要检查是否还在

  const baseQuestion = questions[currentIndex];
  // If pro mode is on and there's a pro version, merge it in
  const currentQuestion = proMode && (baseQuestion as any).proVersion 
    ? { ...baseQuestion, ...(baseQuestion as any).proVersion } 
    : baseQuestion;
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
        {started && !finished && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">简单模式</span>
            <button
              onClick={() => setProMode(!proMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!proMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!proMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        )}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <button
                  onClick={() => {
                    setProMode(true);
                    handleStart();
                    if (typeof gtag === 'function') {
                    gtag('event', 'start_test', { 'version': 'professional' });
                    }
                  }}
                  className="flex flex-col items-center justify-center gap-4 bg-white border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 text-slate-800 p-8 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95 group"
                >
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BrainCircuit className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl mb-2 text-slate-900 group-hover:text-indigo-700">专业模式</div>
                    <div className="text-sm text-slate-500 leading-relaxed">包含底池、位置和筹码深度等详细数据，适合有经验的玩家</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setProMode(false);
                    handleStart();
                    if (typeof gtag === 'function') {
                    gtag('event', 'start_test', { 'version': 'simple' });
                    }
                  }}
                  className="flex flex-col items-center justify-center gap-4 bg-white border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 text-slate-800 p-8 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95 group"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Coffee className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl mb-2 text-slate-900 group-hover:text-emerald-700">简单模式</div>
                    <div className="text-sm text-slate-500 leading-relaxed">更直观的场景描述，无需计算赔率，适合快速测试</div>
                  </div>
                </button>
              </div>
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
                {proMode && currentQuestion.proDetails && currentQuestion.proDetails.pot !== 0 && (
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                      <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs">💰</div>
                      底池: {currentQuestion.proDetails.pot}
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      {currentQuestion.proDetails.position}
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                      <Layers className="w-4 h-4 text-amber-600" />
                      你的筹码量: {currentQuestion.proDetails.stack}
                    </div>
                  </div>
                )}
                
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-6 leading-snug whitespace-pre-wrap">
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

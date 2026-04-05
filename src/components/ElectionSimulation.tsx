import React, { useState } from 'react';
import { 
  Play, 
  Download, 
  Database, 
  Users, 
  MapPin, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileJson
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ElectionEngine, Candidate, District, ElectoralList } from '../services/electionEngine';
import { cn } from '../lib/utils';

const Card = ({ children, className, title, subtitle, key }: { children: React.ReactNode, className?: string, title?: string, subtitle?: string, key?: React.Key }) => (
  <div key={key} className={cn("bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm", className)}>
    {(title || subtitle) && (
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const Button = ({ 
  children, 
  variant = 'primary', 
  className, 
  onClick, 
  disabled,
  icon: Icon
}: { 
  children: React.ReactNode, 
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost', 
  className?: string, 
  onClick?: () => void,
  disabled?: boolean,
  icon?: any
}) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800',
    outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-600 hover:bg-slate-100'
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className
      )}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export const ElectionSimulation = () => {
  const [simulationData, setSimulationData] = useState<{
    districts: District[];
    lists: ElectoralList[];
    candidates: Candidate[];
    winners: Candidate[];
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);

  const runSimulation = () => {
    setIsSimulating(true);
    const engine = new ElectionEngine();
    
    // Artificial delay for effect
    setTimeout(() => {
      const data = engine.generateMockData();
      const winners = engine.calculateWinners(data);
      setSimulationData({ ...data, winners });
      setIsSimulating(false);
    }, 1500);
  };

  const downloadJson = () => {
    if (!simulationData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(simulationData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "jordan_election_simulation.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      <section className="text-center space-y-4 py-12 bg-slate-900 text-white rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold">محاكاة النظام الانتخابي الأردني 2024</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            توليد بيانات واقعية لـ 18 دائرة انتخابية محلية والقائمة الوطنية، مع تطبيق العتبة والكوتا وتوزيع المقاعد.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Button onClick={runSimulation} disabled={isSimulating} icon={Play}>
              {isSimulating ? 'جاري المحاكاة...' : 'بدء المحاكاة'}
            </Button>
            {simulationData && (
              <Button variant="outline" onClick={downloadJson} icon={Download} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                تحميل البيانات (JSON)
              </Button>
            )}
          </div>
        </div>
      </section>

      {simulationData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="text-indigo-600" />
              الدوائر المحلية (97 مقعداً)
            </h2>
            
            {simulationData.districts.map(district => (
              <Card key={district.id} className="border-slate-200">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedDistrict(expandedDistrict === district.id ? null : district.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                      {district.seats}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{district.name}</h3>
                      <p className="text-sm text-slate-500">إجمالي الأصوات: {district.totalVotes.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-400">العتبة (7%)</p>
                      <p className="text-sm font-bold text-indigo-600">{(district.totalVotes * 0.07).toLocaleString()}</p>
                    </div>
                    {expandedDistrict === district.id ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedDistrict === district.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 mt-6 border-t border-slate-100 space-y-4">
                        <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider">القوائم المترشحة</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {simulationData.lists.filter(l => l.districtId === district.id).map(list => {
                            const passed = list.votes >= district.totalVotes * 0.07;
                            const listWinners = simulationData.winners.filter(w => w.listId === list.id);
                            
                            return (
                              <div key={list.id} className={cn("p-4 rounded-xl border", passed ? "border-emerald-100 bg-emerald-50/30" : "border-slate-100 bg-slate-50/30 opacity-60")}>
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-bold text-slate-900">{list.name}</h5>
                                  {passed ? (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">تجاوز العتبة</span>
                                  ) : (
                                    <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold">لم يتجاوز</span>
                                  )}
                                </div>
                                <div className="flex justify-between text-sm mb-3">
                                  <span className="text-slate-500">الأصوات: {list.votes.toLocaleString()}</span>
                                  <span className="font-bold text-indigo-600">{listWinners.length} مقاعد</span>
                                </div>
                                {listWinners.length > 0 && (
                                  <div className="space-y-1">
                                    {listWinners.map(winner => (
                                      <div key={winner.id} className="flex items-center gap-2 text-xs bg-white p-2 rounded-lg border border-emerald-100">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                        <span className="font-bold">{winner.name}</span>
                                        {winner.gender === 'Female' && <span className="text-pink-500 font-bold">(كوتا)</span>}
                                        {winner.religion !== 'Muslim' && <span className="text-amber-600 font-bold">({winner.religion})</span>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" />
              القائمة الوطنية (41 مقعداً)
            </h2>
            
            <Card title="الأحزاب الفائزة" subtitle="توزيع المقاعد على القوائم الحزبية">
              <div className="space-y-4">
                {simulationData.lists.filter(l => l.isNational).sort((a, b) => b.votes - a.votes).map(party => {
                  const partyWinners = simulationData.winners.filter(w => w.listId === party.id);
                  if (partyWinners.length === 0) return null;

                  return (
                    <div key={party.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-indigo-600">{party.partyName}</h4>
                        <span className="text-lg font-bold">{partyWinners.length}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3">
                        <div className="bg-indigo-600 h-full" style={{ width: `${(partyWinners.length / 41) * 100}%` }} />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {partyWinners.slice(0, 3).map(w => (
                          <span key={w.id} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md">{w.name}</span>
                        ))}
                        {partyWinners.length > 3 && <span className="text-[10px] text-slate-400">+{partyWinners.length - 3} آخرين</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="إحصائيات الفائزين" subtitle="تحليل ديموغرافي للمجلس المحاكى">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><Users size={18} /></div>
                    <span className="font-medium">سيدات</span>
                  </div>
                  <span className="font-bold text-lg">{simulationData.winners.filter(w => w.gender === 'Female').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Database size={18} /></div>
                    <span className="font-medium">مقاعد الكوتا (مسيحي/شركس)</span>
                  </div>
                  <span className="font-bold text-lg">{simulationData.winners.filter(w => w.religion !== 'Muslim').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><TrendingUp size={18} /></div>
                    <span className="font-medium">شباب (تحت 35)</span>
                  </div>
                  <span className="font-bold text-lg">{simulationData.winners.filter(w => w.isYouth).length}</span>
                </div>
              </div>
            </Card>

            <Button variant="outline" className="w-full py-4" onClick={() => setShowJson(!showJson)} icon={FileJson}>
              {showJson ? 'إخفاء كود JSON' : 'عرض كود JSON'}
            </Button>
          </div>
        </div>
      )}

      {showJson && simulationData && (
        <Card title="البيانات الهيكلية (JSON Output)" subtitle="كامل بيانات المحاكاة بصيغة JSON">
          <pre className="bg-slate-900 text-indigo-300 p-6 rounded-xl overflow-auto max-h-[600px] text-xs font-mono" dir="ltr">
            {JSON.stringify(simulationData, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Vote, 
  Shield, 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Fingerprint, 
  Smartphone, 
  ScanFace, 
  FileText, 
  ChevronRight, 
  Lock, 
  Eye, 
  EyeOff,
  Search,
  Menu,
  X,
  Clock,
  MapPin,
  TrendingUp,
  Cpu,
  Activity,
  History,
  Download,
  ExternalLink,
  RefreshCw,
  Trash2,
  Edit2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { cn } from './lib/utils';
import { MOCK_ELECTION, MOCK_TRANSACTIONS, MOCK_PARTIES, MOCK_LOCAL_LISTS } from './mockData';
import { Election, Candidate, Voter, BlockchainTransaction, District, Party, LocalList } from './types';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc,
  updateDoc, 
  increment, 
  Timestamp,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  deleteDoc,
  getDocs
} from 'firebase/firestore';

// --- Components ---

const Card = ({ children, className, title, subtitle }: { children: React.ReactNode, className?: string, title?: string, subtitle?: string, key?: React.Key }) => (
  <div className={cn("bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm", className)}>
    {(title || subtitle) && (
      <div className="px-6 py-4 border-bottom border-slate-100 bg-slate-50/50">
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

const Badge = ({ children, variant = 'info', className }: { children: React.ReactNode, variant?: 'success' | 'warning' | 'error' | 'info' | 'secondary', className?: string }) => {
  const variants = {
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200'
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold border", variants[variant], className)}>
      {children}
    </span>
  );
};

// --- Portals ---

const PublicPortal = ({ election, candidates, districts, transactions, loading }: { 
  election: Election | null, 
  candidates: Candidate[], 
  districts: District[], 
  transactions: BlockchainTransaction[],
  loading: boolean
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  const filteredCandidates = useMemo(() => {
    if (selectedDistrict === 'all') return candidates;
    return candidates.filter(c => c.districtId === selectedDistrict);
  }, [selectedDistrict, candidates]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!election) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      <section className="text-center space-y-4 py-12 bg-indigo-900 text-white rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10">
          <Badge variant="info">مشروع وطني سيادي</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mt-4">{election.title}</h1>
          <p className="text-indigo-200 max-w-2xl mx-auto text-lg">
            {election.description}
          </p>
        </div>
      </section>

      {/* Live Ticker */}
      <div className="bg-indigo-50 border-y border-indigo-100 py-2 overflow-hidden whitespace-nowrap">
        <motion.div 
          className="inline-block"
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <div className="flex gap-12 items-center text-sm font-medium text-indigo-700">
            <span>• تم تسجيل صوت جديد في الدائرة الأولى (0x82f...a1)</span>
            <span>• نسبة المشاركة في المنطقة الشمالية تتجاوز 45%</span>
            <span>• اكتمال مزامنة الكتلة رقم 1,245,012 بنجاح</span>
            <span>• نظام ZKP يعمل بكفاءة 100% في جميع الدوائر</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2" title="النتائج الحية" subtitle="تحديث لحظي لفرز الأصوات">
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            <button 
              onClick={() => setSelectedDistrict('all')}
              className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all", selectedDistrict === 'all' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
            >
              الكل
            </button>
            {districts.map(d => (
              <button 
                key={d.id}
                onClick={() => setSelectedDistrict(d.id)}
                className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap", selectedDistrict === d.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
              >
                {d.name}
              </button>
            ))}
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredCandidates}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="votes" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="توزيع الأصوات" subtitle="النسبة المئوية للمرشحين">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={candidates}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="votes"
                >
                  {candidates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {candidates.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-700 font-medium">{c.name}</span>
                </div>
                <span className="text-slate-500">{((c.votes / (election.totalVotes || 1)) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'إجمالي الأصوات', value: election.totalVotes.toLocaleString(), icon: Vote, color: 'text-indigo-600' },
          { label: 'نسبة المشاركة', value: `${((election.totalVotes / election.registeredVoters) * 100).toFixed(1)}%`, icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'الكتلة الناخبة', value: election.registeredVoters.toLocaleString(), icon: Users, color: 'text-blue-600' },
          { label: 'حالة النظام', value: 'آمن / متصل', icon: Shield, color: 'text-indigo-600' }
        ].map((stat, i) => (
          <Card key={i} className="flex flex-col items-center text-center p-8">
            <div className={cn("p-3 rounded-2xl bg-slate-50 mb-4", stat.color)}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h4>
          </Card>
        ))}
      </div>

      <Card title="Blockchain Explorer" subtitle="سجل العمليات غير القابل للتعديل">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="text-slate-500 text-sm border-b border-slate-100">
                <th className="pb-4 font-medium">العملية (Hash)</th>
                <th className="pb-4 font-medium">رقم الكتلة</th>
                <th className="pb-4 font-medium">التوقيت</th>
                <th className="pb-4 font-medium">إثبات ZKP</th>
                <th className="pb-4 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((tx) => (
                <tr key={tx.hash} className="text-sm hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-mono text-indigo-600">0x{tx.hash.substring(0, 12)}...</td>
                  <td className="py-4 text-slate-600">{tx.blockNumber}</td>
                  <td className="py-4 text-slate-500">{new Date(tx.timestamp).toLocaleTimeString('ar-EG')}</td>
                  <td className="py-4 font-mono text-xs text-slate-400">{tx.zkpProof.substring(0, 15)}...</td>
                  <td className="py-4">
                    <Badge variant="success">مؤكد</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-center">
          <Button variant="outline" icon={RefreshCw}>تحديث السجل</Button>
        </div>
      </Card>
    </div>
  );
};

const VoterPortal = ({ user, userProfile, onVoteSuccess, election, candidates, districts, parties, localLists, loading, onLogin }: { 
  user: FirebaseUser | null, 
  userProfile: any, 
  onVoteSuccess: () => void,
  election: Election | null,
  candidates: Candidate[],
  districts: District[],
  parties: Party[],
  localLists: LocalList[],
  loading: boolean,
  onLogin: () => void
}) => {
  const [step, setStep] = useState<'login' | 'id-upload' | 'verify' | 'otp' | 'district-selection' | 'local-ballot' | 'general-ballot' | 'zkp' | 'success'>('login');
  const [nationalId, setNationalId] = useState('');
  const [voterDistrict, setVoterDistrict] = useState<{ id: string, name: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGeneratingZKP, setIsGeneratingZKP] = useState(false);
  const [selectedLocalList, setSelectedLocalList] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [selectedParty, setSelectedParty] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.hasVoted) {
      setStep('success');
    }
  }, [userProfile]);

  const handleLogin = async () => {
    const cleanId = nationalId.trim().replace(/\D/g, '');
    if (cleanId.length >= 5) {
      setIsVerifying(true);
      try {
        const voterDoc = await getDoc(doc(db, 'voters_registry', cleanId));
        if (voterDoc.exists()) {
          const voterData = voterDoc.data();
          
          if (voterData.hasVoted) {
            alert("لقد قمت بالتصويت مسبقاً في هذه الانتخابات. لا يمكنك التصويت مرتين.");
            return;
          }

          // Find the district ID from the elections districts list
          const district = districts.find(d => 
            d.name.trim().toLowerCase() === voterData.districtName.trim().toLowerCase() ||
            voterData.districtName.trim().includes(d.name.trim()) ||
            d.name.trim().includes(voterData.districtName.trim())
          );
          
          setVoterDistrict({ 
            id: district?.id || 'auto-generated', 
            name: voterData.districtName 
          });
          
          // Save nationalId to user profile in Firestore
          if (user) {
            await updateDoc(doc(db, 'users', user.uid), { nationalId: cleanId });
          }
          
          setStep('id-upload');
        } else {
          // Removed hardcoded demo IDs (1111111111, 2222222222)
          alert("الرقم الوطني غير مسجل في كشوفات الناخبين. يرجى مراجعة اللجنة العليا أو التأكد من رفع ملف سجل الناخبين الصحيح من لوحة التحكم.");
        }
      } catch (error) {
        console.error("Voter verification failed:", error);
        alert("حدث خطأ أثناء التحقق من الرقم الوطني.");
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleIdUpload = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep('verify');
    }, 1500);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep('otp');
    }, 2000);
  };

  const handleVote = async () => {
    if (!selectedParty || !user || !election) return;

    // Check if we are using mock data
    if (election.id === 'e1' || election.id === 'election-2025') {
      alert("عذراً، لا يمكن التصويت على البيانات التجريبية. يرجى تهيئة النظام من لوحة تحكم المشرف أولاً.");
      return;
    }

    setStep('zkp');
    setIsGeneratingZKP(true);

    try {
      // Simulate ZKP generation delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      const voteId = doc(collection(db, 'votes')).id;
      const voteData = {
        electionId: election.id,
        candidateId: selectedCandidate || 'none',
        listId: selectedLocalList || 'none',
        partyId: selectedParty,
        districtId: voterDistrict?.id || userProfile?.districtId || 'district-1',
        districtName: voterDistrict?.name || 'غير محدد',
        timestamp: serverTimestamp(),
        zkpProof: `zkp_${Math.random().toString(36).substring(2, 15)}`,
        encryptedVote: `enc_${Math.random().toString(36).substring(2, 15)}`
      };

      const batch = writeBatch(db);
      
      // 1. Record the vote (anonymized)
      batch.set(doc(db, 'votes', voteId), voteData);
      
      // 2. Mark user as voted
      batch.update(doc(db, 'users', user.uid), { hasVoted: true });
      
      // 2.5 Mark national ID as voted in registry
      batch.update(doc(db, 'voters_registry', nationalId), { hasVoted: true });
      
      // 3. Increment candidate votes if selected
      if (selectedCandidate) {
        batch.update(doc(db, 'elections', election.id, 'candidates', selectedCandidate), {
          votes: increment(1)
        });
      }

      // 4. Increment party votes
      batch.update(doc(db, 'elections', election.id, 'parties', selectedParty), {
        votes: increment(1)
      });
      
      // 5. Increment election total votes
      batch.update(doc(db, 'elections', election.id), {
        totalVotes: increment(1)
      });

      await batch.commit();

      setIsGeneratingZKP(false);
      setStep('success');
      onVoteSuccess();
    } catch (error) {
      console.error("Voting failed:", error);
      setIsGeneratingZKP(false);
      alert("فشل تسجيل التصويت. يرجى المحاولة مرة أخرى. " + (error instanceof Error ? error.message : ""));
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6" dir="rtl">
        <Card className="p-12">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">بوابة الناخب الآمنة</h2>
          <p className="text-slate-500 mb-8">يرجى تسجيل الدخول باستخدام حسابك الوطني الموحد للوصول إلى بوابة التصويت.</p>
          <Button className="w-full py-4 text-lg" onClick={onLogin}>
            تسجيل الدخول للمتابعة
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12" dir="rtl">
      <AnimatePresence mode="wait">
        {step === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Fingerprint size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">تسجيل دخول الناخب</h2>
              <p className="text-slate-500">يرجى إدخال الرقم الوطني المكون من 10 أرقام للمتابعة.</p>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="الرقم الوطني" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-center text-xl tracking-widest"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value.replace(/\D/g, '').substring(0, 10))}
                />
                <Button className="w-full py-4 text-lg" onClick={handleLogin} disabled={nationalId.length !== 10 || isVerifying}>
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="animate-spin" size={20} />
                      جاري التحقق...
                    </div>
                  ) : 'تحقق من الأهلية'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 'id-upload' && (
          <motion.div
            key="id-upload"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Card className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">رفع الهوية الوطنية</h2>
              <p className="text-slate-500">يرجى رفع صورة واضحة للهوية الوطنية للتحقق التلقائي (OCR).</p>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 hover:border-indigo-400 transition-all cursor-pointer group">
                <Download size={48} className="mx-auto text-slate-300 group-hover:text-indigo-400 mb-4" />
                <p className="text-slate-400 font-medium">اسحب الصورة هنا أو اضغط للاختيار</p>
              </div>
              <Button className="w-full py-4" onClick={handleIdUpload} disabled={isVerifying}>
                {isVerifying ? 'جاري قراءة البيانات...' : 'تأكيد الرفع'}
              </Button>
            </Card>
          </motion.div>
        )}

        {step === 'verify' && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <Card className="p-8 text-center space-y-6">
              <div className="relative w-48 h-48 mx-auto">
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-2xl animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden">
                  <ScanFace size={80} className="text-slate-300" />
                  {isVerifying && (
                    <motion.div 
                      className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.8)]"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">التحقق البيومتري</h2>
              <p className="text-slate-500">جاري مطابقة ملامح الوجه مع صورة الهوية الوطنية.</p>
              <Button 
                className="w-full py-4" 
                onClick={handleVerify} 
                disabled={isVerifying}
                icon={isVerifying ? RefreshCw : ScanFace}
              >
                {isVerifying ? 'جاري التحقق...' : 'بدء المسح الضوئي'}
              </Button>
            </Card>
          </motion.div>
        )}

        {step === 'otp' && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Card className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">رمز التحقق (OTP)</h2>
              <p className="text-slate-500">تم إرسال رمز مكون من 6 أرقام إلى هاتفك المسجل ينتهي بـ ****092</p>
              <div className="flex gap-2 justify-center" dir="ltr">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <input 
                    key={i}
                    type="text" 
                    maxLength={1}
                    className="w-12 h-14 text-center text-2xl font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ))}
              </div>
              <Button className="w-full py-4" onClick={() => setStep('district-selection')}>
                تأكيد الدخول
              </Button>
              <button className="text-sm text-indigo-600 font-medium hover:underline">إعادة إرسال الرمز</button>
            </Card>
          </motion.div>
        )}

        {step === 'district-selection' && (
          <motion.div
            key="district-selection"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <Card className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">تأكيد الدائرة الانتخابية</h2>
              <p className="text-slate-500">بناءً على مكان إقامتك المسجل، دائرتك الانتخابية هي:</p>
              <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-900">{voterDistrict?.name || 'جاري التحميل...'}</h3>
              </div>
              <Button className="w-full py-4 text-lg" onClick={() => setStep('local-ballot')}>
                الانتقال لورقة الاقتراع المحلية
              </Button>
            </Card>
          </motion.div>
        )}

        {step === 'local-ballot' && (
          <motion.div
            key="local-ballot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <Badge variant="info">ورقة الاقتراع المحلية</Badge>
              <h2 className="text-2xl font-bold text-slate-900">قائمة نسبية مفتوحة</h2>
              <p className="text-slate-500 text-sm">اختر قائمة واحدة، ثم اختر مرشحيك المفضلين داخلها.</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-700">القوائم المحلية في دائرتك:</h3>
              <div className="grid grid-cols-1 gap-3">
                {localLists.filter(l => l.districtId === voterDistrict?.id || voterDistrict?.id === 'auto-generated').length > 0 ? (
                  localLists.filter(l => l.districtId === voterDistrict?.id || voterDistrict?.id === 'auto-generated').map((list) => (
                    <div key={list.id} className="space-y-3">
                      <div 
                        onClick={() => setSelectedLocalList(selectedLocalList === list.id ? null : list.id)}
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between",
                          selectedLocalList === list.id 
                            ? "border-indigo-600 bg-indigo-50/50 shadow-sm" 
                            : "border-slate-100 bg-white hover:border-slate-200"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                            {list.name[0]}
                          </div>
                          <h4 className="font-bold text-slate-900">{list.name}</h4>
                        </div>
                        <ChevronRight className={cn("transition-transform", selectedLocalList === list.id ? "rotate-90" : "")} />
                      </div>

                      <AnimatePresence>
                        {selectedLocalList === list.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pr-4 space-y-2"
                          >
                            {candidates.filter(c => c.listId === list.id).length > 0 ? (
                              candidates.filter(c => c.listId === list.id).map((candidate) => (
                                <div 
                                  key={candidate.id}
                                  onClick={() => setSelectedCandidate(selectedCandidate === candidate.id ? null : candidate.id)}
                                  className={cn(
                                    "p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3",
                                    selectedCandidate === candidate.id 
                                      ? "border-indigo-400 bg-white shadow-sm" 
                                      : "border-slate-100 bg-slate-50/50 hover:bg-white"
                                  )}
                                >
                                  <img src={candidate.image} alt={candidate.name} className="w-10 h-10 rounded-lg object-cover" />
                                  <span className="text-sm font-medium text-slate-700">{candidate.name}</span>
                                  {selectedCandidate === candidate.id && (
                                    <CheckCircle2 size={16} className="text-indigo-600 mr-auto" />
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-slate-500 text-sm italic">
                                لا يوجد مرشحين في هذه القائمة حالياً.
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-slate-600 font-medium">لا توجد قوائم محلية مسجلة في دائرتك حالياً.</p>
                    <p className="text-slate-400 text-xs mt-1">يرجى مراجعة اللجنة العليا للانتخابات.</p>
                  </div>
                )}
              </div>
            </div>

            <Button 
              className="w-full py-4 text-lg" 
              disabled={!selectedLocalList}
              onClick={() => setStep('general-ballot')}
            >
              التالي: ورقة الاقتراع العامة
            </Button>
          </motion.div>
        )}

        {step === 'general-ballot' && (
          <motion.div
            key="general-ballot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <Badge variant="warning">ورقة الاقتراع العامة</Badge>
              <h2 className="text-2xl font-bold text-slate-900">قائمة نسبية مغلقة</h2>
              <p className="text-slate-500 text-sm">اختر حزباً واحداً فقط من القائمة الوطنية.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {parties.map((party) => (
                <div 
                  key={party.id}
                  onClick={() => setSelectedParty(party.id)}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-4 text-center relative",
                    selectedParty === party.id 
                      ? "border-indigo-600 bg-indigo-50/50 shadow-lg" 
                      : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <img src={party.logo} alt={party.name} className="w-20 h-20 rounded-2xl object-contain bg-slate-50 p-2" />
                  <h4 className="font-bold text-slate-900 text-sm">{party.name}</h4>
                  {selectedParty === party.id && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button 
              className="w-full py-4 text-lg" 
              disabled={!selectedParty}
              onClick={handleVote}
            >
              تأكيد التصويت النهائي
            </Button>
            <button onClick={() => setStep('local-ballot')} className="w-full text-sm text-slate-500 hover:text-indigo-600">العودة للورقة المحلية</button>
          </motion.div>
        )}

        {step === 'zkp' && (
          <motion.div
            key="zkp"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-8 text-center space-y-6">
              <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <Cpu size={50} className="animate-spin-slow" />
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">توليد إثبات المعرفة الصفرية (ZKP)</h2>
              <p className="text-slate-500">جاري تشفير صوتك وتوليد Proof يضمن شرعية التصويت دون كشف هويتك.</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-indigo-600 h-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                />
              </div>
              <p className="text-xs font-mono text-slate-400">Generating zk-SNARK proof...</p>
            </Card>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-8 text-center space-y-6">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={50} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">تم تسجيل صوتك بنجاح!</h2>
              <p className="text-slate-500">تم تشفير صوتك وتسجيله على الـ Blockchain الوطني. هويتك محمية ولا يمكن ربطها بالصوت.</p>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-right space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">رقم الإيصال الرقمي</span>
                  <span className="font-mono text-xs text-indigo-600">NEVS-2025-AX92-K01</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">وقت التسجيل</span>
                  <span className="text-xs text-slate-700">{new Date().toLocaleString('ar-EG')}</span>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    هذا الإيصال يثبت أن صوتك قد تم تضمينه في الفرز النهائي. يمكنك استخدامه للتحقق من صحة تسجيل الصوت عبر البوابة العامة.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" icon={Download}>تحميل الإيصال</Button>
                <Button variant="primary" className="flex-1" onClick={() => window.location.reload()}>العودة للرئيسية</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminDashboard = ({ userProfile, parties, localLists }: { userProfile: any, parties: Party[], localLists: LocalList[] }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'elections' | 'candidates' | 'districts' | 'voters'>('overview');
  const [elections, setElections] = useState<Election[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newElection, setNewElection] = useState({ title: '', description: '', startDate: '', endDate: '' });
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [candidateForm, setCandidateForm] = useState({ name: '', partyId: '', image: '', districtId: '', listId: '', program: '' });
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [districtForm, setDistrictForm] = useState({ name: '', voterCount: 0 });
  const [isUploadingVoters, setIsUploadingVoters] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleVoterFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElectionId) return;

    setIsUploadingVoters(true);
    setUploadProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: async (results) => {
        const voters = results.data as any[];
        const total = voters.length;
        const batchSize = 500;
        const districtCounts: Record<string, number> = {};

        try {
          for (let i = 0; i < total; i += batchSize) {
            const batch = writeBatch(db);
            const chunk = voters.slice(i, i + batchSize);
            
            chunk.forEach((voter) => {
              // Robust header detection
              const keys = Object.keys(voter);
              const idKey = keys.find(k => {
                const normalized = k.toLowerCase().replace(/[\s_]/g, '');
                return normalized === 'nationalid' || normalized === 'id' || normalized === 'الرقم_الوطني' || normalized === 'الرقم_القومي';
              });
              const nameKey = keys.find(k => {
                const normalized = k.toLowerCase().replace(/[\s_]/g, '');
                return normalized === 'name' || normalized === 'fullname' || normalized === 'الاسم' || normalized === 'الاسم_الكامل';
              });
              const districtKey = keys.find(k => {
                const normalized = k.toLowerCase().replace(/[\s_]/g, '');
                return normalized === 'districtname' || normalized === 'district' || normalized === 'الدائرة' || normalized === 'اسم_الدائرة';
              });

              const rawId = idKey ? String(voter[idKey]) : '';
              
              // Handle scientific notation (e.g., 1.11E+09) from Excel CSVs
              let nId = rawId.trim();
              if (nId.toUpperCase().includes('E+')) {
                const num = Number(nId);
                if (!isNaN(num)) {
                  nId = num.toLocaleString('fullwide', {useGrouping:false});
                }
              }
              
              nId = nId.replace(/\D/g, '');
              
              if (!nId || nId.length < 5) return; // Basic validation
              
              const vName = nameKey ? String(voter[nameKey]).trim() : 'مواطن';
              const dName = districtKey ? String(voter[districtKey]).trim() : 'غير محدد';
              
              const voterRef = doc(db, 'voters_registry', nId);
              batch.set(voterRef, {
                nationalId: nId,
                name: vName,
                districtName: dName,
                electionId: selectedElectionId,
                hasVoted: false
              });

              // Track counts per district
              const trimmedDName = dName.trim();
              districtCounts[trimmedDName] = (districtCounts[trimmedDName] || 0) + 1;
            });

            await batch.commit();
            setUploadProgress(Math.round(((i + chunk.length) / total) * 100));
          }

          // Update districts in Firestore
          const districtBatch = writeBatch(db);
          for (const [dName, count] of Object.entries(districtCounts)) {
            // Find if district exists
            const existingDistrict = districts.find(d => d.name.trim() === dName.trim());
            if (existingDistrict) {
              districtBatch.update(doc(db, 'elections', selectedElectionId, 'districts', existingDistrict.id), {
                voterCount: count
              });
            } else {
              const newDRef = doc(collection(db, 'elections', selectedElectionId, 'districts'));
              districtBatch.set(newDRef, {
                name: dName.trim(),
                voterCount: count
              });
            }
          }
          await districtBatch.commit();

          alert(`تم رفع ${total} ناخب بنجاح وتحديث إحصائيات الدوائر.`);
        } catch (error) {
          console.error("Voter upload failed:", error);
          alert("فشل رفع سجل الناخبين.");
        } finally {
          setIsUploadingVoters(false);
          setUploadProgress(0);
        }
      }
    });
  };

  const handleSaveCandidate = async () => {
    if (!selectedElectionId) return;
    if (!candidateForm.name || !candidateForm.partyId) {
      alert("يرجى ملء الحقول الأساسية (الاسم والحزب)");
      return;
    }

    try {
      if (editingCandidate) {
        await updateDoc(doc(db, 'elections', selectedElectionId, 'candidates', editingCandidate.id), candidateForm);
      } else {
        const newCandidateRef = doc(collection(db, 'elections', selectedElectionId, 'candidates'));
        await setDoc(newCandidateRef, {
          ...candidateForm,
          votes: 0
        });
      }
      setShowCandidateModal(false);
      setEditingCandidate(null);
      setCandidateForm({ name: '', partyId: '', image: '', districtId: '', listId: '', program: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `elections/${selectedElectionId}/candidates`);
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (!selectedElectionId || !confirm("هل أنت متأكد من حذف هذا المرشح؟")) return;
    try {
      await deleteDoc(doc(db, 'elections', selectedElectionId, 'candidates', candidateId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `elections/${selectedElectionId}/candidates/${candidateId}`);
    }
  };

  const toggleElectionStatus = async (electionId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      const batch = writeBatch(db);
      
      // If we are activating this one, deactivate all others to avoid confusion
      if (newStatus === 'active') {
        elections.forEach(e => {
          if (e.id !== electionId && e.status === 'active') {
            batch.update(doc(db, 'elections', e.id), { status: 'closed' });
          }
        });
      }
      
      batch.update(doc(db, 'elections', electionId), { status: newStatus });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `elections/${electionId}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'elections'), (snapshot) => {
      const electionData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setElections(electionData);
      if (electionData.length > 0 && !selectedElectionId) {
        setSelectedElectionId(electionData[0].id);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'elections');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedElectionId]);

  useEffect(() => {
    if (!selectedElectionId) return;

    const unsubCandidates = onSnapshot(collection(db, 'elections', selectedElectionId, 'candidates'), (snapshot) => {
      setCandidates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `elections/${selectedElectionId}/candidates`);
    });

    const unsubDistricts = onSnapshot(collection(db, 'elections', selectedElectionId, 'districts'), (snapshot) => {
      setDistricts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `elections/${selectedElectionId}/districts`);
    });

    return () => {
      unsubCandidates();
      unsubDistricts();
    };
  }, [selectedElectionId]);

  const handleSaveDistrict = async () => {
    if (!selectedElectionId || !districtForm.name) return;
    
    try {
      if (editingDistrict) {
        await updateDoc(doc(db, 'elections', selectedElectionId, 'districts', editingDistrict.id), {
          name: districtForm.name,
          voterCount: districtForm.voterCount
        });
      } else {
        await addDoc(collection(db, 'elections', selectedElectionId, 'districts'), {
          name: districtForm.name,
          voterCount: districtForm.voterCount
        });
      }
      setShowDistrictModal(false);
      setEditingDistrict(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `elections/${selectedElectionId}/districts`);
    }
  };

  const handleDeleteDistrict = async (districtId: string) => {
    try {
      await deleteDoc(doc(db, 'elections', selectedElectionId!, 'districts', districtId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `elections/${selectedElectionId}/districts/${districtId}`);
    }
  };

  const handleCreateElection = async () => {
    if (!newElection.title || !newElection.startDate || !newElection.endDate) return;

    try {
      const electionRef = doc(collection(db, 'elections'));
      await setDoc(electionRef, {
        ...newElection,
        status: 'active',
        totalVotes: 0,
        registeredVoters: 100000, // Mock
        createdAt: Timestamp.now()
      });

      // Seed some mock districts and candidates for this new election
      const districts = ['العاصمة', 'المنطقة الشمالية', 'المنطقة الجنوبية'];
      for (const dName of districts) {
        const dRef = doc(collection(db, 'elections', electionRef.id, 'districts'));
        await setDoc(dRef, { name: dName });
        
        // Add a candidate for each district
        const cRef = doc(collection(db, 'elections', electionRef.id, 'candidates'));
        await setDoc(cRef, {
          name: `مرشح ${dName}`,
          party: 'حزب الوفاق الوطني',
          image: `https://picsum.photos/seed/${dName}/200/200`,
          votes: 0,
          districtId: dRef.id
        });
      }

      setShowCreateModal(false);
      setNewElection({ title: '', description: '', startDate: '', endDate: '' });
    } catch (error) {
      console.error("Failed to create election:", error);
      alert("فشل إنشاء الانتخابات.");
    }
  };

  useEffect(() => {
    // We removed auto-seed to avoid confusing the user with automatic confirmation dialogs.
    // They can use the "Reset and Seed Data" button manually.
  }, [loading, elections.length, userProfile]);

  const seedInitialData = async () => {
    console.log("seedInitialData called");
    const confirmReset = window.confirm("تحذير: سيتم حذف كافة البيانات الحالية (الانتخابات، الناخبين، الأصوات) وإعادة تهيئة النظام ببيانات جديدة. هل أنت متأكد؟");
    if (!confirmReset) return;
    
    setIsSeeding(true);
    console.log("Starting hard reset and seed...");
    try {
      // 1. Clear Existing Data
      const collectionsToClear = ['elections', 'voters_registry', 'votes'];
      
      for (const colName of collectionsToClear) {
        console.log(`Clearing collection: ${colName}`);
        const snapshot = await getDocs(collection(db, colName));
        let batch = writeBatch(db);
        let count = 0;
        
        for (const docSnap of snapshot.docs) {
          // If it's elections, we also need to clear subcollections
          if (colName === 'elections') {
            const subcols = ['candidates', 'districts', 'parties', 'local_lists'];
            for (const sub of subcols) {
              const subSnap = await getDocs(collection(db, 'elections', docSnap.id, sub));
              for (const sDoc of subSnap.docs) {
                batch.delete(sDoc.ref);
                count++;
                if (count >= 400) {
                  await batch.commit();
                  batch = writeBatch(db);
                  count = 0;
                }
              }
            }
          }
          batch.delete(docSnap.ref);
          count++;
          if (count >= 400) {
            await batch.commit();
            batch = writeBatch(db);
            count = 0;
          }
        }
        if (count > 0) {
          await batch.commit();
        }
      }

      console.log("Data cleared. Starting seeding...");

      // 2. Seed New Data
      const batch = writeBatch(db);
      
      // 1. Create Election Document
      const electionId = doc(collection(db, 'elections')).id;
      const electionRef = doc(db, 'elections', electionId);
      
      const electionData = {
        title: MOCK_ELECTION.title,
        description: MOCK_ELECTION.description,
        status: 'active',
        totalVotes: 0,
        registeredVoters: MOCK_ELECTION.registeredVoters,
        startDate: MOCK_ELECTION.startDate,
        endDate: MOCK_ELECTION.endDate,
        createdAt: serverTimestamp()
      };
      
      batch.set(electionRef, electionData);
      console.log(`Election created: ${electionId}`);

      // 2. Create Districts
      for (const district of MOCK_ELECTION.districts) {
        const dRef = doc(db, 'elections', electionId, 'districts', district.id);
        batch.set(dRef, { 
          name: district.name,
          voterCount: district.voterCount 
        });
      }
      console.log("Districts seeded.");

      // 3. Create Candidates
      for (const candidate of MOCK_ELECTION.candidates) {
        const cRef = doc(db, 'elections', electionId, 'candidates', candidate.id);
        batch.set(cRef, {
          name: candidate.name,
          partyId: candidate.partyId,
          image: candidate.image,
          votes: 0,
          districtId: candidate.districtId,
          listId: candidate.listId,
          program: candidate.program || ''
        });
      }
      console.log("Candidates seeded.");

      // 3.5 Create Parties
      for (const party of MOCK_PARTIES) {
        const pRef = doc(db, 'elections', electionId, 'parties', party.id);
        batch.set(pRef, {
          name: party.name,
          logo: party.logo,
          votes: 0
        });
      }
      console.log("Parties seeded.");

      // 3.6 Create Local Lists
      for (const list of MOCK_LOCAL_LISTS) {
        const lRef = doc(db, 'elections', electionId, 'local_lists', list.id);
        batch.set(lRef, {
          name: list.name,
          districtId: list.districtId,
          votes: 0
        });
      }
      console.log("Local lists seeded.");

      // 4. Create Initial Voters in Registry
      const initialVoters = [
        { nationalId: '1111111111', name: 'أحمد محمد', districtName: 'العاصمة - المنطقة الأولى' },
        { nationalId: '2222222222', name: 'سارة علي', districtName: 'المنطقة الشمالية' },
        { nationalId: '3333333333', name: 'محمود حسن', districtName: 'المنطقة الساحلية' },
        { nationalId: '4444444444', name: 'ليلى إبراهيم', districtName: 'المنطقة الجنوبية' }
      ];
      for (const voter of initialVoters) {
        const vRef = doc(db, 'voters_registry', voter.nationalId);
        batch.set(vRef, {
          ...voter,
          electionId: electionId,
          hasVoted: false
        });
      }
      console.log("Voters registry seeded.");

      await batch.commit();
      console.log("Seeding complete.");
      alert("تمت إعادة ضبط النظام وتهيئة البيانات بنجاح!");
      setIsSeeding(false);
    } catch (error) {
      console.error("Hard reset and seeding failed:", error);
      handleFirestoreError(error, OperationType.WRITE, 'system/reset');
      alert("فشل إعادة ضبط النظام. يرجى التحقق من صلاحيات Firestore.");
      setIsSeeding(false);
    }
  };

  const totalVotesCount = elections.reduce((sum, e) => sum + (e.totalVotes || 0), 0);
  const activeElectionsCount = elections.filter(e => e.status === 'active').length;
  const currentElection = elections.find(e => e.id === selectedElectionId);
  const totalRegisteredVoters = districts.reduce((sum, d) => sum + (d.voterCount || 0), 0) || currentElection?.registeredVoters || 0;

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">لوحة تحكم المشرف</h1>
          <p className="text-slate-500">إدارة العملية الانتخابية ومراقبة الأداء الأمني.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            icon={isSeeding ? RefreshCw : Database} 
            onClick={seedInitialData} 
            disabled={isSeeding}
            className={cn(
              "text-rose-600 border-rose-200 hover:bg-rose-50",
              isSeeding && "opacity-70"
            )}
          >
            {isSeeding ? "جاري التهيئة..." : "إعادة ضبط وتهيئة البيانات"}
          </Button>
          <Button variant="outline" icon={FileText}>تقارير التدقيق</Button>
          <Button variant="primary" icon={Lock} onClick={() => setShowCreateModal(true)}>إنشاء انتخابات جديدة</Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-px">
        {[
          { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
          { id: 'elections', label: 'الانتخابات', icon: Vote },
          { id: 'candidates', label: 'المرشحون', icon: Users },
          { id: 'districts', label: 'الدوائر', icon: MapPin },
          { id: 'voters', label: 'سجل الناخبين', icon: Database }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-medium text-sm",
              activeTab === tab.id 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
                <Vote size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">
                  {elections.find(e => e.id === selectedElectionId)?.title || 'لم يتم اختيار انتخابات'}
                </h4>
                <p className="text-xs text-slate-500">عرض إحصائيات الانتخابات المختارة حالياً</p>
              </div>
            </div>
            <Badge variant={elections.find(e => e.id === selectedElectionId)?.status === 'active' ? 'success' : 'info'}>
              {elections.find(e => e.id === selectedElectionId)?.status === 'active' ? 'نشطة' : 'مغلقة'}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { label: 'الأصوات الصحيحة', value: totalVotesCount.toLocaleString(), change: '+12%', icon: CheckCircle2, color: 'text-emerald-600' },
              { label: 'إجمالي المسجلين', value: totalRegisteredVoters.toLocaleString(), change: 'رسمي', icon: Users, color: 'text-indigo-600' },
              { label: 'الانتخابات النشطة', value: activeElectionsCount.toString(), change: 'Live', icon: Vote, color: 'text-indigo-600' },
              { label: 'نشاط الشبكة', value: '99.99%', change: 'مستقر', icon: Activity, color: 'text-indigo-600' },
              { label: 'وقت الفرز المتوقع', value: 'فوري', change: 'AI Active', icon: Clock, color: 'text-blue-600' }
            ].map((stat, i) => (
              <Card key={i} className="p-6">
                <div className="flex justify-between items-start">
                  <div className={cn("p-2 rounded-lg bg-slate-50", stat.color)}>
                    <stat.icon size={20} />
                  </div>
                  <span className={cn("text-xs font-bold px-2 py-1 rounded-full bg-slate-50", 
                    stat.change.includes('+') ? 'text-emerald-600' : 'text-slate-500'
                  )}>
                    {stat.change}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                  <h4 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h4>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card title="معدل التصويت الزمني" subtitle="عدد الأصوات لكل ساعة">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { time: '08:00', votes: 1200 },
                    { time: '10:00', votes: 4500 },
                    { time: '12:00', votes: 8900 },
                    { time: '14:00', votes: 12000 },
                    { time: '16:00', votes: 15600 },
                    { time: '18:00', votes: 11000 },
                    { time: '20:00', votes: 9500 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="votes" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="تنبيهات الأمان (AI)" subtitle="كشف الأنماط غير الطبيعية">
              <div className="space-y-4">
                {[
                  { type: 'warning', msg: 'محاولة دخول متكررة من عنوان IP مشبوه', time: 'منذ دقيقتين' },
                  { type: 'info', msg: 'تم تحديث سجلات الـ Blockchain بنجاح', time: 'منذ 5 دقائق' },
                  { type: 'error', msg: 'فشل التحقق البيومتري لـ 3 مستخدمين متتاليين', time: 'منذ 12 دقيقة' },
                  { type: 'success', msg: 'اكتمال مزامنة العقد (Nodes) في المنطقة الغربية', time: 'منذ 20 دقيقة' }
                ].map((alert, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className={cn("mt-1", 
                      alert.type === 'warning' ? 'text-amber-500' : 
                      alert.type === 'error' ? 'text-red-500' : 
                      alert.type === 'success' ? 'text-emerald-500' : 'text-blue-500'
                    )}>
                      {alert.type === 'warning' ? <AlertTriangle size={16} /> : <Shield size={16} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{alert.msg}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'elections' && (
        <Card title="سجل الانتخابات" subtitle="إدارة حالات الانتخابات والتبديل بينها">
          <div className="space-y-4">
            {elections.map((e) => (
              <div key={e.id} className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg", e.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                    <Vote size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">{e.title}</h5>
                    <p className="text-xs text-slate-500">تاريخ البدء: {new Date(e.startDate).toLocaleDateString('ar-EG')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={e.status === 'active' ? 'success' : 'info'}>
                    {e.status === 'active' ? 'نشطة حالياً' : 'مؤرشفة'}
                  </Badge>
                  <Button 
                    variant={e.status === 'active' ? 'outline' : 'primary'} 
                    className="text-xs px-3 py-1 h-auto"
                    onClick={() => toggleElectionStatus(e.id, e.status)}
                  >
                    {e.status === 'active' ? 'إغلاق' : 'تفعيل'}
                  </Button>
                  <Button 
                    variant={selectedElectionId === e.id ? 'primary' : 'outline'} 
                    className="text-xs px-3 py-1 h-auto"
                    onClick={() => {
                      setSelectedElectionId(e.id);
                      setActiveTab('overview');
                    }}
                  >
                    عرض التفاصيل
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {activeTab === 'candidates' && (
        <Card title="إدارة المرشحين" subtitle="تعديل بيانات القوائم الانتخابية">
          <div className="mb-6 flex justify-between items-center">
            <p className="text-sm text-slate-500">
              المرشحون لانتخابات: <span className="font-bold text-slate-900">{elections.find(e => e.id === selectedElectionId)?.title}</span>
            </p>
                <Button 
                  icon={Plus} 
                  className="text-sm"
                  onClick={() => {
                    setEditingCandidate(null);
                    setCandidateForm({ name: '', partyId: '', image: '', districtId: districts[0]?.id || '', listId: '', program: '' });
                    setShowCandidateModal(true);
                  }}
                >
                  إضافة مرشح
                </Button>
          </div>
          
          {candidates.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">لا يوجد مرشحون مسجلون في هذه الانتخابات. يرجى اختيار انتخابات نشطة أو إضافة مرشحين.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl border border-slate-100 flex items-center gap-4 bg-white hover:shadow-md transition-all">
                  <img src={c.image || 'https://picsum.photos/seed/user/100/100'} alt={c.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h5 className="text-sm font-bold text-slate-900">{c.name}</h5>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="info" className="text-[9px] px-1 py-0">
                        {parties.find(p => p.id === c.partyId)?.name || 'بدون حزب'}
                      </Badge>
                      <Badge variant="secondary" className="text-[9px] px-1 py-0">
                        {localLists.find(l => l.id === c.listId)?.name || 'بدون قائمة'}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-indigo-600 mt-1 font-medium">
                      {districts.find(d => d.id === c.districtId)?.name || 'دائرة غير محددة'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        setEditingCandidate(c);
                        setCandidateForm({ 
                          name: c.name, 
                          partyId: c.partyId || '', 
                          image: c.image || '', 
                          districtId: c.districtId || '', 
                          listId: c.listId || '',
                          program: c.program || '' 
                        });
                        setShowCandidateModal(true);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteCandidate(c.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'districts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {districts.map(d => (
            <Card key={d.id} className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{d.name}</h4>
                    <p className="text-xs text-slate-500">إجمالي الناخبين: {(d.voterCount || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="text-xs px-3 py-1 h-auto"
                    onClick={() => {
                      setEditingDistrict(d);
                      setDistrictForm({ name: d.name, voterCount: d.voterCount || 0 });
                      setShowDistrictModal(true);
                    }}
                  >
                    تعديل
                  </Button>
                  <button 
                    onClick={() => handleDeleteDistrict(d.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
          <button 
            onClick={() => {
              setEditingDistrict(null);
              setDistrictForm({ name: '', voterCount: 0 });
              setShowDistrictModal(true);
            }}
            className="p-6 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <MapPin size={18} />
            إضافة دائرة انتخابية
          </button>
        </div>
      )}

      {activeTab === 'voters' && (
        <div className="space-y-6">
          <Card title="رفع سجل الناخبين" subtitle="تحميل ملف CSV يحتوي على الأرقام الوطنية والدوائر">
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                <Database size={32} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">اختر ملف السجل الوطني</h4>
                <p className="text-sm text-slate-500 mt-1">يجب أن يحتوي الملف على أعمدة: nationalId, name, districtName</p>
                <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
                  💡 لضمان ظهور اللغة العربية بشكل صحيح، يرجى حفظ ملف Excel بصيغة <b>CSV UTF-8</b>
                </p>
              </div>
              
              <div className="max-w-xs mx-auto">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleVoterFileUpload}
                  className="hidden" 
                  id="voter-upload"
                  disabled={isUploadingVoters}
                />
                <label 
                  htmlFor="voter-upload"
                  className={cn(
                    "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold cursor-pointer transition-all",
                    isUploadingVoters ? "bg-slate-100 text-slate-400" : "bg-indigo-600 text-white hover:bg-indigo-700"
                  )}
                >
                  {isUploadingVoters ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      جاري الرفع ({uploadProgress}%)
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      اختيار ملف CSV
                    </>
                  )}
                </label>
              </div>

              {isUploadingVoters && (
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-md mx-auto">
                  <motion.div 
                    className="h-full bg-indigo-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          </Card>

          <Card title="نموذج البيانات المطلوب" className="bg-slate-50 border-none">
            <div className="font-mono text-xs text-slate-600 overflow-x-auto">
              <table className="w-full text-left" dir="ltr">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-2">nationalId</th>
                    <th className="pb-2">name</th>
                    <th className="pb-2">districtName</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">1111111111</td>
                    <td className="py-2">أحمد محمد</td>
                    <td className="py-2">العاصمة</td>
                  </tr>
                  <tr>
                    <td className="py-2">2222222222</td>
                    <td className="py-2">سارة علي</td>
                    <td className="py-2">المنطقة الشمالية</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Candidate Modal */}
      <AnimatePresence>
        {showCandidateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowCandidateModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingCandidate ? 'تعديل بيانات المرشح' : 'إضافة مرشح جديد'}
                </h3>
                <button onClick={() => setShowCandidateModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">اسم المرشح</label>
                  <input 
                    type="text" 
                    value={candidateForm.name}
                    onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="الاسم الكامل"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الحزب (للقائمة الوطنية)</label>
                  <select 
                    value={candidateForm.partyId}
                    onChange={(e) => setCandidateForm({ ...candidateForm, partyId: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">-- اختر حزباً --</option>
                    {parties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">القائمة المحلية</label>
                  <select 
                    value={candidateForm.listId}
                    onChange={(e) => setCandidateForm({ ...candidateForm, listId: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">-- اختر قائمة محلية --</option>
                    {localLists.filter(l => l.districtId === candidateForm.districtId).map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">رابط الصورة</label>
                  <input 
                    type="text" 
                    value={candidateForm.image}
                    onChange={(e) => setCandidateForm({ ...candidateForm, image: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الدائرة الانتخابية</label>
                  <select 
                    value={candidateForm.districtId}
                    onChange={(e) => setCandidateForm({ ...candidateForm, districtId: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">البرنامج الانتخابي (اختياري)</label>
                  <textarea 
                    value={candidateForm.program}
                    onChange={(e) => setCandidateForm({ ...candidateForm, program: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                    placeholder="نبذة عن البرنامج..."
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50 flex gap-3">
                <Button className="flex-1" onClick={handleSaveCandidate}>
                  {editingCandidate ? 'حفظ التعديلات' : 'إضافة المرشح'}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowCandidateModal(false)}>
                  إلغاء
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">إنشاء انتخابات جديدة</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>
              <div className="p-8 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">عنوان الانتخابات</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="مثال: انتخابات مجلس الشعب 2026"
                    value={newElection.title}
                    onChange={(e) => setNewElection({...newElection, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">تاريخ البدء</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={newElection.startDate}
                      onChange={(e) => setNewElection({...newElection, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">تاريخ الانتهاء</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={newElection.endDate}
                      onChange={(e) => setNewElection({...newElection, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الوصف</label>
                  <textarea 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-24" 
                    placeholder="أدخل تفاصيل الانتخابات..."
                    value={newElection.description}
                    onChange={(e) => setNewElection({...newElection, description: e.target.value})}
                  ></textarea>
                </div>
                <div className="pt-4 flex gap-3">
                  <Button className="flex-1 py-3" onClick={() => setShowCreateModal(false)}>إلغاء</Button>
                  <Button variant="secondary" className="flex-1 py-3" onClick={handleCreateElection}>إطلاق الانتخابات</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showDistrictModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDistrictModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">{editingDistrict ? 'تعديل دائرة' : 'إضافة دائرة جديدة'}</h3>
                <button onClick={() => setShowDistrictModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>
              <div className="p-8 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">اسم الدائرة</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="مثال: دائرة العاصمة"
                    value={districtForm.name}
                    onChange={(e) => setDistrictForm({...districtForm, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">عدد الناخبين</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={districtForm.voterCount}
                    onChange={(e) => setDistrictForm({...districtForm, voterCount: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button className="flex-1 py-3" onClick={() => setShowDistrictModal(false)}>إلغاء</Button>
                  {editingDistrict && (
                    <Button 
                      variant="outline" 
                      className="flex-1 py-3 text-rose-600 border-rose-200 hover:bg-rose-50" 
                      onClick={() => {
                        handleDeleteDistrict(editingDistrict.id);
                        setShowDistrictModal(false);
                      }}
                    >
                      حذف الدائرة
                    </Button>
                  )}
                  <Button variant="secondary" className="flex-1 py-3" onClick={handleSaveDistrict}>حفظ</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activePortal, setActivePortal] = useState<'public' | 'voter' | 'admin'>('public');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Global Election State
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [localLists, setLocalLists] = useState<LocalList[]>([]);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch active election
    const electionsQuery = query(
      collection(db, 'elections'), 
      where('status', '==', 'active'), 
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    let unsubscribeCandidates: (() => void) | null = null;
    let unsubscribeDistricts: (() => void) | null = null;

    const unsubscribeElection = onSnapshot(electionsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const electionDoc = snapshot.docs[0];
        const electionData = { id: electionDoc.id, ...electionDoc.data() } as any;
        setElection(electionData);
        
        if (unsubscribeCandidates) unsubscribeCandidates();
        if (unsubscribeDistricts) unsubscribeDistricts();

        const candidatesRef = collection(db, 'elections', electionDoc.id, 'candidates');
        unsubscribeCandidates = onSnapshot(candidatesRef, (candSnapshot) => {
          setCandidates(candSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, `elections/${electionDoc.id}/candidates`);
        });

        const districtsRef = collection(db, 'elections', electionDoc.id, 'districts');
        unsubscribeDistricts = onSnapshot(districtsRef, (distSnapshot) => {
          setDistricts(distSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, `elections/${electionDoc.id}/districts`);
        });

        const partiesRef = collection(db, 'elections', electionDoc.id, 'parties');
        onSnapshot(partiesRef, (partySnapshot) => {
          setParties(partySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, `elections/${electionDoc.id}/parties`);
        });

        const localListsRef = collection(db, 'elections', electionDoc.id, 'local_lists');
        onSnapshot(localListsRef, (listSnapshot) => {
          setLocalLists(listSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, `elections/${electionDoc.id}/local_lists`);
        });
      } else {
        // Fallback to mock data
        setElection(MOCK_ELECTION);
        setCandidates(MOCK_ELECTION.candidates);
        setDistricts(MOCK_ELECTION.districts);
        setParties(MOCK_PARTIES);
        setLocalLists(MOCK_LOCAL_LISTS);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'elections');
      setLoading(false);
    });

    const votesQuery = query(collection(db, 'votes'), orderBy('timestamp', 'desc'), limit(10));
    const unsubscribeVotes = onSnapshot(votesQuery, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({
        id: doc.id,
        hash: `0x${doc.id.substring(0, 8)}...${doc.id.substring(doc.id.length - 4)}`,
        timestamp: doc.data().timestamp?.toDate().toLocaleTimeString() || 'Just now',
        type: 'Vote Cast',
        status: 'Confirmed',
        zkpProof: doc.data().zkpProof,
        encryptedVote: doc.data().encryptedVote,
        districtId: doc.data().districtId
      } as any)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'votes');
    });

    return () => {
      unsubscribeElection();
      if (unsubscribeCandidates) unsubscribeCandidates();
      if (unsubscribeDistricts) unsubscribeDistricts();
      unsubscribeVotes();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch or create user profile
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          } else {
            // Create new profile
            const newProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              role: firebaseUser.email === 'mohamadabuhalwe912@gmail.com' ? 'admin' : 'voter',
              createdAt: Timestamp.now(),
              hasVoted: false
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        console.error("Login failed:", error);
        alert("فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">جاري تهيئة النظام الآمن...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Vote size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">NEVS</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl" dir="rtl">
              {[
                { id: 'public', label: 'البوابة العامة', icon: BarChart3 },
                { id: 'voter', label: 'بوابة الناخب', icon: Smartphone },
                { id: 'admin', label: 'لوحة التحكم', icon: LayoutDashboard, adminOnly: true }
              ].filter(p => !p.adminOnly || userProfile?.role === 'admin').map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePortal(item.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activePortal === item.id 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
                  )}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block" dir="rtl">
                    <p className="text-xs font-bold text-slate-900">{user.displayName}</p>
                    <p className="text-[10px] text-slate-500">{userProfile?.role === 'admin' ? 'مسؤول نظام' : 'ناخب مسجل'}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all"
                  >
                    <Lock size={18} />
                  </button>
                </div>
              ) : (
                <Button onClick={handleLogin} icon={isLoggingIn ? RefreshCw : Users} disabled={isLoggingIn}>
                  {isLoggingIn ? 'جاري الدخول...' : 'تسجيل الدخول'}
                </Button>
              )}
              <button 
                className="md:hidden p-2 text-slate-600"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2" dir="rtl">
                {[
                  { id: 'public', label: 'البوابة العامة', icon: BarChart3 },
                  { id: 'voter', label: 'بوابة الناخب', icon: Smartphone },
                  { id: 'admin', label: 'لوحة التحكم', icon: LayoutDashboard, adminOnly: true }
                ].filter(p => !p.adminOnly || userProfile?.role === 'admin').map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePortal(item.id as any);
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      activePortal === item.id 
                        ? "bg-indigo-50 text-indigo-600" 
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activePortal === 'public' && (
          <PublicPortal 
            election={election} 
            candidates={candidates} 
            districts={districts} 
            transactions={transactions}
            loading={loading}
          />
        )}
        {activePortal === 'voter' && (
          <VoterPortal 
            user={user} 
            userProfile={userProfile} 
            election={election}
            candidates={candidates}
            districts={districts}
            parties={parties}
            localLists={localLists}
            loading={loading}
            onLogin={handleLogin}
            onVoteSuccess={() => {
              // Refresh user profile or show success
            }} 
          />
        )}
        {activePortal === 'admin' && (
          userProfile?.role === 'admin' ? (
            <AdminDashboard 
              userProfile={userProfile} 
              parties={parties}
              localLists={localLists}
            />
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                <Lock size={40} />
              </div>
              <div className="max-w-md space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">غير مصرح لك بالدخول</h2>
                <p className="text-slate-500">هذه المنطقة مخصصة لمشرفي النظام فقط. يرجى تسجيل الدخول بحساب المشرف للوصول إلى لوحة التحكم.</p>
              </div>
              <Button onClick={() => setActivePortal('public')} variant="outline">العودة للبوابة العامة</Button>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right" dir="rtl">
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <Vote size={18} />
                </div>
                <span className="text-lg font-bold">NEVS</span>
              </div>
              <p className="text-sm text-slate-500">
                نظام التصويت الإلكتروني الوطني هو مشروع سيادي يهدف لتعزيز الديمقراطية الرقمية والشفافية المطلقة.
              </p>
            </div>
            <div className="space-y-4">
              <h5 className="font-bold text-slate-900">روابط سريعة</h5>
              <ul className="text-sm text-slate-500 space-y-2">
                <li><a href="#" className="hover:text-indigo-600">عن النظام</a></li>
                <li><a href="#" className="hover:text-indigo-600">دليل الناخب</a></li>
                <li><a href="#" className="hover:text-indigo-600">الأسئلة الشائعة</a></li>
                <li><a href="#" className="hover:text-indigo-600">سياسة الخصوصية</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-bold text-slate-900">تواصل معنا</h5>
              <p className="text-sm text-slate-500">اللجنة العليا للانتخابات - المركز التقني</p>
              <p className="text-sm text-slate-500">هاتف: 900-123-456</p>
              <div className="flex gap-4 justify-center md:justify-start mt-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 cursor-pointer transition-all">
                  <Database size={16} />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 cursor-pointer transition-all">
                  <Shield size={16} />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 cursor-pointer transition-all">
                  <Cpu size={16} />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">© 2025 نظام التصويت الإلكتروني الوطني. جميع الحقوق محفوظة للحكومة الرقمية.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

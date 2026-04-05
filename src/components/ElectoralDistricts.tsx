import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { MapPin, Users, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const districtsData = [
  { name: 'العاصمة عمان', seats: 20, districts: 3, color: '#4f46e5' },
  { name: 'محافظة إربد', seats: 15, districts: 2, color: '#10b981' },
  { name: 'الزرقاء', seats: 10, districts: 1, color: '#f59e0b' },
  { name: 'البلقاء', seats: 8, districts: 1, color: '#ef4444' },
  { name: 'الكرك', seats: 8, districts: 1, color: '#8b5cf6' },
  { name: 'جرش', seats: 3, districts: 1, color: '#ec4899' },
  { name: 'مأدبا', seats: 3, districts: 1, color: '#06b6d4' },
  { name: 'المفرق', seats: 3, districts: 1, color: '#84cc16' },
  { name: 'الطفيلة', seats: 3, districts: 1, color: '#f97316' },
  { name: 'عجلون', seats: 3, districts: 1, color: '#6366f1' },
  { name: 'معان', seats: 3, districts: 1, color: '#14b8a6' },
  { name: 'العقبة', seats: 3, districts: 1, color: '#d946ef' },
  { name: 'بدو الشمال', seats: 3, districts: 1, color: '#3b82f6' },
  { name: 'بدو الوسط', seats: 3, districts: 1, color: '#10b981' },
  { name: 'بدو الجنوب', seats: 3, districts: 1, color: '#f59e0b' },
];

interface ElectoralDistrictsProps {
  districts?: any[];
}

const ElectoralDistricts = ({ districts }: ElectoralDistrictsProps) => {
  const displayData = React.useMemo(() => {
    if (districts && districts.length > 0) {
      return districts.map((d, index) => ({
        name: d.name,
        seats: d.seats || 0,
        districts: d.subDistrictsCount || 1,
        color: districtsData[index % districtsData.length].color // Reuse colors from static data
      }));
    }
    return districtsData;
  }, [districts]);

  const totalSeats = displayData.reduce((acc, curr) => acc + curr.seats, 0);
  const totalDistricts = displayData.reduce((acc, curr) => acc + curr.districts, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700" dir="rtl">
      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">إجمالي المقاعد المحلية</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalSeats} مقعداً</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
        >
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <LayoutGrid size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">عدد الدوائر الانتخابية</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalDistricts} دائرة</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">توزيع جغرافي</p>
            <h3 className="text-2xl font-bold text-slate-900">شامل للمملكة</h3>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart Visualization */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">توزيع المقاعد حسب المحافظة/المنطقة</h3>
            <p className="text-sm text-slate-500">تمثيل بياني لعدد المقاعد المخصصة</p>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  tick={{ fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="seats" radius={[0, 4, 4, 0]}>
                  {displayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">تفاصيل الدوائر والمقاعد</h3>
            <p className="text-sm text-slate-500">قائمة مفصلة لجميع الدوائر الـ 18</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {displayData.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.districts > 1 ? `مقسمة إلى ${item.districts} دوائر` : 'دائرة انتخابية واحدة'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-black text-slate-900">{item.seats}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">مقعد</span>
                  </div>
                </div>
                <div className="mt-3 w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${(item.seats / 20) * 100}%`, 
                      backgroundColor: item.color 
                    }} 
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bedouin Section Highlight */}
      <div className="bg-indigo-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-xl shadow-indigo-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-right">
            <h3 className="text-2xl font-bold">دوائر البدو (9 مقاعد)</h3>
            <p className="text-indigo-100 max-w-xl">
              تم تخصيص 9 مقاعد لدوائر البدو، موزعة بالتساوي على ثلاث مناطق جغرافية رئيسية لضمان التمثيل العادل.
            </p>
          </div>
          <div className="flex gap-4">
            {[
              { label: 'بدو الشمال', val: 3 },
              { label: 'بدو الوسط', val: 3 },
              { label: 'بدو الجنوب', val: 3 }
            ].map((b, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[100px]">
                <p className="text-xs text-indigo-200 mb-1">{b.label}</p>
                <p className="text-2xl font-bold">{b.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectoralDistricts;

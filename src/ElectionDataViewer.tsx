import React, { useState, useEffect } from 'react';
import { generateJordanianElectionData, ElectionData } from './lib/jordanElectionMock';

const ElectionDataViewer: React.FC = () => {
  const [data, setData] = useState<ElectionData | null>(null);

  useEffect(() => {
    const mockData = generateJordanianElectionData();
    setData(mockData);
  }, []);

  if (!data) return <div className="p-8 text-center">جاري توليد البيانات...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">محاكاة بيانات الانتخابات البرلمانية الأردنية</h1>
            <p className="text-slate-500">قانون الانتخاب الجديد 2024 (97 مقعد محلي + 41 مقعد حزبي)</p>
          </div>
          <button 
            onClick={() => setData(generateJordanianElectionData())}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-all"
          >
            توليد بيانات جديدة
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="إجمالي الدوائر" value={data.districts.length} icon="📍" />
          <StatCard title="إجمالي القوائم" value={data.lists.length} icon="📋" />
          <StatCard title="إجمالي المرشحين" value={data.candidates.length} icon="👥" />
        </div>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold mb-4">هيكل البيانات (JSON)</h2>
          <div className="bg-slate-900 text-slate-300 p-4 rounded-xl overflow-auto max-h-[500px] text-left font-mono text-sm" dir="ltr">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-4">الفائزون بالمقاعد (عينة)</h2>
            <div className="space-y-3">
              {data.winners.slice(0, 10).map(winner => (
                <div key={winner.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-bold text-slate-900">{winner.name}</p>
                    <p className="text-xs text-slate-500">{winner.religion} | {winner.gender}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-indigo-600">{data.districts.find(d => d.id === winner.districtId)?.name}</p>
                    <p className="text-[10px] text-slate-400">{winner.votes.toLocaleString()} صوت</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-4">توزيع القوائم حسب الدائرة</h2>
            <div className="space-y-3">
              {data.districts.slice(0, 8).map(district => (
                <div key={district.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <p className="font-bold text-slate-900">{district.name}</p>
                  <p className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                    {data.lists.filter(l => l.districtId === district.id).length} قوائم
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string, value: number, icon: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-slate-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
    </div>
  </div>
);

export default ElectionDataViewer;

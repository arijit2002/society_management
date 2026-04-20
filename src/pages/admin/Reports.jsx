import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Reports() {
  const [data, setData] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const years = Array.from({length:3}, (_,i) => new Date().getFullYear()-i);

  useEffect(() => {
    window.api.getReports({ year }).then(setData);
  }, [year]);

  if (!data) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  const collectionChart = MONTHS.map((m, i) => {
    const c = data.collection.find(r => +r.month === i+1);
    const p = data.pending.find(r => +r.month === i+1);
    return { month: m, collected: c?.collected || 0, pending: p?.pending_amount || 0 };
  });

  const totalCollected = data.collection.reduce((s,r) => s+r.collected, 0);
  const totalPending   = data.pending.reduce((s,r) => s+r.pending_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-sm text-gray-500">Financial and operational reports</p>
        </div>
        <select className="input w-auto" value={year} onChange={e=>setYear(+e.target.value)}>
          {years.map(y=><option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">₹{totalCollected.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total Collected ({year})</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-500">₹{totalPending.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total Pending ({year})</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">
            {totalCollected+totalPending > 0 ? ((totalCollected/(totalCollected+totalPending))*100).toFixed(1) : 0}%
          </p>
          <p className="text-sm text-gray-500">Collection Rate</p>
        </div>
      </div>

      {/* Fee collection chart */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Monthly Fee Overview ({year})</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={collectionChart} margin={{ top:0, right:10, left:-10, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize:11 }}/>
            <YAxis tick={{ fontSize:11 }} tickFormatter={v=>`₹${v/1000}k`}/>
            <Tooltip formatter={v=>`₹${v.toLocaleString()}`}/>
            <Legend />
            <Bar dataKey="collected" fill="#10b981" radius={[4,4,0,0]} name="Collected"/>
            <Bar dataKey="pending"   fill="#f59e0b" radius={[4,4,0,0]} name="Pending"/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly breakdown table */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Month-wise Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="table-header">
                {['Month','Collected','Pending','Total','Collection Rate'].map(h=>(
                  <th key={h} className="px-4 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((m, i) => {
                const c = data.collection.find(r => +r.month === i+1);
                const p = data.pending.find(r => +r.month === i+1);
                const collected = c?.collected || 0;
                const pending   = p?.pending_amount || 0;
                const total     = collected + pending;
                const rate      = total > 0 ? ((collected/total)*100).toFixed(0) : 0;
                if (!c && !p) return null;
                return (
                  <tr key={m} className="table-row">
                    <td className="table-cell font-medium">{m} {year}</td>
                    <td className="table-cell text-green-600 font-medium">₹{collected.toLocaleString()}</td>
                    <td className="table-cell text-red-500">₹{pending.toLocaleString()}</td>
                    <td className="table-cell">₹{total.toLocaleString()}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-[80px]">
                          <div className="h-full bg-green-500 rounded-full" style={{ width:`${rate}%` }}/>
                        </div>
                        <span className="text-xs">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

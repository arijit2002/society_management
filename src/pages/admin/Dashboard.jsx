import { useEffect, useState } from 'react';
import { Users, CreditCard, MessageSquare, Wrench, Home, UserCog, CalendarCheck, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { StatCard } from '../../components/StatCard';
import { Badge, statusVariant, priorityVariant, formatStatus } from '../../components/Badge';
import { useAuthStore } from '../../store/authStore';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const { societyInfo } = useAuthStore();

  useEffect(() => {
    window.api.getDashboardStats().then(setStats);
  }, []);

  if (!stats) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  const chartData = MONTHS.map((m, i) => {
    const found = stats.monthlyCollection.find(r => r.month === i + 1);
    return { month: m, collected: found?.collected || 0 };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">{societyInfo?.name || 'Society'} — Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of all society operations</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Residents" value={stats.totalResidents} subtitle={`${stats.occupiedFlats}/${stats.totalFlats} flats occupied`} icon={Users} color="primary" />
        <StatCard title="Pending Fees" value={stats.pendingFees} subtitle="Awaiting payment" icon={CreditCard} color="warning" />
        <StatCard title="Open Complaints" value={stats.openComplaints} subtitle="Need attention" icon={MessageSquare} color="danger" />
        <StatCard title="Collected This Month" value={`₹${stats.collectedThisMonth.toLocaleString()}`} subtitle="Current month" icon={TrendingUp} color="success" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Staff" value={stats.totalStaff} icon={UserCog} color="info" />
        <StatCard title="Pending Tasks" value={stats.pendingTasksCount} icon={Wrench} color="purple" />
        <StatCard title="Visitors Today" value={stats.visitorsToday} icon={CalendarCheck} color="info" />
        <StatCard title="Total Flats" value={stats.totalFlats} subtitle={`${stats.totalFlats - stats.occupiedFlats} vacant`} icon={Home} color="primary" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Fee Collection ({new Date().getFullYear()})</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Collected']} />
              <Bar dataKey="collected" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Complaints by Category</h3>
          {stats.complaintsByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.complaintsByCategory} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={75} label={({ category, percent }) => `${category} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {stats.complaintsByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-10">No complaints yet</p>}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Complaints</h3>
          <div className="space-y-3">
            {stats.recentComplaints.length === 0 && <p className="text-sm text-gray-400">No complaints</p>}
            {stats.recentComplaints.map(c => (
              <div key={c.id} className="flex items-start justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.title}</p>
                  <p className="text-xs text-gray-500">{c.resident_name} · Flat {c.flat_no}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Badge variant={priorityVariant(c.priority)}>{c.priority}</Badge>
                  <Badge variant={statusVariant(c.status)}>{formatStatus(c.status)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Notices</h3>
          <div className="space-y-3">
            {stats.recentNotices.length === 0 && <p className="text-sm text-gray-400">No notices</p>}
            {stats.recentNotices.map(n => (
              <div key={n.id} className="py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={n.priority === 'urgent' ? 'danger' : n.priority === 'important' ? 'warning' : 'default'}>
                    {n.priority}
                  </Badge>
                  <p className="text-sm font-medium text-gray-800">{n.title}</p>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

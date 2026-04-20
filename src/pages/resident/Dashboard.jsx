import { useEffect, useState } from 'react';
import { CreditCard, MessageSquare, Bell, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Badge, statusVariant, priorityVariant, formatStatus } from '../../components/Badge';
import { useAuthStore } from '../../store/authStore';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ResidentDashboard() {
  const [data, setData] = useState(null);
  const { user, societyInfo } = useAuthStore();

  useEffect(() => {
    if (user) window.api.getResidentDashboard(user.id).then(setData);
  }, [user]);

  if (!data) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  const feeStatus = data.currentFee?.status;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-6 text-white">
        <p className="text-primary-200 text-sm">Welcome back,</p>
        <h1 className="text-2xl font-bold mt-0.5">{user?.name}</h1>
        <p className="text-primary-200 text-sm mt-1">Flat {user?.flat_no}, Block {user?.block} · {societyInfo?.name}</p>
      </div>

      {/* Fee status */}
      <div className={`card flex items-center gap-4 ${feeStatus==='paid' ? 'border-green-200 bg-green-50' : feeStatus==='overdue' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
        {feeStatus === 'paid'
          ? <CheckCircle size={28} className="text-green-600 flex-shrink-0"/>
          : feeStatus === 'overdue'
          ? <AlertTriangle size={28} className="text-red-500 flex-shrink-0"/>
          : <Clock size={28} className="text-yellow-600 flex-shrink-0"/>
        }
        <div className="flex-1">
          {data.currentFee ? (
            <>
              <p className="font-semibold text-gray-800">
                {feeStatus === 'paid' ? 'Maintenance fee paid' : feeStatus === 'overdue' ? 'Fee overdue!' : 'Maintenance fee due'}
              </p>
              <p className="text-sm text-gray-600">
                {MONTHS[data.currentFee.month]} {data.currentFee.year} · ₹{data.currentFee.amount.toLocaleString()}
                {data.currentFee.due_date && ` · Due: ${data.currentFee.due_date}`}
              </p>
            </>
          ) : <p className="text-gray-700 font-medium">No fee record for current month</p>}
        </div>
        {data.totalDue > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Outstanding</p>
            <p className="font-bold text-red-600">₹{data.totalDue.toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Complaints */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={16} className="text-primary-600"/>
            <h3 className="font-semibold text-gray-800">My Recent Complaints</h3>
          </div>
          {data.myComplaints.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No complaints raised</p>
          ) : (
            <div className="space-y-2">
              {data.myComplaints.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{c.category} · {c.created_at?.split('T')[0]}</p>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant={priorityVariant(c.priority)}>{c.priority}</Badge>
                    <Badge variant={statusVariant(c.status)}>{formatStatus(c.status)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notices */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-primary-600"/>
            <h3 className="font-semibold text-gray-800">Latest Notices</h3>
          </div>
          {data.notices.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No notices</p>
          ) : (
            <div className="space-y-2">
              {data.notices.map(n => (
                <div key={n.id} className="py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={n.priority==='urgent'?'danger':n.priority==='important'?'warning':'info'}>{n.priority}</Badge>
                    <p className="text-sm font-medium text-gray-800">{n.title}</p>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

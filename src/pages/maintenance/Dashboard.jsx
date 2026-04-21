import { useEffect, useState } from 'react';
import { Wrench, CheckCircle, Clock, AlertTriangle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge, statusVariant, priorityVariant, formatStatus } from '../../components/Badge';
import { useAuthStore } from '../../store/authStore';

export default function MaintenanceDashboard() {
  const [tasks, setTasks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const { user, societyInfo } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      window.api.getTasks({ assigned_to: user.id }).then(setTasks);
      window.api.getComplaints({ assigned_to: user.id }).then(setComplaints);
    }
  }, [user]);

  const pending   = tasks.filter(t => t.status === 'pending');
  const inProg    = tasks.filter(t => t.status === 'in_progress');
  const completed = tasks.filter(t => t.status === 'completed');
  const urgent    = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');

  const onUpdateStatus = async (id, status) => {
    await window.api.updateTaskStatus({ id, status });
    window.api.getTasks({ assigned_to: user.id }).then(setTasks);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 text-white">
        <p className="text-orange-200 text-sm">Maintenance Dashboard</p>
        <h1 className="text-2xl font-bold mt-0.5">{user?.name}</h1>
        <p className="text-orange-200 text-sm mt-1">Maintenance Staff · {societyInfo?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-yellow-600">{pending.length}</p>
          <p className="text-xs text-gray-400 mt-1">Pending</p>
        </div>
        <div className="card text-center border-2 border-blue-200 bg-blue-50">
          <p className="text-2xl font-bold text-blue-600">{inProg.length}</p>
          <p className="text-xs text-blue-500 mt-1">In Progress</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{completed.length}</p>
          <p className="text-xs text-gray-400 mt-1">Completed</p>
        </div>
        <div className="card text-center border-2 border-red-200 bg-red-50">
          <p className="text-2xl font-bold text-red-600">{urgent.length}</p>
          <p className="text-xs text-red-500 mt-1">Urgent</p>
        </div>
      </div>

      {/* Assigned Complaints */}
      {complaints.filter(c => c.status !== 'resolved' && c.status !== 'closed').length > 0 && (
        <div className="card border-2 border-orange-200 bg-orange-50/40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <MessageSquare size={16} className="text-orange-500" />
              Assigned Complaints ({complaints.filter(c => c.status !== 'resolved' && c.status !== 'closed').length})
            </h3>
            <button onClick={() => navigate('/maintenance/complaints')}
              className="text-xs text-orange-600 hover:underline">View all</button>
          </div>
          <div className="space-y-2">
            {complaints.filter(c => c.status !== 'resolved' && c.status !== 'closed').slice(0, 3).map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-orange-100 gap-3">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{c.title}</p>
                  <p className="text-xs text-gray-500">{c.resident_name} · Flat {c.flat_no} · <span className="capitalize">{c.category}</span></p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {formatStatus(c.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active tasks */}
      {inProg.length > 0 && (
        <div className="card border-2 border-blue-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-blue-600"/> In Progress ({inProg.length})
          </h3>
          <div className="space-y-2">
            {inProg.map(t => (
              <div key={t.id} className="flex items-start justify-between p-3 bg-blue-50 rounded-xl gap-3">
                <div>
                  <p className="font-medium text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-500">{t.location && `${t.location} · `}{t.category}</p>
                  {t.due_date && <p className="text-xs text-gray-400">Due: {t.due_date}</p>}
                </div>
                <button onClick={() => onUpdateStatus(t.id, 'completed')}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors flex-shrink-0">
                  <CheckCircle size={12}/> Done
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending tasks */}
      {pending.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-500"/> Pending Tasks ({pending.length})
          </h3>
          <div className="space-y-2">
            {pending.map(t => (
              <div key={t.id} className="flex items-start justify-between p-3 border border-gray-100 rounded-xl gap-3">
                <div>
                  <p className="font-medium text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-500">{t.location && `${t.location} · `}{t.category}</p>
                  {t.due_date && <p className="text-xs text-gray-400">Due: {t.due_date}</p>}
                </div>
                <div className="flex flex-col gap-1 items-end flex-shrink-0">
                  <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
                  <button onClick={() => onUpdateStatus(t.id, 'in_progress')}
                    className="text-xs bg-primary-50 text-primary-600 hover:bg-primary-100 px-2 py-1 rounded-lg transition-colors">
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Wrench, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Badge, statusVariant, priorityVariant, formatStatus } from '../../components/Badge';
import { useAuthStore } from '../../store/authStore';

export default function MaintenanceDashboard() {
  const [tasks, setTasks] = useState([]);
  const { user, societyInfo } = useAuthStore();

  useEffect(() => {
    if (user) window.api.getTasks({ assigned_to: user.id }).then(setTasks);
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

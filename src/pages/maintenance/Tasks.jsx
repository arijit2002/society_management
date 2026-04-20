import { useEffect, useState } from 'react';
import { CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Badge, statusVariant, priorityVariant, formatStatus } from '../../components/Badge';
import { toast } from '../../components/Toast';
import { useAuthStore } from '../../store/authStore';

export default function MaintenanceTasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState({ status: '' });
  const [completeModal, setCompleteModal] = useState(null);
  const [notes, setNotes] = useState('');
  const { user } = useAuthStore();

  const load = () => {
    if (user) window.api.getTasks({ assigned_to: user.id, ...filter }).then(setTasks);
  };
  useEffect(() => { load(); }, [user, filter]);

  const onUpdateStatus = async (id, status) => {
    await window.api.updateTaskStatus({ id, status });
    toast.success(`Task marked as ${status.replace('_',' ')}`);
    load();
  };

  const onComplete = async () => {
    await window.api.updateTaskStatus({ id: completeModal.id, status: 'completed', completion_notes: notes });
    toast.success('Task completed!');
    setCompleteModal(null); setNotes(''); load();
  };

  const statusBg = { pending: '', in_progress: 'bg-blue-50/60', completed: 'bg-green-50/30', cancelled: 'bg-gray-50' };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">My Tasks</h1>
        <p className="text-sm text-gray-500">{tasks.length} tasks assigned</p>
      </div>

      <div className="card py-3">
        <div className="flex gap-2">
          {['','pending','in_progress','completed','cancelled'].map(s => (
            <button key={s} onClick={() => setFilter({ status: s })}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter.status===s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s ? formatStatus(s) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <CheckCircle size={36} className="mx-auto mb-3 opacity-30"/>
          <p>No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(t => (
            <div key={t.id} className={`card ${statusBg[t.status]||''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">#{t.id}</span>
                    <h3 className="font-semibold text-gray-900">{t.title}</h3>
                  </div>
                  {t.description && <p className="text-sm text-gray-600 mb-2">{t.description}</p>}
                  <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                    {t.location && <span>📍 {t.location}</span>}
                    {t.category && <span className="capitalize">🔧 {t.category}</span>}
                    {t.due_date && <span>📅 Due: {t.due_date}</span>}
                    <span>By: {t.created_by_name}</span>
                  </div>
                  {t.completion_notes && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-700 font-medium">Completion Note: {t.completion_notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end flex-shrink-0">
                  <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
                  <Badge variant={statusVariant(t.status)}>{formatStatus(t.status)}</Badge>
                  {t.status === 'pending' && (
                    <button onClick={() => onUpdateStatus(t.id, 'in_progress')}
                      className="flex items-center gap-1 text-xs bg-primary-50 text-primary-600 hover:bg-primary-100 px-2.5 py-1 rounded-lg transition-colors">
                      <Clock size={11}/> Start
                    </button>
                  )}
                  {t.status === 'in_progress' && (
                    <button onClick={() => { setCompleteModal(t); setNotes(''); }}
                      className="flex items-center gap-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-colors">
                      <CheckCircle size={11}/> Done
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!completeModal} onClose={() => setCompleteModal(null)} title="Mark Task Complete" size="sm">
        {completeModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="font-medium text-gray-800">{completeModal.title}</p>
            </div>
            <div>
              <label className="label">Completion Notes (optional)</label>
              <textarea className="input" rows={3} placeholder="Describe what was done..." value={notes} onChange={e=>setNotes(e.target.value)}/>
            </div>
            <div className="flex gap-3">
              <button onClick={onComplete} className="btn-success flex-1 flex items-center justify-center gap-2"><CheckCircle size={15}/> Mark Complete</button>
              <button onClick={() => setCompleteModal(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

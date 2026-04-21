import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Badge, statusVariant, priorityVariant, formatStatus } from '../../components/Badge';
import { toast } from '../../components/Toast';
import { useAuthStore } from '../../store/authStore';

export default function MaintenanceComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('');
  const [resolveModal, setResolveModal] = useState(null);
  const [notes, setNotes] = useState('');
  const { user } = useAuthStore();

  const load = () => {
    if (user) window.api.getComplaints({ assigned_to: user.id }).then(setComplaints);
  };
  useEffect(() => { load(); }, [user]);

  const filtered = filter ? complaints.filter(c => c.status === filter) : complaints;

  const onStart = async (c) => {
    await window.api.updateComplaint(c.id, { status: 'in_progress', priority: c.priority, assigned_to: c.assigned_to, resolution_notes: c.resolution_notes || '' });
    toast.success('Complaint marked as In Progress');
    load();
  };

  const onResolve = async () => {
    await window.api.updateComplaint(resolveModal.id, {
      status: 'resolved',
      priority: resolveModal.priority,
      assigned_to: resolveModal.assigned_to,
      resolution_notes: notes,
    });
    toast.success('Complaint resolved!');
    setResolveModal(null);
    setNotes('');
    load();
  };

  const statusBg = { open: '', in_progress: 'bg-blue-50/60', resolved: 'bg-green-50/30', closed: 'bg-gray-50' };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Assigned Complaints</h1>
        <p className="text-sm text-gray-500">{complaints.length} complaints assigned to you</p>
      </div>

      <div className="card py-3">
        <div className="flex gap-2 flex-wrap">
          {['', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s ? formatStatus(s) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <CheckCircle size={36} className="mx-auto mb-3 opacity-30" />
          <p>No complaints found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className={`card ${statusBg[c.status] || ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">#{c.id}</span>
                    <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{c.description}</p>
                  <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                    <span className="capitalize">🔧 {c.category}</span>
                    <span>👤 {c.resident_name} — Flat {c.flat_no}</span>
                    <span>📅 {c.created_at?.split('T')[0]}</span>
                  </div>
                  {c.resolution_notes && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-700 font-medium">Resolution: {c.resolution_notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end flex-shrink-0">
                  <Badge variant={priorityVariant(c.priority)}>{c.priority}</Badge>
                  <Badge variant={statusVariant(c.status)}>{formatStatus(c.status)}</Badge>
                  {c.status === 'open' && (
                    <button onClick={() => onStart(c)}
                      className="flex items-center gap-1 text-xs bg-primary-50 text-primary-600 hover:bg-primary-100 px-2.5 py-1 rounded-lg transition-colors">
                      Start
                    </button>
                  )}
                  {c.status === 'in_progress' && (
                    <button onClick={() => { setResolveModal(c); setNotes(c.resolution_notes || ''); }}
                      className="flex items-center gap-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-colors">
                      <CheckCircle size={11} /> Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!resolveModal} onClose={() => setResolveModal(null)} title="Resolve Complaint" size="sm">
        {resolveModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="font-medium text-gray-800">{resolveModal.title}</p>
              <p className="text-xs text-gray-500 mt-1">Raised by {resolveModal.resident_name} — Flat {resolveModal.flat_no}</p>
            </div>
            <div>
              <label className="label">Resolution Notes</label>
              <textarea className="input" rows={3} placeholder="Describe what was done to resolve this..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={onResolve} className="btn-success flex-1 flex items-center justify-center gap-2">
                <CheckCircle size={15} /> Mark Resolved
              </button>
              <button onClick={() => setResolveModal(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

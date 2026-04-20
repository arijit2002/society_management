import { useEffect, useState } from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Badge, statusVariant, priorityVariant, formatStatus } from '../../components/Badge';
import { toast } from '../../components/Toast';
import { useAuthStore } from '../../store/authStore';

const EMPTY = { title:'', description:'', category:'plumbing', priority:'medium' };

export default function ResidentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const { user } = useAuthStore();

  const load = () => {
    if (user) window.api.getComplaints({ resident_id: user.id }).then(setComplaints);
  };
  useEffect(() => { load(); }, [user]);

  const onSubmit = async () => {
    if (!form.title) return toast.error('Title is required');
    const res = await window.api.addComplaint({ ...form, resident_id: user.id });
    if (res.success) { toast.success('Complaint submitted successfully'); setModal(false); setForm(EMPTY); load(); }
    else toast.error('Failed to submit complaint');
  };

  const statusColors = { open:'bg-red-50', in_progress:'bg-yellow-50', resolved:'bg-green-50', closed:'bg-gray-50' };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Complaints</h1>
          <p className="text-sm text-gray-500">{complaints.length} complaints raised</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={15}/> Raise Complaint
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <MessageSquare size={36} className="mx-auto mb-3 opacity-30"/>
          <p className="font-medium">No complaints yet</p>
          <p className="text-sm mt-1">Click "Raise Complaint" to report an issue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map(c => (
            <div key={c.id} className={`card ${statusColors[c.status] || ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">#{c.id}</span>
                    <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{c.description}</p>
                  {c.resolution_notes && (
                    <div className="mt-2 p-2 bg-white rounded-lg border border-green-200">
                      <p className="text-xs text-green-700 font-medium">Resolution Note:</p>
                      <p className="text-xs text-gray-600 mt-0.5">{c.resolution_notes}</p>
                    </div>
                  )}
                  <div className="flex gap-3 mt-2 text-xs text-gray-400">
                    <span className="capitalize">{c.category}</span>
                    <span>{c.created_at?.split('T')[0]}</span>
                    {c.assigned_name && <span>Assigned to: {c.assigned_name}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end flex-shrink-0">
                  <Badge variant={priorityVariant(c.priority)}>{c.priority}</Badge>
                  <Badge variant={statusVariant(c.status)}>{formatStatus(c.status)}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Raise a Complaint" size="md">
        <div className="space-y-4">
          <div><label className="label">Subject *</label><input className="input" placeholder="Brief description of the issue" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
          <div><label className="label">Detailed Description</label><textarea className="input" rows={4} placeholder="Describe the problem in detail..." value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="civil">Civil/Structure</option>
                <option value="cleaning">Cleaning</option>
                <option value="noise">Noise</option>
                <option value="security">Security</option>
                <option value="lift">Lift/Elevator</option>
                <option value="parking">Parking</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onSubmit} className="btn-primary flex-1">Submit Complaint</button>
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

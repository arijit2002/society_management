import { useEffect, useState } from 'react';
import { Plus, Trash2, Bell, AlertTriangle, Info } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { toast } from '../../components/Toast';
import { useAuthStore } from '../../store/authStore';

const EMPTY = { title:'', content:'', category:'general', priority:'normal', target_audience:'all', expires_at:'' };

const priorityIcons = {
  urgent: <AlertTriangle size={14} className="text-red-500"/>,
  important: <Bell size={14} className="text-yellow-500"/>,
  normal: <Info size={14} className="text-blue-500"/>,
};

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const { user } = useAuthStore();

  const load = () => window.api.getNotices().then(setNotices);
  useEffect(() => { load(); }, []);

  const onAdd = async () => {
    if (!form.title || !form.content) return toast.error('Title and content are required');
    const res = await window.api.addNotice({ ...form, created_by: user.id });
    if (res.success) { toast.success('Notice posted'); setModal(false); setForm(EMPTY); load(); }
  };

  const onDelete = async () => {
    await window.api.deleteNotice(confirm);
    toast.success('Notice deleted'); setConfirm(null); load();
  };

  const priorityColors = { urgent: 'border-l-4 border-red-500', important: 'border-l-4 border-yellow-400', normal: 'border-l-4 border-blue-300' };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notices & Announcements</h1>
          <p className="text-sm text-gray-500">{notices.length} active notices</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={15}/> Post Notice</button>
      </div>

      <div className="space-y-3">
        {notices.length === 0 && (
          <div className="card text-center py-12 text-gray-400">
            <Bell size={32} className="mx-auto mb-2 opacity-40"/>
            <p>No notices posted yet</p>
          </div>
        )}
        {notices.map(n => (
          <div key={n.id} className={`card ${priorityColors[n.priority] || ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {priorityIcons[n.priority]}
                  <h3 className="font-semibold text-gray-900">{n.title}</h3>
                  <Badge variant={n.priority==='urgent'?'danger':n.priority==='important'?'warning':'info'}>
                    {n.priority}
                  </Badge>
                  <Badge variant="default">{n.category}</Badge>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{n.content}</p>
                <div className="flex gap-4 mt-3 text-xs text-gray-400">
                  <span>Posted by {n.author_name}</span>
                  <span>{n.created_at?.split('T')[0]}</span>
                  {n.expires_at && <span>Expires: {n.expires_at?.split('T')[0]}</span>}
                  <span>For: {n.target_audience}</span>
                </div>
              </div>
              <button onClick={() => setConfirm(n.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                <Trash2 size={15}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Post New Notice" size="md">
        <div className="space-y-4">
          <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
          <div><label className="label">Content *</label><textarea className="input" rows={4} value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))}/></div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                <option value="general">General</option>
                <option value="maintenance">Maintenance</option>
                <option value="meeting">Meeting</option>
                <option value="security">Security</option>
                <option value="finance">Finance</option>
                <option value="event">Event</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="label">Audience</label>
              <select className="input" value={form.target_audience} onChange={e=>setForm(f=>({...f,target_audience:e.target.value}))}>
                <option value="all">All</option>
                <option value="residents">Residents</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
          <div><label className="label">Expiry Date (optional)</label><input type="date" className="input" value={form.expires_at} onChange={e=>setForm(f=>({...f,expires_at:e.target.value}))}/></div>
          <div className="flex gap-3 pt-1">
            <button onClick={onAdd} className="btn-primary flex-1">Post Notice</button>
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!confirm} onConfirm={onDelete} onCancel={() => setConfirm(null)}
        title="Delete Notice" message="This notice will be permanently deleted." confirmLabel="Delete"/>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { UserCheck, Users, LogOut, Plus } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { toast } from '../../components/Toast';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const EMPTY = { visitor_name:'', visitor_phone:'', purpose:'', vehicle_no:'', host_flat:'' };

export default function SecurityDashboard() {
  const [counts, setCounts] = useState({ total:0, inside:0, exited:0 });
  const [insideVisitors, setInsideVisitors] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const { user, societyInfo } = useAuthStore();
  const navigate = useNavigate();

  const loadData = async () => {
    if (!user) return;
    const [c, v] = await Promise.all([
      window.api.getVisitorCounts(user.id),
      window.api.getVisitors({ status: 'inside', guard_id: user.id }),
    ]);
    setCounts(c);
    setInsideVisitors(v);
  };
  useEffect(() => { loadData(); }, [user]);

  const onAddVisitor = async () => {
    if (!form.visitor_name || !form.host_flat) return toast.error('Visitor name and host flat are required');
    const res = await window.api.addVisitor({ ...form, guard_id: user.id });
    if (res.success) { toast.success('Visitor entry logged'); setModal(false); setForm(EMPTY); loadData(); }
    else toast.error('Failed to log entry');
  };

  const onCheckout = async (id, name) => {
    await window.api.checkoutVisitor(id);
    toast.success(`${name} checked out`);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl p-6 text-white">
        <p className="text-slate-300 text-sm">Logged in as</p>
        <h1 className="text-2xl font-bold mt-0.5">{user?.name}</h1>
        <p className="text-slate-300 text-sm mt-1">Security Guard · {societyInfo?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-slate-700">{counts.total}</p>
          <p className="text-sm text-gray-400 mt-1">Today's Visitors</p>
        </div>
        <div className="card text-center border-2 border-blue-200 bg-blue-50">
          <p className="text-3xl font-bold text-blue-600">{counts.inside}</p>
          <p className="text-sm text-blue-500 mt-1">Currently Inside</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">{counts.exited}</p>
          <p className="text-sm text-gray-400 mt-1">Exited Today</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => { setForm(EMPTY); setModal(true); }} className="btn-primary flex items-center gap-2 flex-1 justify-center py-3">
          <Plus size={18}/> Log Visitor Entry
        </button>
        <button onClick={() => navigate('/security/visitors')} className="btn-secondary flex items-center gap-2 px-6">
          View Full Log
        </button>
      </div>

      {/* Currently inside */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Currently Inside ({insideVisitors.length})</h3>
        {insideVisitors.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No visitors currently inside</p>
        ) : (
          <div className="space-y-2">
            {insideVisitors.map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800">{v.visitor_name}</p>
                  <p className="text-xs text-gray-500">
                    {v.purpose && <span>{v.purpose} · </span>}
                    Host: Flat {v.host_flat}
                    {v.vehicle_no && <span> · {v.vehicle_no}</span>}
                  </p>
                  <p className="text-xs text-gray-400">In: {new Date(v.entry_time).toLocaleTimeString()}</p>
                </div>
                <button onClick={() => onCheckout(v.id, v.visitor_name)}
                  className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 px-3 py-1.5 rounded-lg text-sm transition-colors">
                  <LogOut size={13}/> Check Out
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Log Visitor Entry" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Visitor Name *</label><input className="input" value={form.visitor_name} onChange={e=>setForm(f=>({...f,visitor_name:e.target.value}))}/></div>
            <div><label className="label">Phone</label><input className="input" value={form.visitor_phone} onChange={e=>setForm(f=>({...f,visitor_phone:e.target.value}))}/></div>
            <div><label className="label">Host Flat *</label><input className="input" placeholder="e.g. A101" value={form.host_flat} onChange={e=>setForm(f=>({...f,host_flat:e.target.value}))}/></div>
            <div><label className="label">Purpose</label><input className="input" placeholder="e.g. Delivery, Visit" value={form.purpose} onChange={e=>setForm(f=>({...f,purpose:e.target.value}))}/></div>
            <div className="col-span-2"><label className="label">Vehicle Number</label><input className="input" placeholder="e.g. MH01AB1234 (optional)" value={form.vehicle_no} onChange={e=>setForm(f=>({...f,vehicle_no:e.target.value}))}/></div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onAddVisitor} className="btn-primary flex-1 flex items-center justify-center gap-2"><UserCheck size={15}/> Allow Entry</button>
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

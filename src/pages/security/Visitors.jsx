import { useEffect, useState } from 'react';
import { Plus, LogOut, Search } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Badge, statusVariant } from '../../components/Badge';
import { toast } from '../../components/Toast';
import { useAuthStore } from '../../store/authStore';

const EMPTY = { visitor_name:'', visitor_phone:'', purpose:'', vehicle_no:'', host_flat:'' };

export default function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [filter, setFilter] = useState({ status:'', date: new Date().toISOString().split('T')[0] });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const { user } = useAuthStore();

  const load = () => {
    window.api.getVisitors({ ...filter, guard_id: user?.id }).then(setVisitors);
  };
  useEffect(() => { load(); }, [filter, user]);

  const onAddVisitor = async () => {
    if (!form.visitor_name || !form.host_flat) return toast.error('Name and host flat required');
    const res = await window.api.addVisitor({ ...form, guard_id: user.id });
    if (res.success) { toast.success('Entry logged'); setModal(false); setForm(EMPTY); load(); }
  };

  const onCheckout = async (id, name) => {
    await window.api.checkoutVisitor(id);
    toast.success(`${name} checked out`);
    load();
  };

  const inside  = visitors.filter(v => v.status === 'inside').length;
  const exited  = visitors.filter(v => v.status === 'exited').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Visitor Log</h1>
          <p className="text-sm text-gray-500">{visitors.length} entries · {inside} inside · {exited} exited</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={15}/> Log Entry
        </button>
      </div>

      <div className="card py-3">
        <div className="flex gap-3 flex-wrap">
          <input type="date" className="input w-auto text-sm" value={filter.date} onChange={e=>setFilter(f=>({...f,date:e.target.value}))}/>
          <select className="input w-auto text-sm" value={filter.status} onChange={e=>setFilter(f=>({...f,status:e.target.value}))}>
            <option value="">All Status</option>
            <option value="inside">Currently Inside</option>
            <option value="exited">Exited</option>
          </select>
          <button onClick={() => setFilter(f=>({...f,date:''}))} className="btn-secondary text-sm">All Dates</button>
        </div>
      </div>

      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="table-header">
                {['Visitor','Phone','Host Flat','Purpose','Vehicle','Entry Time','Exit Time','Status',''].map(h=>(
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visitors.length===0 && <tr><td colSpan={9} className="text-center py-10 text-gray-400 text-sm">No visitor records found</td></tr>}
              {visitors.map(v => (
                <tr key={v.id} className={`table-row ${v.status==='inside'?'bg-blue-50/50':''}`}>
                  <td className="table-cell font-medium">{v.visitor_name}</td>
                  <td className="table-cell">{v.visitor_phone||'—'}</td>
                  <td className="table-cell font-medium">{v.host_flat||'—'}</td>
                  <td className="table-cell">{v.purpose||'—'}</td>
                  <td className="table-cell">{v.vehicle_no||'—'}</td>
                  <td className="table-cell text-xs">{new Date(v.entry_time).toLocaleString()}</td>
                  <td className="table-cell text-xs">{v.exit_time ? new Date(v.exit_time).toLocaleString() : '—'}</td>
                  <td className="table-cell"><Badge variant={v.status==='inside'?'info':'default'}>{v.status}</Badge></td>
                  <td className="table-cell">
                    {v.status==='inside' && (
                      <button onClick={() => onCheckout(v.id, v.visitor_name)}
                        className="flex items-center gap-1 text-xs bg-white border border-gray-200 hover:border-red-300 hover:text-red-600 px-2 py-1 rounded-lg transition-colors">
                        <LogOut size={11}/> Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Log Visitor Entry" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Visitor Name *</label><input className="input" value={form.visitor_name} onChange={e=>setForm(f=>({...f,visitor_name:e.target.value}))}/></div>
            <div><label className="label">Phone</label><input className="input" value={form.visitor_phone} onChange={e=>setForm(f=>({...f,visitor_phone:e.target.value}))}/></div>
            <div><label className="label">Host Flat *</label><input className="input" placeholder="e.g. A101" value={form.host_flat} onChange={e=>setForm(f=>({...f,host_flat:e.target.value}))}/></div>
            <div><label className="label">Purpose</label><input className="input" placeholder="Delivery / Visit" value={form.purpose} onChange={e=>setForm(f=>({...f,purpose:e.target.value}))}/></div>
            <div className="col-span-2"><label className="label">Vehicle Number (optional)</label><input className="input" value={form.vehicle_no} onChange={e=>setForm(f=>({...f,vehicle_no:e.target.value}))}/></div>
          </div>
          <div className="flex gap-3">
            <button onClick={onAddVisitor} className="btn-primary flex-1">Allow Entry</button>
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

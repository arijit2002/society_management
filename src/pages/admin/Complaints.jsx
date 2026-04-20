import { useEffect, useState } from 'react';
import { Search, Filter, Pencil } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Badge, statusVariant, priorityVariant, formatStatus } from '../../components/Badge';
import { toast } from '../../components/Toast';
import { format } from 'date-fns';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [filters, setFilters] = useState({ status: '', category: '' });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ status:'', priority:'', assigned_to:'', resolution_notes:'' });

  const load = () => window.api.getComplaints(filters).then(setComplaints);
  useEffect(() => { window.api.getStaffList().then(s => setStaff(s.filter(x=>x.role==='maintenance'))); }, []);
  useEffect(() => { load(); }, [filters]);

  const openEdit = (c) => {
    setForm({ status:c.status, priority:c.priority, assigned_to:c.assigned_to||'', resolution_notes:c.resolution_notes||'' });
    setModal(c);
  };

  const onSave = async () => {
    const res = await window.api.updateComplaint(modal.id, form);
    if (res.success) { toast.success('Complaint updated'); setModal(null); load(); }
    else toast.error('Failed');
  };

  const categories = [...new Set(complaints.map(c => c.category))];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Complaints</h1>
        <p className="text-sm text-gray-500">{complaints.length} complaints found</p>
      </div>

      <div className="card py-3">
        <div className="flex gap-3 flex-wrap">
          <select className="input w-auto text-sm" value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value}))}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select className="input w-auto text-sm" value={filters.category} onChange={e=>setFilters(f=>({...f,category:e.target.value}))}>
            <option value="">All Categories</option>
            {categories.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="table-header">
                {['#','Resident','Title','Category','Priority','Status','Assigned To','Date',''].map(h=>(
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {complaints.length===0 && <tr><td colSpan={9} className="text-center py-10 text-gray-400 text-sm">No complaints found</td></tr>}
              {complaints.map(c => (
                <tr key={c.id} className="table-row">
                  <td className="table-cell text-gray-400">#{c.id}</td>
                  <td className="table-cell">
                    <p className="font-medium text-gray-800">{c.resident_name}</p>
                    <p className="text-xs text-gray-400">Flat {c.flat_no}</p>
                  </td>
                  <td className="table-cell">
                    <p className="font-medium text-gray-800">{c.title}</p>
                    <p className="text-xs text-gray-400 max-w-xs truncate">{c.description}</p>
                  </td>
                  <td className="table-cell capitalize">{c.category}</td>
                  <td className="table-cell"><Badge variant={priorityVariant(c.priority)}>{c.priority}</Badge></td>
                  <td className="table-cell"><Badge variant={statusVariant(c.status)}>{formatStatus(c.status)}</Badge></td>
                  <td className="table-cell">{c.assigned_name || <span className="text-gray-400 text-xs">Unassigned</span>}</td>
                  <td className="table-cell text-xs text-gray-400">{c.created_at?.split('T')[0]}</td>
                  <td className="table-cell">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <Pencil size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={`Update Complaint #${modal?.id}`} size="md">
        {modal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-800">{modal.title}</p>
              <p className="text-sm text-gray-500 mt-1">{modal.description}</p>
              <p className="text-xs text-gray-400 mt-2">Raised by {modal.resident_name} · Flat {modal.flat_no}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
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
              <div className="col-span-2">
                <label className="label">Assign to Maintenance Staff</label>
                <select className="input" value={form.assigned_to} onChange={e=>setForm(f=>({...f,assigned_to:e.target.value}))}>
                  <option value="">Unassigned</option>
                  {staff.map(s=><option key={s.id} value={s.id}>{s.name} ({s.designation || 'Staff'})</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Resolution Notes</label>
                <textarea className="input" rows={3} value={form.resolution_notes} onChange={e=>setForm(f=>({...f,resolution_notes:e.target.value}))} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={onSave} className="btn-primary flex-1">Update</button>
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

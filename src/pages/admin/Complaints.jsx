import { useEffect, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Badge, statusVariant, priorityVariant, formatStatus } from '../../components/Badge';
import { toast } from '../../components/Toast';

const CATEGORIES = ['plumbing', 'electrical', 'cleaning', 'security', 'lift', 'parking', 'garden', 'noise', 'other'];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [residents, setResidents] = useState([]);
  const [filters, setFilters] = useState({ status: '', category: '' });
  const [editModal, setEditModal] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [editForm, setEditForm] = useState({ status:'', priority:'', assigned_to:'', resolution_notes:'' });
  const [addForm, setAddForm] = useState({ resident_id:'', title:'', description:'', category:'plumbing', priority:'medium', assigned_to:'' });

  const load = () => window.api.getComplaints(filters).then(setComplaints);

  useEffect(() => {
    window.api.getStaffList().then(s => setStaff(s.filter(x => x.role === 'maintenance')));
    window.api.getResidents().then(setResidents);
  }, []);

  useEffect(() => { load(); }, [filters]);

  const openEdit = (c) => {
    setEditForm({ status: c.status, priority: c.priority, assigned_to: c.assigned_to || '', resolution_notes: c.resolution_notes || '' });
    setEditModal(c);
  };

  const onSave = async () => {
    const res = await window.api.updateComplaint(editModal.id, editForm);
    if (res.success) { toast.success('Complaint updated'); setEditModal(null); load(); }
    else toast.error('Failed to update complaint');
  };

  const onAdd = async () => {
    if (!addForm.resident_id) return toast.error('Please select a resident');
    if (!addForm.title.trim()) return toast.error('Title is required');
    if (!addForm.description.trim()) return toast.error('Description is required');
    const res = await window.api.addComplaint(addForm);
    if (res.success) {
      toast.success('Complaint opened' + (addForm.assigned_to ? ' and assigned' : ''));
      setAddModal(false);
      setAddForm({ resident_id:'', title:'', description:'', category:'plumbing', priority:'medium', assigned_to:'' });
      load();
    } else toast.error('Failed to open complaint');
  };

  const categories = [...new Set(complaints.map(c => c.category))];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Complaints</h1>
          <p className="text-sm text-gray-500">{complaints.length} complaints found</p>
        </div>
        <button onClick={() => setAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Open Complaint
        </button>
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

      {/* Edit Modal */}
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title={`Update Complaint #${editModal?.id}`} size="md">
        {editModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-800">{editModal.title}</p>
              <p className="text-sm text-gray-500 mt-1">{editModal.description}</p>
              <p className="text-xs text-gray-400 mt-2">Raised by {editModal.resident_name} · Flat {editModal.flat_no}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Status</label>
                <select className="input" value={editForm.status} onChange={e=>setEditForm(f=>({...f,status:e.target.value}))}>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select className="input" value={editForm.priority} onChange={e=>setEditForm(f=>({...f,priority:e.target.value}))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Assign to Maintenance Staff</label>
                <select className="input" value={editForm.assigned_to} onChange={e=>setEditForm(f=>({...f,assigned_to:e.target.value}))}>
                  <option value="">Unassigned</option>
                  {staff.map(s=><option key={s.id} value={s.id}>{s.name} ({s.designation || 'Staff'})</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Resolution Notes</label>
                <textarea className="input" rows={3} value={editForm.resolution_notes} onChange={e=>setEditForm(f=>({...f,resolution_notes:e.target.value}))} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={onSave} className="btn-primary flex-1">Update</button>
              <button onClick={() => setEditModal(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Open Complaint Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Open New Complaint" size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Resident</label>
            <select className="input" value={addForm.resident_id} onChange={e=>setAddForm(f=>({...f,resident_id:e.target.value}))}>
              <option value="">Select resident...</option>
              {residents.map(r=><option key={r.id} value={r.id}>{r.name} — Flat {r.flat_no}{r.block ? ` (${r.block})` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Title</label>
            <input className="input" placeholder="Brief complaint title" value={addForm.title} onChange={e=>setAddForm(f=>({...f,title:e.target.value}))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} placeholder="Describe the issue in detail" value={addForm.description} onChange={e=>setAddForm(f=>({...f,description:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={addForm.category} onChange={e=>setAddForm(f=>({...f,category:e.target.value}))}>
                {CATEGORIES.map(c=><option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={addForm.priority} onChange={e=>setAddForm(f=>({...f,priority:e.target.value}))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Assign to Maintenance Staff <span className="text-gray-400 font-normal">(optional)</span></label>
            <select className="input" value={addForm.assigned_to} onChange={e=>setAddForm(f=>({...f,assigned_to:e.target.value}))}>
              <option value="">Unassigned</option>
              {staff.map(s=><option key={s.id} value={s.id}>{s.name} ({s.designation || 'Staff'})</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={onAdd} className="btn-primary flex-1">Open Complaint</button>
            <button onClick={() => setAddModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

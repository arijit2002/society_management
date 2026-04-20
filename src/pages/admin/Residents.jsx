import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Phone, Home } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { toast } from '../../components/Toast';

const EMPTY = { name:'', email:'', phone:'', flat_no:'', block:'A', floor:1, area_sqft:'', ownership_type:'owner', password:'' };

export default function Residents() {
  const [residents, setResidents] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = () => window.api.getResidents().then(setResidents);
  useEffect(() => { load(); }, []);

  const filtered = residents.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.flat_no || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (r) => {
    setForm({ name:r.name, email:r.email, phone:r.phone||'', flat_no:r.flat_no||'', block:r.block||'A',
      floor:r.floor||1, area_sqft:r.area_sqft||'', ownership_type:r.ownership_type||'owner', password:'' });
    setEditing(r.id);
    setModal(true);
  };

  const onSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email are required');
    const res = editing
      ? await window.api.updateResident(editing, form)
      : await window.api.addResident(form);
    if (res.success) { toast.success(editing ? 'Resident updated' : 'Resident added'); setModal(false); load(); }
    else toast.error(res.message || 'Operation failed');
  };

  const onDelete = async () => {
    await window.api.deleteResident(confirm);
    toast.success('Resident removed'); setConfirm(null); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Residents</h1>
          <p className="text-sm text-gray-500">{residents.length} registered residents</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16}/> Add Resident</button>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search residents..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="table-header">
                {['Resident','Flat','Block','Contact','Type',''].map(h => (
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No residents found</td></tr>
              )}
              {filtered.map(r => (
                <tr key={r.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell"><div className="flex items-center gap-1"><Home size={13} className="text-gray-400"/>{r.flat_no || '—'}</div></td>
                  <td className="table-cell">{r.block || '—'}</td>
                  <td className="table-cell"><div className="flex items-center gap-1"><Phone size={13} className="text-gray-400"/>{r.phone || '—'}</div></td>
                  <td className="table-cell">
                    <Badge variant={r.ownership_type === 'owner' ? 'success' : 'info'}>
                      {r.ownership_type === 'owner' ? 'Owner' : 'Tenant'}
                    </Badge>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Pencil size={14}/></button>
                      <button onClick={() => setConfirm(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Resident' : 'Add Resident'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Full Name *</label><input className="input" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} /></div>
            <div><label className="label">Email *</label><input type="email" className="input" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} /></div>
            <div><label className="label">Flat No.</label><input className="input" value={form.flat_no} onChange={e => setForm(f=>({...f,flat_no:e.target.value}))} /></div>
            <div><label className="label">Block</label><input className="input" value={form.block} onChange={e => setForm(f=>({...f,block:e.target.value}))} /></div>
            <div><label className="label">Floor</label><input type="number" className="input" value={form.floor} onChange={e => setForm(f=>({...f,floor:+e.target.value}))} /></div>
            <div><label className="label">Area (sq.ft)</label><input type="number" className="input" value={form.area_sqft} onChange={e => setForm(f=>({...f,area_sqft:+e.target.value}))} /></div>
            <div>
              <label className="label">Ownership Type</label>
              <select className="input" value={form.ownership_type} onChange={e => setForm(f=>({...f,ownership_type:e.target.value}))}>
                <option value="owner">Owner</option>
                <option value="rented">Tenant/Rented</option>
              </select>
            </div>
            {!editing && <div className="col-span-2"><label className="label">Password (default: resident123)</label><input type="password" className="input" placeholder="Leave blank for default" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} /></div>}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onSave} className="btn-primary flex-1">{editing ? 'Update' : 'Add Resident'}</button>
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!confirm} onConfirm={onDelete} onCancel={() => setConfirm(null)}
        title="Remove Resident" message="This will deactivate the resident account. Their data will be retained." confirmLabel="Remove" />
    </div>
  );
}
